import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  // Simple merge without tailwind-merge for now
  return clsx(inputs);
}

export function formatCurrency(amount: number | null, currency = "USD"): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Light-background–compatible status colours (work on cream #EEEAE3 and white)
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:        { label: "Brouillon",  color: "text-[#8A8FA8]",   bg: "bg-[#F0EEE9]" },
  submitted:    { label: "Soumis",     color: "text-blue-600",    bg: "bg-blue-50" },
  under_review: { label: "En revue",   color: "text-amber-600",   bg: "bg-amber-50" },
  approved:     { label: "Approuvé",   color: "text-green-700",   bg: "bg-green-50" },
  rejected:     { label: "Refusé",     color: "text-red-600",     bg: "bg-red-50" },
  closed:       { label: "Clôturé",    color: "text-[#8A8FA8]",   bg: "bg-[#F0EEE9]" },
  funded:       { label: "Financé",    color: "text-emerald-700", bg: "bg-emerald-50" },
  withdrawn:    { label: "Retiré",     color: "text-[#8A8FA8]",   bg: "bg-[#F0EEE9]" },
};

export const SECTOR_LABELS: Record<string, string> = {
  energy:            "Énergie",
  agriculture:       "Agriculture",
  tech:              "Technologie",
  real_estate:       "Immobilier",
  infrastructure:    "Infrastructure",
  manufacturing:     "Industrie",
  tourism:           "Tourisme",
  health:            "Santé",
  education:         "Éducation",
  financial_services:"Services financiers",
  other:             "Autre",
};

export const STAGE_LABELS: Record<string, string> = {
  idea:          "Idée / Concept",
  pre_revenue:   "Démarrage (0–2 ans)",
  early_revenue: "Premiers revenus",
  growth:        "Croissance (2–5 ans)",
  expansion:     "Expansion / Internationalisation",
  bridge:        "Restructuration / Refinancement",
};

export const FUNDING_TYPE_LABELS: Record<string, string> = {
  debt:      "Emprunt / Prêt",
  equity:    "Partenariat / Co-actionnaire",
  mezzanine: "Financement hybride",
  grant:     "Subvention / Don",
  hybrid:    "Combinaison d'instruments",
};
