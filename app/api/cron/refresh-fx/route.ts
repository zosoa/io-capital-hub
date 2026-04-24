/**
 * Scheduled FX-rates refresh (audit D-1).
 *
 * Triggered weekly by Vercel Cron (see vercel.json). Pulls latest USD-based
 * rates from open.er-api.com (free, no API key required), inverts into
 * `rate_to_usd` semantics (USD-equivalent of 1 unit of currency X), and
 * upserts into public.fx_rates.
 *
 * Auth: Vercel Cron passes `Authorization: Bearer <CRON_SECRET>`. The route
 * rejects anything without a matching token. The DB upsert uses the service
 * role key to bypass the `fx_rates_admin_write` RLS policy (admins-only) —
 * this key is server-only, never exposed to clients.
 *
 * Failure modes:
 *   - Upstream API 5xx / network error  → route returns 502, next run retries.
 *   - One currency missing from response → other currencies still update;
 *     the stale row is left alone (never zeroed).
 *   - Misconfigured env → route returns 503 with a clear message.
 */

import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic  = "force-dynamic";
export const runtime  = "nodejs";
// Safety valve: Vercel default per-function timeout is 10s; this one can wait
// a beat for the upstream.
export const maxDuration = 30;

const TARGET_CURRENCIES = ["EUR", "MGA", "MUR", "XOF", "KES", "ZAR"] as const;

type Er = { result: string; base_code: string; rates: Record<string, number> };

export async function GET(request: Request) {
  // ── 1. Auth check ─────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Fetch upstream ─────────────────────────────────────────────
  let remote: Er;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
      // 10s hard timeout on the upstream call.
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return Response.json({ ok: false, error: `Upstream HTTP ${res.status}` }, { status: 502 });
    }
    remote = await res.json() as Er;
    if (remote.result !== "success" || !remote.rates) {
      return Response.json({ ok: false, error: "Upstream payload malformed" }, { status: 502 });
    }
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Upstream fetch failed" }, { status: 502 });
  }

  // ── 3. Upsert with service-role client ────────────────────────────
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svcKey) {
    return Response.json({ ok: false, error: "Supabase admin env vars missing" }, { status: 503 });
  }

  const admin = createAdminClient(url, svcKey, {
    auth: { persistSession: false },
  });

  const computedRows: { currency: string; rate_to_usd: number }[] = [
    { currency: "USD", rate_to_usd: 1 }, // canonical identity row
  ];
  for (const cur of TARGET_CURRENCIES) {
    const unitsPerUsd = remote.rates[cur];
    if (typeof unitsPerUsd !== "number" || unitsPerUsd <= 0) continue;
    // rate_to_usd = USD equivalent of 1 unit of the currency
    computedRows.push({ currency: cur, rate_to_usd: 1 / unitsPerUsd });
  }

  const { error, data } = await admin
    .from("fx_rates")
    .upsert(
      computedRows.map(r => ({ ...r, updated_at: new Date().toISOString() })),
      { onConflict: "currency" },
    )
    .select("currency,rate_to_usd");

  if (error) {
    return Response.json({ ok: false, error: `DB write: ${error.message}` }, { status: 500 });
  }

  return Response.json({
    ok: true,
    updated: data?.length ?? 0,
    rates: data,
    fetched_at: new Date().toISOString(),
  });
}
