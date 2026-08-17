import type { Project } from "@/types";

/**
 * Capital Readiness — an internal *completeness* assessment of a funding file.
 * It measures how much of the dossier is filled in, across five categories,
 * mirroring the weights already used by the Boost page's calcScore(). It is
 * NOT an investment-quality, credit or funding-probability score.
 *
 * Keep this the single source of truth so the dashboard and the Boost page
 * can never drift apart.
 */

export type ReadinessCategory = {
  key: "team" | "market" | "financials" | "esg" | "docs";
  label: string;         // founder-facing, FR
  score: number;
  max: number;
};

export type Readiness = {
  total: number;         // 0–100
  categories: ReadinessCategory[];
  weakest: ReadinessCategory; // lowest fill ratio — feeds the Next Step
};

type P = Partial<Project>;

export function readinessBreakdown(p: P): Readiness {
  // Team (25)
  let team = 0;
  if (p.founder_bio) team += 8;
  if (p.founder_linkedin) team += 5;
  if (p.founder_experience_years) team += 6;
  if (p.founder_fulltime !== null && p.founder_fulltime !== undefined) team += 6;

  // Market & proposition (25)
  let market = 0;
  if (p.investor_type_sought?.length) market += 8;
  if (p.market_size) market += 7;
  if (p.competition_level) market += 5;
  if (p.competitive_advantage) market += 5;

  // Financial information (25)
  let financials = 0;
  if (p.revenue_y1 || p.monthly_burn_rate) financials += 15;
  if (p.ebitda_margin !== null && p.ebitda_margin !== undefined) financials += 5;
  if (p.growth_rate_12m !== null && p.growth_rate_12m !== undefined) financials += 5;

  // Impact & governance (15)
  let esg = 0;
  if (p.esg_women_leadership !== null && p.esg_women_leadership !== undefined) esg += 4;
  if (p.esg_board_exists !== null && p.esg_board_exists !== undefined) esg += 4;
  if (p.esg_audited) esg += 4;
  if (p.esg_sdgs?.length) esg += 3;

  // Documents (10)
  let docs = 0;
  if (p.documents_available?.length) docs += 10;

  const categories: ReadinessCategory[] = [
    { key: "team",       label: "Équipe & direction",       score: team,       max: 25 },
    { key: "market",     label: "Marché & proposition",     score: market,     max: 25 },
    { key: "financials", label: "Informations financières", score: financials, max: 25 },
    { key: "esg",        label: "Impact & gouvernance",     score: esg,        max: 15 },
    { key: "docs",       label: "Documents",                score: docs,       max: 10 },
  ];

  const total = Math.min(team + market + financials + esg + docs, 100);
  const weakest = [...categories].sort((a, b) => a.score / a.max - b.score / b.max)[0];

  return { total, categories, weakest };
}

/** Founder-facing one-line read on where the file stands. */
export function readinessSummary(total: number): string {
  if (total >= 80) return "Votre dossier est solide. Quelques éléments peuvent encore être affinés avant une approche ciblée d'investisseurs.";
  if (total >= 55) return "Votre dossier est en bonne voie. Plusieurs éléments peuvent être renforcés avant une approche ciblée d'investisseurs.";
  if (total >= 30) return "Votre dossier prend forme. Complétez les sections clés pour gagner en crédibilité auprès des investisseurs.";
  return "Votre dossier débute. Complétez-le pour qu'un investisseur puisse l'évaluer.";
}
