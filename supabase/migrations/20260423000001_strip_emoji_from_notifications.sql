-- ─────────────────────────────────────────────────────────────────────────────
-- H-4 — Strip 🎉 emoji from trigger-generated notification titles
--
-- Audit flagged emoji in French business notifications as off-brand. Replaces
-- `projects_notify_change()` with an identical body minus the two emojis
-- ("Dossier qualifié 🎉" → "Dossier qualifié", "Financement obtenu 🎉" → …).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.projects_notify_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text; v_body text; v_type text; v_data jsonb;
BEGIN
  v_data := jsonb_build_object(
    'project_id',    NEW.id,
    'project_title', NEW.title,
    'link',          '/dashboard/projects/' || NEW.id
  );

  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'submitted' THEN
      PERFORM public.notify(NEW.user_id,
        'project.submitted',
        'Votre dossier a été soumis',
        'Nous avons bien reçu « ' || NEW.title || ' ». Notre équipe l''examine sous 48h.',
        v_data);
      PERFORM public.notify_admins(
        'admin.project_submitted',
        'Nouveau dossier à examiner',
        '« ' || NEW.title || ' » vient d''être soumis.',
        v_data || jsonb_build_object('link', '/admin/projects/' || NEW.id));
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_type := 'project.' || NEW.status;

    CASE NEW.status
      WHEN 'submitted' THEN
        v_title := 'Dossier soumis avec succès';
        v_body  := 'Votre dossier « ' || NEW.title || ' » a été soumis. Notre équipe l''examine sous 48h.';
        PERFORM public.notify_admins(
          'admin.project_submitted',
          'Nouveau dossier à examiner',
          '« ' || NEW.title || ' » vient d''être soumis.',
          v_data || jsonb_build_object('link', '/admin/projects/' || NEW.id));
      WHEN 'under_review' THEN
        v_title := 'Votre dossier est en cours d''examen';
        v_body  := 'L''équipe a démarré l''analyse de « ' || NEW.title || ' ».';
      WHEN 'approved' THEN
        v_title := 'Dossier qualifié';
        v_body  := 'Félicitations — « ' || NEW.title || ' » a été validé et est présenté à notre réseau d''investisseurs.';
      WHEN 'rejected' THEN
        v_title := 'Votre dossier n''a pas été retenu';
        v_body  := COALESCE(NEW.admin_notes_public,
                            'Consultez les retours de notre équipe pour améliorer votre présentation.');
      WHEN 'funded' THEN
        v_title := 'Financement obtenu';
        v_body  := '« ' || NEW.title || ' » a trouvé son financement via CEO Summit IO.';
      WHEN 'withdrawn' THEN
        v_title := 'Dossier retiré';
        v_body  := 'Vous avez retiré « ' || NEW.title || ' » du processus.';
      ELSE
        v_title := 'Statut mis à jour';
        v_body  := 'Le statut de « ' || NEW.title || ' » est maintenant : ' || NEW.status || '.';
    END CASE;

    PERFORM public.notify(NEW.user_id, v_type, v_title, v_body, v_data);
  END IF;

  IF NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.admin_notes_public IS DISTINCT FROM OLD.admin_notes_public
     AND NEW.admin_notes_public IS NOT NULL
     AND LENGTH(TRIM(NEW.admin_notes_public)) > 0
  THEN
    PERFORM public.notify(NEW.user_id,
      'project.admin_note',
      'Nouveau message de l''équipe',
      'L''équipe a ajouté des retours sur « ' || NEW.title || ' » : ' || LEFT(NEW.admin_notes_public, 160),
      v_data);
  END IF;

  RETURN NEW;
END;
$$;
