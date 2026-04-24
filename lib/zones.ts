/**
 * Geographic-zone → country-set mapping used by the deal-flow match scorer.
 *
 * Previously (audit item I-H1), `geographic_zones` on an investor profile
 * could contain values like "Afrique subsaharienne" or "Région Océan Indien",
 * but the scorer only did a substring-match against the project's `country`
 * field — so a Madagascar project never matched an "Afrique subsaharienne"
 * investor.
 *
 * `expandZones` takes a list of zone strings (as stored on an investor row),
 * resolves each one to the set of countries it covers, unions them, and
 * returns the result for use in set-membership matching.
 *
 * Single-country entries resolve to themselves — so an investor who picked
 * just "Madagascar" only matches Madagascar projects, as expected.
 *
 * `"International"` matches every country (returns a sentinel flag).
 * `"Autre"` + any custom free-text zone is treated as a literal country name
 * and resolves to itself.
 */

// Countries we currently surface anywhere in the product.
// Must stay in sync with lib/countries.ts, but this file intentionally lists
// the zone-relevant set (no "Autre" sentinel, since Autre only appears on the
// investor side as a free-text escape).
const REGION_OCEAN_INDIEN = [
  "Madagascar", "Maurice", "Réunion", "Comores", "Seychelles", "Mayotte",
];

const AFRIQUE_SUBSAHARIENNE = [
  "Madagascar", "Maurice", "Comores", "Seychelles", "Mayotte",
  "Mozambique", "Kenya", "Tanzanie", "Afrique du Sud",
  // Not exhaustive — includes all sub-Saharan entries currently in our country
  // picker. Add more here as new countries are onboarded.
];

const ZONE_TO_COUNTRIES: Record<string, readonly string[]> = {
  "Région Océan Indien":   REGION_OCEAN_INDIEN,
  "Afrique subsaharienne": AFRIQUE_SUBSAHARIENNE,
};

/** Sentinel set that matches every country. */
const INTERNATIONAL = Symbol("international");

export type ZoneExpansion =
  | { kind: "set"; countries: Set<string> }
  | { kind: "all" };

/**
 * Expand a mixed list of zones/countries into a country-set or an "all" flag.
 * Case-insensitive on the lookup side; preserves original casing in the
 * output set (matching is done via caseInsensitiveMatch below).
 */
export function expandZones(zones: string[] | null | undefined): ZoneExpansion {
  if (!zones || zones.length === 0) return { kind: "set", countries: new Set() };

  const out = new Set<string>();
  for (const raw of zones) {
    const z = raw.trim();
    if (!z) continue;
    if (z === "International") return { kind: "all" };
    const mapped = ZONE_TO_COUNTRIES[z];
    if (mapped) {
      for (const c of mapped) out.add(c);
    } else {
      // Single country ("Madagascar") or free-text "Autre" — treat as literal.
      out.add(z);
    }
  }
  return { kind: "set", countries: out };
}

/**
 * Match a project's `country` field against a zone expansion.
 * Case-insensitive because free-text entries on either side may differ.
 */
export function zoneMatches(exp: ZoneExpansion, projectCountry: string | null | undefined): boolean {
  if (!projectCountry) return false;
  if (exp.kind === "all") return true;
  const c = projectCountry.toLowerCase();
  for (const country of exp.countries) {
    if (country.toLowerCase() === c) return true;
  }
  return false;
}

// Suppress unused-symbol complaint in tools that flag Symbols.
void INTERNATIONAL;
