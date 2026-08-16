"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Multi-image uploader for project photos → Supabase `project-media` bucket.
 * Stores public URLs; caller persists the array on the project row.
 */
export default function ProjectPhotos({
  value,
  onChange,
  max = 6,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handle(files: FileList | null) {
    if (!files || !files.length) return;
    setErr("");
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("Session expirée — reconnectez-vous."); setBusy(false); return; }

    const urls = [...value];
    for (const file of Array.from(files)) {
      if (urls.length >= max) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { setErr("Chaque image doit faire moins de 5 Mo."); continue; }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("project-media").upload(path, file, { contentType: file.type });
      if (error) { setErr("Échec du téléversement. Réessayez."); continue; }
      const { data } = supabase.storage.from("project-media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    onChange(urls);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((u) => (
          <div key={u} className="relative aspect-square rounded-xl overflow-hidden border border-[#E4E7EC] group">
            <img src={u} alt="Photo du projet" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((x) => x !== u))}
              aria-label="Retirer la photo"
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 hover:bg-black/75 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              ✕
            </button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => ref.current?.click()} disabled={busy}
            className="aspect-square rounded-xl border-2 border-dashed border-[#DADEE4] text-[#918A7C] hover:border-[#1A5FB4] hover:text-[#1A5FB4] flex flex-col items-center justify-center gap-1 transition disabled:opacity-60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[11px] font-medium">{busy ? "..." : "Ajouter"}</span>
          </button>
        )}
      </div>
      {err && <p className="text-red-600 text-xs mt-2">{err}</p>}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
