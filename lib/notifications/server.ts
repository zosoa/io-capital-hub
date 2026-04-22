"use server";

/**
 * Server-side notification dispatcher.
 *
 * The DB triggers (see 20260421000001_b8_notifications.sql) create the in-app
 * notification rows automatically whenever a project changes status or a
 * deal_interest is inserted. That path is bulletproof — it fires whether the
 * state change came from an admin UI, a server action, or a direct DB write.
 *
 * This module is the *email side* of the pipeline: after performing the state
 * change in a server action, call `dispatchPendingEmails()` to look for any
 * notifications that were created but not yet emailed, render the right
 * template, hand off to Resend, and mark them sent.
 *
 * If `RESEND_API_KEY` is not set (dev / preview), emails are skipped silently
 * but in-app notifications still show up.
 */

import { createClient } from "@/lib/supabase/server";
import { renderEmail } from "./emails";
import type { NotificationRow, NotificationType } from "@/types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function fromAddress(): string {
  return process.env.RESEND_FROM || "CEO Summit IO <notifications@realsmartx.com>";
}

function replyToAddress(): string {
  return process.env.RESEND_REPLY_TO || "capital@ceo-summit.mg";
}

function unsubscribeUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://io-capital-hub.vercel.app";
  return `${base}/dashboard/notifications`;
}

async function resendSend(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // No key configured — skip silently. Caller still marks notification as
    // "handled" so we don't keep retrying forever.
    return { ok: true, id: "skipped-no-key" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:     fromAddress(),
        to:       [opts.to],
        subject:  opts.subject,
        html:     opts.html,
        text:     opts.text,
        reply_to: replyToAddress(),
        // Deliverability headers — cuts down on Gmail / Outlook spam
        // classification on a fresh sender domain. List-Unsubscribe is
        // required by Gmail's bulk-sender guidelines (Feb 2024+).
        headers: {
          "List-Unsubscribe":      `<${unsubscribeUrl()}>, <mailto:unsubscribe@realsmartx.com>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Entity-Ref-ID":       "ceo-summit-io-notifications",
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = await res.json().catch(() => ({})) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Scans the `notifications` table for recent rows with `email_sent_at IS NULL`
 * belonging to the current user context (plus any admin-scope notifications
 * emitted from the current action's effects) and sends them.
 *
 * Uses a service-role-like approach: we rely on RLS to restrict visibility —
 * admin callers will see admin rows, users see their own. In practice this is
 * called right after a state change, so the queue is short.
 *
 * Returns the number of emails actually dispatched.
 */
export async function dispatchPendingEmails(opts: {
  /** Limit how many to process in one pass. Default 20. */
  limit?: number;
} = {}): Promise<number> {
  const limit = opts.limit ?? 20;
  const supabase = await createClient();

  // Recent unsent emails within the caller's RLS scope.
  const { data: rows } = await supabase
    .from("notifications")
    .select("id, recipient, type, title, body, data, email_sent_at, created_at, read_at")
    .is("email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(limit) as { data: NotificationRow[] | null };

  if (!rows || rows.length === 0) return 0;

  // Build recipient user_id → email lookup from auth.users. Access is via
  // profile.email (mirrored by the signup trigger).
  const ids = Array.from(new Set(rows.map(r => r.recipient)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids) as { data: { id: string; email: string | null; full_name: string | null }[] | null };
  const emailByUser = new Map((profiles ?? []).map(p => [p.id, p.email]));

  let sent = 0;
  for (const row of rows) {
    const to = emailByUser.get(row.recipient);
    if (!to) { await markHandled(row.id); continue; }

    const ctx = row.data as { project_title?: string; link?: string; admin_note_excerpt?: string };
    const tmpl = renderEmail(row.type as NotificationType, {
      projectTitle:     ctx.project_title,
      adminNoteExcerpt: ctx.admin_note_excerpt ?? row.body ?? undefined,
      link:             ctx.link,
    });
    if (!tmpl) { await markHandled(row.id); continue; }

    const result = await resendSend({ to, ...tmpl });
    if (result.ok) {
      await markHandled(row.id);
      sent++;
    }
    // on failure: leave email_sent_at null so next dispatch retries.
  }

  return sent;
}

async function markHandled(id: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", id);
}

/**
 * Manually emit a notification from trusted server code (e.g., when the
 * application logic creates a side-effect we can't capture via DB trigger).
 * Rare — most notifications come from triggers.
 */
export async function notifyUser(
  recipient: string,
  type: NotificationType,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<string | null> {
  const supabase = await createClient();
  const { data: id } = await supabase.rpc("notify", {
    p_recipient: recipient,
    p_type:      type,
    p_title:     title,
    p_body:      body,
    p_data:      data,
  });
  return (id as string) ?? null;
}
