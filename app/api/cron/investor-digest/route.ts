/**
 * Weekly investor digest (original audit item #5).
 *
 * For every active investor who is open to deal flow, finds the projects
 * approved in the last ~8 days that match their mandate (shared scorer in
 * lib/match), and sends ONE digest email listing those projects — plus an
 * in-app notification. Investors with no new matches get nothing (no empty
 * mail). A `last_digest_at` guard makes the run idempotent within the week.
 *
 * Auth: Vercel Cron bearer (CRON_SECRET). DB access via service role so it can
 * read every investor profile + project regardless of RLS. Email via Resend
 * (skipped silently if RESEND_API_KEY unset — in-app notifications still fire).
 */

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { scoreMatch, buildFxMap } from "@/lib/match";
import { renderDigestEmail, type DigestProject } from "@/lib/notifications/emails";
import { formatCurrency, SECTOR_LABELS } from "@/lib/utils";
import type { Project, InvestorProfile } from "@/types";

export const dynamic     = "force-dynamic";
export const runtime     = "nodejs";
export const maxDuration = 60;

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const APPROVED_WINDOW_DAYS = 8;   // look-back for "newly approved"
const DIGEST_COOLDOWN_DAYS = 6;   // don't re-send within this window

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://io-capital-hub.vercel.app";
}

async function sendDigest(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false; // no email transport configured — in-app only
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:     process.env.RESEND_FROM || "CEO Summit IO <notifications@realsmartx.com>",
        to:       [to],
        subject, html, text,
        reply_to: process.env.RESEND_REPLY_TO || "capital@ceo-summit.mg",
        headers: {
          "List-Unsubscribe":      `<${siteUrl()}/dashboard/investor-profile>, <mailto:unsubscribe@realsmartx.com>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch { return false; }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) return Response.json({ ok: false, error: "Supabase admin env vars missing" }, { status: 503 });

  const admin = createAdminClient(url, svc, { auth: { persistSession: false } });

  // ── Load the week's approved projects, active investors, FX rates ──
  const sinceApproved = new Date(Date.now() - APPROVED_WINDOW_DAYS * 86400_000).toISOString();
  const cooldownCutoff = new Date(Date.now() - DIGEST_COOLDOWN_DAYS * 86400_000).toISOString();

  const [projRes, invRes, fxRes] = await Promise.all([
    admin.from("projects")
      .select("id,title,sector,amount_requested,currency,normalized_usd_amount,tagline,country,funding_duration_range,reviewed_at")
      .eq("status", "approved")
      .gte("reviewed_at", sinceApproved),
    admin.from("investor_profiles")
      .select("*")
      .eq("is_active", true)
      .eq("open_to_deal_flow", true),
    admin.from("fx_rates").select("currency, rate_to_usd"),
  ]);

  const projects  = (projRes.data ?? []) as (Project & { normalized_usd_amount: number | null })[];
  const investors = (invRes.data ?? []) as InvestorProfile[];
  const fxMap     = buildFxMap(fxRes.data);

  if (projects.length === 0) {
    return Response.json({ ok: true, projectsThisWeek: 0, digestsSent: 0, note: "No newly approved projects." });
  }

  // Batch-load the delivery email for each investor (auth account email).
  const userIds = investors.map(i => i.user_id).filter(Boolean) as string[];
  const { data: emailRows } = userIds.length
    ? await admin.from("profiles").select("id, email, full_name").in("id", userIds)
    : { data: [] as { id: string; email: string | null; full_name: string | null }[] };
  const acct = new Map((emailRows ?? []).map(r => [r.id, r]));

  let emailsSent = 0, inAppSent = 0, skippedCooldown = 0, skippedNoMatch = 0;

  for (const inv of investors) {
    if (!inv.user_id) continue;

    // Cooldown guard — idempotent within the week.
    if (inv.last_digest_at && inv.last_digest_at > cooldownCutoff) { skippedCooldown++; continue; }

    // Score this week's projects; keep matches only.
    const matches: DigestProject[] = [];
    for (const p of projects) {
      const m = scoreMatch(p, inv, fxMap);
      if (m.score === 0) continue;
      const reasons: string[] = [];
      if (m.sector)   reasons.push("Secteur");
      if (m.ticket)   reasons.push("Ticket");
      if (m.geo)      reasons.push("Zone");
      if (m.duration) reasons.push("Durée");
      matches.push({
        title:   p.title,
        sector:  SECTOR_LABELS[p.sector || ""] || p.sector || "—",
        amount:  formatCurrency(p.amount_requested, p.currency),
        tagline: p.tagline,
        reasons,
        link:    `/dashboard/deal-flow/${p.id}`,
      });
    }

    if (matches.length === 0) { skippedNoMatch++; continue; }

    // Best matches first, cap at 6 per email.
    matches.sort((a, b) => b.reasons.length - a.reasons.length);
    const top = matches.slice(0, 6);

    // In-app notification (always, even without email transport).
    await admin.rpc("notify", {
      p_recipient: inv.user_id,
      p_type:      "digest.weekly",
      p_title:     `${matches.length} nouveau${matches.length > 1 ? "x" : ""} dossier${matches.length > 1 ? "s" : ""} pour votre mandat`,
      p_body:      `De nouveaux projets qualifiés correspondent à vos critères cette semaine. Consultez votre deal flow.`,
      p_data:      { link: "/dashboard/deal-flow" },
    });
    inAppSent++;

    // Email digest.
    const acctRow = acct.get(inv.user_id);
    const to = acctRow?.email || inv.email;
    if (to) {
      const { subject, html, text } = renderDigestEmail({
        investorName: (acctRow?.full_name || inv.full_name || "").split(" ")[0] || null,
        projects: top,
      });
      if (await sendDigest(to, subject, html, text)) emailsSent++;
    }

    // Stamp last_digest_at so re-runs this week skip this investor.
    await admin.from("investor_profiles")
      .update({ last_digest_at: new Date().toISOString() })
      .eq("id", inv.id);
  }

  return Response.json({
    ok: true,
    projectsThisWeek: projects.length,
    investorsConsidered: investors.length,
    inAppSent,
    emailsSent,
    skippedCooldown,
    skippedNoMatch,
    ranAt: new Date().toISOString(),
  });
}
