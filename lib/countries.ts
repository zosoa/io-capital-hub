/**
 * Canonical country list used across every form that asks for a country
 * (signup, user profile, project wizard, project edit, investor profile).
 *
 * Previously each page maintained its own subset — signup/profile/project had
 * 13, investor-profile had 9 — so a Mozambican investor would sign up with
 * "Mozambique" and then see "Autre" in the investor-profile page. Audit item
 * I-H3 fixed by pointing every page at this single constant.
 *
 * Order: most-likely Indian-Ocean origins first, then continental neighbours,
 * then European diaspora, `Autre` last so free-text entry always has a home.
 */
export const COUNTRIES: readonly string[] = [
  "Madagascar",
  "Maurice",
  "Réunion",
  "Comores",
  "Mayotte",
  "Seychelles",
  "Mozambique",
  "Kenya",
  "Tanzanie",
  "Afrique du Sud",
  "France",
  "Belgique",
  "Autre",
];
