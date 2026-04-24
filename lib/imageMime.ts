/**
 * Magic-number (file-signature) image verification.
 *
 * Audit S-3: the previous check was `file.type.startsWith("image/")`, which
 * trusts the browser-supplied MIME — a tampered request can easily claim
 * `image/png` while the bytes are a PHP shell or an EXE. Bucket-level
 * `allowed_mime_types` on Supabase storage is the last line of defence, and
 * matching against the first bytes of the file is the proper first line.
 *
 * This runs in the browser (reads a File via FileReader) and throws if the
 * signature doesn't match one of the whitelisted formats.
 *
 * Formats supported:
 *   JPEG, PNG, WebP, GIF, SVG (text sniffed separately).
 *
 * Consumers should ALSO keep a second server-side check if they accept
 * arbitrary uploads into their own storage (not Supabase). Supabase's
 * `allowed_mime_types` bucket setting already covers that surface today.
 */

export type ImageKind = "jpeg" | "png" | "webp" | "gif" | "svg" | null;

const MAX_SVG_SNIFF = 256;

function bytesMatch(view: Uint8Array, sig: number[], offset = 0): boolean {
  for (let i = 0; i < sig.length; i++) {
    if (view[offset + i] !== sig[i]) return false;
  }
  return true;
}

/**
 * Inspect the first bytes of `file` and return its real image kind, or null
 * if it doesn't match any supported signature.
 */
export async function detectImageKind(file: File): Promise<ImageKind> {
  const slice = file.slice(0, 16);
  const buf = await slice.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // JPEG — FF D8 FF
  if (bytesMatch(bytes, [0xFF, 0xD8, 0xFF])) return "jpeg";
  // PNG — 89 50 4E 47 0D 0A 1A 0A
  if (bytesMatch(bytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return "png";
  // GIF — "GIF87a" / "GIF89a"
  if (bytesMatch(bytes, [0x47, 0x49, 0x46, 0x38])) return "gif";
  // WebP — "RIFF"....."WEBP"
  if (
    bytesMatch(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytesMatch(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) return "webp";

  // SVG — text format. Sniff a small head chunk and look for the <svg token
  // (allowing optional XML prolog + whitespace + comments up to the tag).
  if (/\+?xml|svg/i.test(file.type) || file.name.toLowerCase().endsWith(".svg")) {
    const head = await file.slice(0, MAX_SVG_SNIFF).text();
    const normalized = head.trim().toLowerCase();
    // Must parse as XML/SVG — start with a tag, either <?xml or <svg or a comment
    if (
      /<svg[\s>]/.test(normalized) ||
      (/^<\?xml\b/.test(normalized) && /<svg[\s>]/.test(normalized))
    ) return "svg";
  }

  return null;
}

/**
 * Convenience wrapper: throws a friendly French error if the file's real
 * content doesn't look like a supported image.
 */
export async function assertIsImage(file: File, allowed: ImageKind[] = ["jpeg","png","webp","gif","svg"]): Promise<ImageKind> {
  const kind = await detectImageKind(file);
  if (!kind) {
    throw new Error("Fichier non reconnu comme une image valide. Formats acceptés : JPG, PNG, WebP, GIF, SVG.");
  }
  if (!allowed.includes(kind)) {
    throw new Error(`Format ${kind.toUpperCase()} non autorisé pour ce champ.`);
  }
  return kind;
}
