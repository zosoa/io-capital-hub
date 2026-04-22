-- ─────────────────────────────────────────────────────────────────────────────
-- B8 — Notifications system
--
-- A single `notifications` table powers the in-app bell + stores a queue of
-- events that a server-side emailer can iterate over. Triggers on `projects`
-- and `deal_interests` insert rows automatically so any code path (client,
-- server action, or admin UI) that moves state fires the notification.
--
-- Noise policy:
--   - status_changed_to_draft / submitted / under_review / approved / rejected
--     → one notification to the project owner
--   - submitted / under_review → also pings all admins
--   - interest expressed → one to project owner, one to investor, one to admins
--   - duplicate collapse not needed for v1 (users can dismiss)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient   uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type        text NOT NULL,                 -- e.g. project.approved, interest.received
  title       text NOT NULL,                 -- short human summary (≤80 chars)
  body        text,                          -- optional longer description
  data        jsonb DEFAULT '{}'::jsonb,     -- context (project_id, deep link, etc.)
  read_at     timestamptz,
  email_sent_at timestamptz,                 -- set by the emailer once dispatched
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_recipient_idx
  ON public.notifications(recipient, read_at NULLS FIRST, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_pending_email_idx
  ON public.notifications(created_at)
  WHERE email_sent_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipient: read + update (mark read) + delete own
DROP POLICY IF EXISTS notifications_own_read ON public.notifications;
CREATE POLICY notifications_own_read ON public.notifications
  FOR SELECT USING (auth.uid() = recipient OR is_admin());

DROP POLICY IF EXISTS notifications_own_update ON public.notifications;
CREATE POLICY notifications_own_update ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient OR is_admin());

DROP POLICY IF EXISTS notifications_own_delete ON public.notifications;
CREATE POLICY notifications_own_delete ON public.notifications
  FOR DELETE USING (auth.uid() = recipient OR is_admin());

-- No direct INSERT policy — rows only come from SECURITY DEFINER triggers /
-- admin-level server actions. That keeps spoofed client inserts impossible.

-- ── notify() helper (SECURITY DEFINER, bypasses RLS for inserts) ─────────────
CREATE OR REPLACE FUNCTION public.notify(
  p_recipient uuid,
  p_type      text,
  p_title     text,
  p_body      text,
  p_data      jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (recipient, type, title, body, data)
    VALUES (p_recipient, p_type, p_title, LEFT(p_body, 2000), COALESCE(p_data, '{}'::jsonb))
    RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Helper: fan-out to all admins
CREATE OR REPLACE FUNCTION public.notify_admins(
  p_type text, p_title text, p_body text, p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    PERFORM public.notify(r.id, p_type, p_title, p_body, p_data);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ── Trigger: projects status / admin_notes_public changes ───────────────────
CREATE OR REPLACE FUNCTION public.projects_notify_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title   text;
  v_body    text;
  v_type    text;
  v_data    jsonb;
BEGIN
  v_data := jsonb_build_object(
    'project_id',    NEW.id,
    'project_title', NEW.title,
    'link',          '/dashboard/projects/' || NEW.id
  );

  -- ── INSERT path: project was created already submitted (no draft step) ──
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

  -- ── UPDATE path ──
  -- Status transition
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_type := 'project.' || NEW.status;

    CASE NEW.status
      WHEN 'submitted' THEN
        v_title := 'Dossier soumis avec succès';
        v_body  := 'Votre dossier « ' || NEW.title || ' » a été soumis. Notre équipe l''examine sous 48h.';
        -- also alert admins
        PERFORM public.notify_admins(
          'admin.project_submitted',
          'Nouveau dossier à examiner',
          '« ' || NEW.title || ' » vient d''être soumis.',
          v_data || jsonb_build_object('link', '/admin/projects/' || NEW.id));
      WHEN 'under_review' THEN
        v_title := 'Votre dossier est en cours d''examen';
        v_body  := 'L''équipe a démarré l''analyse de « ' || NEW.title || ' ».';
      WHEN 'approved' THEN
        v_title := 'Dossier qualifié 🎉';
        v_body  := 'Félicitations — « ' || NEW.title || ' » a été validé et est présenté à notre réseau d''investisseurs.';
      WHEN 'rejected' THEN
        v_title := 'Votre dossier n''a pas été retenu';
        v_body  := COALESCE(NEW.admin_notes_public,
                            'Consultez les retours de notre équipe pour améliorer votre présentation.');
      WHEN 'funded' THEN
        v_title := 'Financement obtenu 🎉';
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

  -- Admin note was added / updated (and status didn't change — avoid double ping)
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

DROP TRIGGER IF EXISTS projects_notify_change_trigger ON public.projects;
CREATE TRIGGER projects_notify_change_trigger
  AFTER INSERT OR UPDATE OF status, admin_notes_public
  ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.projects_notify_change();

-- ── Trigger: deal_interests INSERT → owner + investor + admins ───────────────
CREATE OR REPLACE FUNCTION public.deal_interests_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project   record;
  v_investor  record;
  v_data      jsonb;
BEGIN
  SELECT id, title, user_id INTO v_project
    FROM public.projects WHERE id = NEW.project_id;

  SELECT id, full_name, organization INTO v_investor
    FROM public.profiles WHERE id = NEW.investor_user_id;

  v_data := jsonb_build_object(
    'project_id',    v_project.id,
    'project_title', v_project.title,
    'interest_id',   NEW.id,
    'link',          '/dashboard/projects/' || v_project.id
  );

  -- → project owner
  IF v_project.user_id IS NOT NULL THEN
    PERFORM public.notify(v_project.user_id,
      'project.interest_received',
      'Un investisseur s''intéresse à votre dossier',
      'Un investisseur de notre réseau a exprimé son intérêt pour « ' || v_project.title
        || ' ». Notre équipe organise une mise en relation confidentielle.',
      v_data);
  END IF;

  -- → investor — confirmation
  PERFORM public.notify(NEW.investor_user_id,
    'interest.submitted',
    'Intérêt transmis à notre équipe',
    'Nous avons bien reçu votre intérêt pour « ' || v_project.title
      || ' ». Notre équipe vous contactera pour organiser l''introduction.',
    jsonb_build_object('project_id', v_project.id, 'project_title', v_project.title,
                        'link', '/dashboard/deal-flow/' || v_project.id));

  -- → admins — action required
  PERFORM public.notify_admins(
    'admin.interest_expressed',
    'Nouvelle expression d''intérêt à faciliter',
    COALESCE(v_investor.full_name, 'Un investisseur')
      || ' s''intéresse à « ' || v_project.title || ' ».',
    v_data || jsonb_build_object(
      'investor_id', NEW.investor_user_id,
      'link', '/admin/projects/' || v_project.id));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deal_interests_notify_trigger ON public.deal_interests;
CREATE TRIGGER deal_interests_notify_trigger
  AFTER INSERT ON public.deal_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.deal_interests_notify();

COMMENT ON TABLE public.notifications IS
  'Per-user notification log. Rows are created by SECURITY DEFINER triggers on projects/deal_interests.';
COMMENT ON FUNCTION public.notify(uuid,text,text,text,jsonb) IS
  'SECURITY DEFINER helper for inserting a notification. Callable from other triggers/RPCs.';
