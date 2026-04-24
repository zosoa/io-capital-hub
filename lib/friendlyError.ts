/**
 * Map Supabase / Postgres error messages → user-facing French copy.
 *
 * The raw messages leak implementation details (RLS policy names, constraint
 * identifiers, table names) that are confusing at best and a reconnaissance
 * signal at worst. Audit item I-H4: whitelist known error shapes; everything
 * else falls back to a neutral generic message.
 *
 * Usage:
 *   setError(friendlyError(err));
 *
 * The error object from supabase-js is usually shaped `{ message, code }`.
 * Postgres error codes bubble through as 5-char strings (e.g. "23505" for
 * unique-violation, "23514" for check-violation, "42501" for RLS denial).
 */
export type ErrorLike = { message?: string; code?: string } | null | undefined;

const AUTH_MESSAGES: Record<string, string> = {
  "Email not confirmed":        "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail.",
  "Invalid login credentials":  "Email ou mot de passe incorrect.",
  "Too many requests":          "Trop de tentatives. Veuillez patienter quelques minutes.",
  "User not found":             "Aucun compte trouvé avec cet email.",
  "User already registered":    "Un compte existe déjà avec cet email.",
  "Signup requires a valid password":
                                "Le mot de passe ne répond pas aux exigences de sécurité.",
  "Password should be at least 6 characters":
                                "Le mot de passe doit contenir au moins 6 caractères.",
  "A user with this email address has already been registered":
                                "Un compte existe déjà avec cet email.",
  "captcha verification process failed":
                                "La vérification anti-bot a échoué. Actualisez la page et réessayez.",
  "For security purposes, you can only request this once every 60 seconds":
                                "Pour des raisons de sécurité, vous ne pouvez recommencer qu'une fois par minute.",
};

const PG_CODES: Record<string, string> = {
  "23505": "Cette entrée existe déjà.",
  "23514": "Certaines valeurs saisies ne sont pas valides.",
  "23503": "Une référence est introuvable (l'élément a peut-être été supprimé).",
  "23502": "Un champ obligatoire est manquant.",
  "42501": "Vous n'avez pas les droits nécessaires pour cette action.",
  "PGRST116": "Ressource introuvable.",
  "PGRST301": "Accès refusé.",
};

export function friendlyError(err: ErrorLike): string {
  if (!err) return "Une erreur technique est survenue. Veuillez réessayer.";

  // PG/PostgREST code takes precedence — it's most specific.
  if (err.code && PG_CODES[err.code]) return PG_CODES[err.code];

  // Exact auth-message match.
  if (err.message && AUTH_MESSAGES[err.message]) return AUTH_MESSAGES[err.message];

  // Some supabase-js errors wrap things like "AuthApiError: <msg>" — strip prefix.
  if (err.message) {
    const stripped = err.message.replace(/^AuthApiError:\s*/, "").trim();
    if (AUTH_MESSAGES[stripped]) return AUTH_MESSAGES[stripped];
  }

  // Generic fallback — never expose raw PG / Supabase internals.
  return "Une erreur technique est survenue. Veuillez réessayer.";
}
