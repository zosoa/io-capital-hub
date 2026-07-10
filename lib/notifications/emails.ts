/**
 * Email template library — pure HTML strings.
 *
 * Kept simple on purpose: one function per notification type, returning
 * `{ subject, html, text }`. No templating engine, no framework deps — easier
 * to preview in any email client and easier to edit.
 *
 * Styling: inline only (Gmail strips <style> tags). Sticks to the site
 * palette (gold #B8913A on dark #07090F) but uses a white body for readability.
 */

import type { NotificationType } from "@/types";

const BRAND_GOLD  = "#B8913A";
const BRAND_DARK  = "#07090F";
const MUTED_TEXT  = "#5A6280";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://io-capital-hub.vercel.app";
}

// ─── Layout shell ────────────────────────────────────────────────────────────
function shell(opts: {
  preheader: string;
  headline: string;
  intro: string;
  ctaLabel?: string;
  ctaHref?: string;
  body?: string;
  footerNote?: string;
}): string {
  const { preheader, headline, intro, ctaLabel, ctaHref, body, footerNote } = opts;
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escape(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F1320;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F4EF;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fff;border:1px solid #E8E2D9;border-radius:12px;overflow:hidden;">
      <tr><td style="background:${BRAND_DARK};padding:20px 28px;">
        <div style="color:${BRAND_GOLD};font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">CEO Summit IO — Investment Hub</div>
        <div style="color:#fff;font-size:14px;font-weight:600;margin-top:4px;">Cluster Capital &amp; Finance</div>
      </td></tr>
      <tr><td style="padding:32px 28px 8px 28px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#0F1320;margin:0 0 12px 0;font-weight:700;">
          ${escape(headline)}
        </h1>
        <p style="font-size:15px;line-height:1.55;color:#3A3F52;margin:0 0 ${body ? "20" : "28"}px 0;">
          ${escape(intro)}
        </p>
        ${body ? `<div style="font-size:14px;line-height:1.6;color:${MUTED_TEXT};background:#FBF8F3;border:1px solid #E8D9B5;border-radius:8px;padding:14px 16px;margin:0 0 24px 0;">${body}</div>` : ""}
        ${ctaLabel && ctaHref ? `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>
          <a href="${ctaHref}" style="display:inline-block;background:${BRAND_GOLD};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:6px;">
            ${escape(ctaLabel)} →
          </a>
        </td></tr></table>` : ""}
      </td></tr>
      <tr><td style="padding:24px 28px 28px 28px;border-top:1px solid #EDE7DE;margin-top:24px;">
        <p style="font-size:12px;line-height:1.5;color:#8A8FA8;margin:0;">
          ${footerNote ? escape(footerNote) + "<br/><br/>" : ""}
          Cet email vous a été envoyé car vous êtes inscrit sur CEO Summit IO — Investment Hub.
          <a href="${siteUrl()}/dashboard/notifications" style="color:${BRAND_GOLD};text-decoration:none;">Gérer mes notifications</a>.
        </p>
      </td></tr>
    </table>
    <div style="color:#8A8FA8;font-size:11px;margin-top:16px;">© 2026 CEO Summit IO · capital@ceo-summit.mg</div>
  </td></tr>
</table>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── Weekly investor digest ──────────────────────────────────────────────────
export interface DigestProject {
  title: string;
  sector: string;      // display label, already resolved
  amount: string;      // formatted currency, already resolved (or "—")
  tagline: string | null;
  reasons: string[];   // e.g. ["Secteur", "Ticket", "Zone"]
  link: string;        // absolute or site-relative
}

/**
 * One weekly email listing the new approved projects that match an investor's
 * mandate. Only sent when `projects` is non-empty (the cron skips empties).
 */
export function renderDigestEmail(opts: {
  investorName: string | null;
  projects: DigestProject[];
}): EmailOutput {
  const { investorName, projects } = opts;
  const n = projects.length;
  const greeting = investorName ? `Bonjour ${investorName},` : "Bonjour,";
  const dealFlowUrl = `${siteUrl()}/dashboard/deal-flow`;

  const cards = projects.map(p => {
    const href = p.link.startsWith("http") ? p.link : `${siteUrl()}${p.link}`;
    const reasonChips = p.reasons.map(r =>
      `<span style="display:inline-block;font-size:10px;font-weight:600;color:${BRAND_GOLD};background:#FBF3E0;border:1px solid #E8D9B5;border-radius:20px;padding:2px 8px;margin:0 4px 4px 0;">${escape(r)}</span>`
    ).join("");
    return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;background:#fff;border:1px solid #E8E2D9;border-radius:10px;">
      <tr><td style="padding:16px 18px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND_GOLD};margin-bottom:6px;">${escape(p.sector)}</div>
        <a href="${href}" style="font-size:16px;font-weight:700;color:#0F1320;text-decoration:none;">${escape(p.title)}</a>
        ${p.tagline ? `<p style="font-size:13px;line-height:1.5;color:${MUTED_TEXT};margin:6px 0 10px 0;">${escape(p.tagline)}</p>` : `<div style="height:8px"></div>`}
        <div style="margin-bottom:10px;">${reasonChips}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="font-size:14px;font-weight:700;color:#0F1320;">${escape(p.amount)}</td>
          <td align="right"><a href="${href}" style="font-size:12px;font-weight:600;color:${BRAND_GOLD};text-decoration:none;">Voir le dossier →</a></td>
        </tr></table>
      </td></tr>
    </table>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Nouvelles opportunités pour votre mandat</title>
</head>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F1320;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${n} nouveau${n > 1 ? "x" : ""} dossier${n > 1 ? "s" : ""} correspond${n > 1 ? "ent" : ""} à votre mandat cette semaine.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F4EF;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
      <tr><td style="background:${BRAND_DARK};padding:20px 28px;border-radius:12px 12px 0 0;">
        <div style="color:${BRAND_GOLD};font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">CEO Summit IO — Investment Hub</div>
        <div style="color:#fff;font-size:14px;font-weight:600;margin-top:4px;">Votre deal flow hebdomadaire</div>
      </td></tr>
      <tr><td style="background:#fff;padding:28px 28px 8px 28px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#0F1320;margin:0 0 10px 0;font-weight:700;">
          ${n} nouveau${n > 1 ? "x" : ""} dossier${n > 1 ? "s" : ""} pour votre mandat
        </h1>
        <p style="font-size:15px;line-height:1.55;color:#3A3F52;margin:0 0 20px 0;">
          ${escape(greeting)} Voici les dossiers qualifiés cette semaine qui correspondent à vos critères
          d'investissement (secteur, ticket, zone géographique, durée).
        </p>
      </td></tr>
      <tr><td style="background:#fff;padding:0 28px 8px 28px;">
        ${cards}
      </td></tr>
      <tr><td style="background:#fff;padding:12px 28px 28px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>
          <a href="${dealFlowUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:6px;">
            Voir tout le deal flow →
          </a>
        </td></tr></table>
      </td></tr>
      <tr><td style="background:#fff;padding:24px 28px 28px 28px;border-top:1px solid #EDE7DE;border-radius:0 0 12px 12px;">
        <p style="font-size:12px;line-height:1.5;color:#8A8FA8;margin:0;">
          Vous recevez ce résumé car vous êtes membre du réseau investisseur et ouvert au deal flow.
          <a href="${siteUrl()}/dashboard/investor-profile" style="color:${BRAND_GOLD};text-decoration:none;">Ajuster mes préférences</a>.
        </p>
      </td></tr>
    </table>
    <div style="color:#8A8FA8;font-size:11px;margin-top:16px;">© 2026 CEO Summit IO · capital@ceo-summit.mg</div>
  </td></tr>
</table>
</body></html>`;

  const text = `${greeting}\n\n${n} nouveau${n > 1 ? "x" : ""} dossier${n > 1 ? "s" : ""} qualifié${n > 1 ? "s" : ""} correspondent à votre mandat cette semaine :\n\n`
    + projects.map(p => `• ${p.title} — ${p.sector} — ${p.amount}\n  ${p.reasons.join(", ")}\n  ${p.link.startsWith("http") ? p.link : siteUrl() + p.link}`).join("\n\n")
    + `\n\nVoir tout le deal flow : ${dealFlowUrl}`;

  return {
    subject: `${n} nouveau${n > 1 ? "x" : ""} dossier${n > 1 ? "s" : ""} pour votre mandat — CEO Summit IO`,
    html,
    text,
  };
}

// ─── Template map ────────────────────────────────────────────────────────────
export interface EmailOutput { subject: string; html: string; text: string; }

interface TemplateCtx {
  projectTitle?: string;
  adminNoteExcerpt?: string;
  link?: string;
}

export function renderEmail(type: NotificationType, ctx: TemplateCtx): EmailOutput | null {
  const url = ctx.link ? `${siteUrl()}${ctx.link}` : siteUrl();
  const project = ctx.projectTitle || "votre dossier";

  switch (type) {
    case "project.submitted":
      return {
        subject: `Dossier « ${project} » — bien reçu`,
        html: shell({
          preheader: "Votre dossier a été soumis. Examen sous 48h.",
          headline:  "Votre dossier a bien été soumis",
          intro:     `Nous avons reçu votre dossier « ${project} ». L'équipe Cluster Capital & Finance va l'examiner dans les 48 heures ouvrables.`,
          body:      `<strong>Prochaines étapes :</strong><br/>1. Examen et qualification par notre équipe<br/>2. Si validé, présentation confidentielle à notre réseau d'investisseurs<br/>3. Mise en relation ciblée selon les mandats qui correspondent.`,
          ctaLabel:  "Voir mon dossier",
          ctaHref:   url,
        }),
        text: `Votre dossier « ${project} » a bien été soumis. L'équipe Cluster Capital & Finance va l'examiner sous 48h.\n\nAccédez à votre espace : ${url}`,
      };

    case "project.under_review":
      return {
        subject: `Dossier « ${project} » — en cours d'examen`,
        html: shell({
          preheader: "L'équipe a démarré l'analyse de votre dossier.",
          headline:  "Votre dossier est en cours d'examen",
          intro:     `Bonne nouvelle : notre équipe a démarré l'analyse de « ${project} ». Nous vous recontactons si nous avons besoin d'informations supplémentaires.`,
          ctaLabel:  "Consulter mon dossier",
          ctaHref:   url,
        }),
        text: `Votre dossier « ${project} » est en cours d'examen par notre équipe.\n\n${url}`,
      };

    case "project.approved":
      return {
        subject: `Dossier « ${project} » qualifié`,
        html: shell({
          preheader: "Votre dossier a été validé et est présenté à notre réseau d'investisseurs.",
          headline:  "Félicitations — votre dossier a été qualifié",
          intro:     `« ${project} » a passé la phase de qualification. Il est désormais visible par notre réseau d'investisseurs préqualifiés en Océan Indien et en Afrique.`,
          body:      `Nous vous notifierons dès qu'un investisseur de notre réseau manifeste son intérêt. Vous pouvez consulter l'activité de votre dossier à tout moment.`,
          ctaLabel:  "Voir l'activité de mon dossier",
          ctaHref:   url,
        }),
        text: `Félicitations — « ${project} » a été qualifié et est présenté à notre réseau d'investisseurs.\n\n${url}`,
      };

    case "project.rejected":
      return {
        subject: `Dossier « ${project} » — retours de l'équipe`,
        html: shell({
          preheader: "Votre dossier n'a pas été retenu. Retours constructifs pour améliorer.",
          headline:  "Votre dossier n'a pas été retenu",
          intro:     `Après examen, « ${project} » n'a pas été retenu pour cette session. Voici les retours de notre équipe pour vous aider à améliorer votre présentation.`,
          body:      ctx.adminNoteExcerpt
            ? escape(ctx.adminNoteExcerpt)
            : "Consultez les retours complets dans votre espace.",
          ctaLabel:  "Réviser et resoumettre",
          ctaHref:   url,
          footerNote: "Un dossier non retenu peut être retravaillé et resoumis — nous encourageons les itérations.",
        }),
        text: `« ${project} » n'a pas été retenu. Retours : ${ctx.adminNoteExcerpt || "voir dans votre espace"}.\n\n${url}`,
      };

    case "project.admin_note":
      return {
        subject: `Message de l'équipe — « ${project} »`,
        html: shell({
          preheader: "Nouveau message de notre équipe sur votre dossier.",
          headline:  "Nouveau message de l'équipe",
          intro:     `L'équipe Cluster Capital & Finance a ajouté des retours sur « ${project} ».`,
          body:      ctx.adminNoteExcerpt ? escape(ctx.adminNoteExcerpt) : "",
          ctaLabel:  "Lire le message complet",
          ctaHref:   url,
        }),
        text: `Nouveau message sur « ${project} » : ${ctx.adminNoteExcerpt || "voir dans votre espace"}.\n\n${url}`,
      };

    case "project.interest_received":
      return {
        subject: `Un investisseur s'intéresse à « ${project} »`,
        html: shell({
          preheader: "Un investisseur qualifié vient d'exprimer son intérêt.",
          headline:  "Un investisseur s'intéresse à votre dossier",
          intro:     `Un investisseur de notre réseau a exprimé son intérêt pour « ${project} ». Notre équipe organise la mise en relation confidentielle.`,
          body:      `Vous pouvez suivre toutes les expressions d'intérêt reçues sur votre dossier depuis l'onglet <strong>Activité</strong>.`,
          ctaLabel:  "Voir l'activité de mon dossier",
          ctaHref:   url,
        }),
        text: `Un investisseur s'intéresse à « ${project} ». Notre équipe organise la mise en relation.\n\n${url}`,
      };

    case "interest.submitted":
      return {
        subject: `Intérêt pour « ${project} » — bien reçu`,
        html: shell({
          preheader: "Nous avons bien transmis votre intérêt au porteur.",
          headline:  "Votre intérêt a bien été transmis",
          intro:     `Nous avons enregistré votre intérêt pour « ${project} ». Notre équipe vous recontactera pour organiser une introduction confidentielle avec le porteur de projet.`,
          body:      `Aucune information confidentielle n'est partagée avant votre accord mutuel.`,
          ctaLabel:  "Revoir le dossier",
          ctaHref:   url,
        }),
        text: `Votre intérêt pour « ${project} » a été transmis. Notre équipe vous recontactera.\n\n${url}`,
      };

    case "admin.project_submitted":
      return {
        subject: `[Admin] Nouveau dossier — ${project}`,
        html: shell({
          preheader: "Un nouveau dossier vient d'être soumis.",
          headline:  "Nouveau dossier à examiner",
          intro:     `« ${project} » vient d'être soumis sur la plateforme.`,
          ctaLabel:  "Examiner le dossier",
          ctaHref:   url,
        }),
        text: `Nouveau dossier à examiner : ${project}. ${url}`,
      };

    case "admin.interest_expressed":
      return {
        subject: `[Admin] Intérêt exprimé — ${project}`,
        html: shell({
          preheader: "Un investisseur souhaite être introduit au porteur.",
          headline:  "Nouvelle expression d'intérêt à faciliter",
          intro:     `Un investisseur a exprimé son intérêt pour « ${project} ». Une mise en relation est requise.`,
          ctaLabel:  "Voir le dossier",
          ctaHref:   url,
        }),
        text: `Intérêt exprimé sur « ${project} ». ${url}`,
      };

    default:
      return null;
  }
}
