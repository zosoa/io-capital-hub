import type { Project, InvestorProfile } from "@/types";
import { expandZones, zoneMatches } from "@/lib/zones";

/**
 * Shared project ↔ investor matching logic (used by the investor deal-flow
 * scorer AND the admin match-suggestion panel).
 *
 * Four binary criteria, summed into a 0–4 score:
 *   1. Sector   — investor.priority_sectors includes project.sector (DB keys)
 *   2. Ticket   — project's USD-normalized amount falls inside the investor's
 *                 ticket range (investor range converted to USD via fx_rates)
 *   3. Geo      — project.country is inside the investor's zone expansion
 *                 ("Région Océan Indien" → member countries, "International"
 *                 → all, single country → itself)
 *   4. Duration — investor.duration_prefs includes project.funding_duration_range
 *
 * Unlike the old inline scorer this returns a per-criterion breakdown so the
 * admin UI can label WHY a given investor matched.
 */

export type FxMap = Map<string, number>; // currency → rate_to_usd

export function buildFxMap(rows: { currency: string; rate_to_usd: number | string }[] | null | undefined): FxMap {
  const m: FxMap = new Map();
  m.set("USD", 1);
  for (const r of rows ?? []) {
    const rate = typeof r.rate_to_usd === "string" ? Number(r.rate_to_usd) : r.rate_to_usd;
    if (Number.isFinite(rate) && rate > 0) m.set(r.currency, rate);
  }
  return m;
}

export interface MatchDetail {
  score: number;   // 0–4
  sector: boolean;
  ticket: boolean;
  geo: boolean;
  duration: boolean;
}

type ProjectMatchFields =
  Pick<Project, "sector" | "amount_requested" | "country" | "funding_duration_range">
  & { normalized_usd_amount?: number | null };

export function scoreMatch(
  project: ProjectMatchFields,
  inv: InvestorProfile | null | undefined,
  fx: FxMap,
): MatchDetail {
  const empty: MatchDetail = { score: 0, sector: false, ticket: false, geo: false, duration: false };
  if (!inv) return empty;

  const sector = !!inv.priority_sectors?.includes(project.sector || "");

  // Ticket — normalize the investor's range to USD, compare vs project USD.
  let ticket = false;
  const usdProject = project.normalized_usd_amount ?? project.amount_requested;
  const fxToUsd = fx.get(inv.ticket_currency || "USD") ?? 1;
  if (inv.ticket_min != null && inv.ticket_max != null && usdProject != null && fxToUsd > 0) {
    const minUsd = inv.ticket_min * fxToUsd;
    const maxUsd = inv.ticket_max * fxToUsd;
    ticket = usdProject >= minUsd && usdProject <= maxUsd;
  }

  // Geo — expand the investor's zones and test the project's country.
  const geo = zoneMatches(expandZones(inv.geographic_zones ?? null), project.country);

  const duration = !!(
    inv.duration_prefs && inv.duration_prefs.length > 0 &&
    project.funding_duration_range &&
    inv.duration_prefs.includes(project.funding_duration_range)
  );

  const score = [sector, ticket, geo, duration].filter(Boolean).length;
  return { score, sector, ticket, geo, duration };
}
