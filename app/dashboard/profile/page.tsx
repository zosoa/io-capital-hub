"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/types";

const COUNTRIES = ["Madagascar","Maurice","Réunion","Comores","Mayotte","Seychelles",
  "Mozambique","Kenya","Tanzanie","Afrique du Sud","France","Belgique","Autre"];

// ── Upload helper ────────────────────────────────────────────────
async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  file: File,
  pathKey: "avatar" | "logo"
): Promise<string | null> {
  const ext  = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${pathKey}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error("Upload error:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── ImageUpload ──────────────────────────────────────────────────
function ImageUpload({ label, hint, currentUrl, fallbackInitial, shape = "circle", onFileSelected }: {
  label: string; hint: string; currentUrl?: string | null;
  fallbackInitial?: string; shape?: "circle" | "square";
  onFileSelected: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  useEffect(() => { setPreview(currentUrl || null); }, [currentUrl]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelected(file);
  }
  const r = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 flex-shrink-0 overflow-hidden border-2 border-[#E5DDD4] ${r} bg-[#F6F3EE] flex items-center justify-center cursor-pointer hover:border-[#B8913A]/40 transition-colors`}
             onClick={() => ref.current?.click()}>
          {preview
            ? <img src={preview} alt={label} className={`w-full h-full object-cover ${r}`}/>
            : <span className="text-[#B8913A] font-bold text-lg">{fallbackInitial || "?"}</span>}
        </div>
        <div>
          <button type="button" onClick={() => ref.current?.click()}
            className="btn-ghost text-xs py-2 px-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            Choisir
          </button>
          <p className="text-[#9A9FAF] text-xs mt-1.5 leading-relaxed">{hint}</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange}/>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-[#9A9FAF] uppercase tracking-[0.12em] mb-4 flex items-center gap-2">
      <div className="w-4 h-px bg-[#B8913A]/40"/>
      {children}
      <div className="flex-1 h-px bg-[#EDE7DE]"/>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile]   = useState<Partial<Profile>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile,   setLogoFile]   = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  function update(k: keyof Profile, v: string | boolean | null) {
    setProfile(p => ({ ...p, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg("Session expirée."); setSaving(false); return; }

    let avatarUrl = profile.avatar_url ?? null;
    let logoUrl   = profile.company_logo_url ?? null;
    if (avatarFile) { const u = await uploadImage(supabase, user.id, avatarFile, "avatar"); if (u) avatarUrl = u; }
    if (logoFile)   { const u = await uploadImage(supabase, user.id, logoFile,   "logo");   if (u) logoUrl   = u; }

    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name ?? null,
      phone: profile.phone ?? null,
      organization: profile.organization ?? null,
      job_title: profile.job_title ?? null,
      country: profile.country ?? "Madagascar",
      linkedin_url: profile.linkedin_url ?? null,
      is_authorized_rep: profile.is_authorized_rep ?? false,
      avatar_url: avatarUrl,
      company_logo_url: logoUrl,
    }).eq("id", user.id);

    setSaving(false);
    if (error) {
      setMsg("Erreur : " + error.message);
      toast.error("Erreur lors de la sauvegarde");
    } else {
      setProfile(p => ({ ...p, avatar_url: avatarUrl, company_logo_url: logoUrl }));
      setAvatarFile(null); setLogoFile(null);
      setMsg("success");
      toast.success("Profil mis à jour");
      // Re-render server layout so sidebar picks up new avatar/logo immediately
      router.refresh();
    }
  }

  if (loading) return (
    <div className="p-8 pt-[68px] md:pt-8 flex items-center gap-3 text-[#9A9FAF]">
      <span className="w-4 h-4 border-2 border-[#D8D2CA] border-t-[#B8913A] rounded-full animate-spin"/>
      Chargement...
    </div>
  );

  const nameInitial = profile.full_name?.[0]?.toUpperCase() || "?";
  const orgInitial  = profile.organization?.[0]?.toUpperCase() || "E";

  return (
    <div className="p-6 md:p-8 pt-[68px] md:pt-8 max-w-2xl mx-auto">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#0F1320] mb-1">Mon profil</h1>
        <p className="text-[#7A8098] text-sm">
          Vos informations sont partagées avec les investisseurs qui s&apos;intéressent à vos projets.
        </p>
      </div>

      {/* ── Alerts ── */}
      {msg === "success" && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
          Profil mis à jour avec succès
        </div>
      )}
      {msg && msg !== "success" && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{msg}</div>
      )}

      <form onSubmit={save} className="space-y-4">

        {/* ── Photos ── */}
        <div className="card overflow-hidden">

          {/* Impact banner */}
          <div className="bg-[#B8913A]/8 border-b border-[#B8913A]/15 px-6 py-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B8913A]/15 border border-[#B8913A]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#B8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
              </svg>
            </div>
            <div>
              <div className="text-[#8A6A20] font-semibold text-sm mb-0.5">
                Les dossiers avec visuels reçoivent 3× plus d&apos;attention
              </div>
              <p className="text-[#9A7A30] text-xs leading-relaxed">
                Les investisseurs parcourent des dizaines de dossiers. Une <strong className="font-semibold">photo professionnelle du représentant</strong> et un <strong className="font-semibold">logo d&apos;entreprise</strong> créent immédiatement la confiance et distinguent votre dossier des autres. Un pitch bien documenté visuellement est systématiquement priorisé lors de la sélection par notre équipe.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <SectionHeader>Photos &amp; identité visuelle</SectionHeader>

            {/* Upload status indicators */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                profile.avatar_url
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-600"
              }`}>
                {profile.avatar_url ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                  </svg>
                )}
                <span className="font-medium">
                  {profile.avatar_url ? "Photo ajoutée" : "Photo manquante"}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                profile.company_logo_url
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-600"
              }`}>
                {profile.company_logo_url ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                  </svg>
                )}
                <span className="font-medium">
                  {profile.company_logo_url ? "Logo ajouté" : "Logo manquant"}
                </span>
              </div>
            </div>

            <ImageUpload
              label="Photo du représentant autorisé"
              hint="JPG ou PNG · Max 5 Mo — photo professionnelle recommandée"
              currentUrl={profile.avatar_url} fallbackInitial={nameInitial} shape="circle"
              onFileSelected={setAvatarFile}
            />
            <ImageUpload
              label="Logo de l'entreprise"
              hint="JPG ou PNG · Max 5 Mo — fond transparent ou blanc recommandé"
              currentUrl={profile.company_logo_url} fallbackInitial={orgInitial} shape="square"
              onFileSelected={setLogoFile}
            />
          </div>
        </div>

        {/* ── Identité ── */}
        <div className="card p-6 space-y-4">
          <SectionHeader>Informations personnelles</SectionHeader>

          <div>
            <div className="label">Nom complet</div>
            <input type="text" value={profile.full_name || ""} onChange={e => update("full_name", e.target.value)}
              className="input"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label">Organisation</div>
              <input type="text" value={profile.organization || ""} onChange={e => update("organization", e.target.value)}
                className="input" placeholder="Mon Entreprise SA"/>
            </div>
            <div>
              <div className="label">Poste</div>
              <input type="text" value={profile.job_title || ""} onChange={e => update("job_title", e.target.value)}
                className="input" placeholder="CEO / Fondateur"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label">Téléphone</div>
              <input type="tel" value={profile.phone || ""} onChange={e => update("phone", e.target.value)}
                className="input" placeholder="+261 34 00 000 00"/>
            </div>
            <div>
              <div className="label">Pays</div>
              <select
                value={COUNTRIES.includes(profile.country || "") ? (profile.country || "Madagascar") : "Autre"}
                onChange={e => update("country", e.target.value)}
                className="input">
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {(profile.country === "Autre" || (profile.country && !COUNTRIES.includes(profile.country))) && (
                <input type="text"
                  value={profile.country === "Autre" ? "" : (profile.country || "")}
                  onChange={e => update("country", e.target.value)}
                  className="input mt-2" placeholder="Précisez votre pays..."/>
              )}
            </div>
          </div>

          <div>
            <div className="label">LinkedIn</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A898] text-xs pointer-events-none select-none">
                linkedin.com/in/
              </span>
              <input
                type="text"
                value={(profile.linkedin_url || "").replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "")}
                onChange={e => update("linkedin_url", e.target.value
                  ? `https://linkedin.com/in/${e.target.value.replace(/^.*linkedin\.com\/in\/?/, "")}`
                  : null)}
                className="input"
                style={{ paddingLeft: "8.5rem" }}
                placeholder="votre-nom"/>
            </div>
          </div>
        </div>

        {/* ── Représentant autorisé ── */}
        <div className="card p-6">
          <SectionHeader>Déclaration du représentant autorisé</SectionHeader>

          <button
            type="button"
            onClick={() => update("is_authorized_rep", !profile.is_authorized_rep)}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              profile.is_authorized_rep
                ? "border-[#B8913A] bg-[#B8913A]/5"
                : "border-[#E5DDD4] bg-[#FAFAF8] hover:border-[#D8D0C5]"
            }`}>
            <div className={`w-5 h-5 flex-shrink-0 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
              profile.is_authorized_rep ? "bg-[#B8913A] border-[#B8913A]" : "border-[#C8C0B5] bg-white"
            }`}>
              {profile.is_authorized_rep && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              )}
            </div>
            <div>
              <div className={`text-sm font-semibold mb-1 ${profile.is_authorized_rep ? "text-[#0F1320]" : "text-[#5A6280]"}`}>
                Je certifie être le représentant légal ou l&apos;agent autorisé
              </div>
              <div className="text-[#9A9FAF] text-xs leading-relaxed">
                Je déclare avoir le pouvoir et l&apos;autorité nécessaires pour soumettre des dossiers de financement au nom
                de mon organisation sur la plateforme CEO Summit IO — Investment Hub.
                Je m&apos;engage à ce que toutes les informations fournies soient exactes et complètes.
              </div>
            </div>
          </button>

          {!profile.is_authorized_rep && (
            <p className="mt-3 text-amber-600 text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              Déclaration requise pour soumettre un dossier de financement.
            </p>
          )}
        </div>

        {/* ── Save ── */}
        <div className="flex items-center gap-4 pt-1">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Sauvegarde...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                Sauvegarder les modifications
              </>
            )}
          </button>
          {(avatarFile || logoFile) && (
            <span className="text-[#B8913A] text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
              </svg>
              {[avatarFile && "photo", logoFile && "logo"].filter(Boolean).join(" + ")} prête(s)
            </span>
          )}
        </div>
      </form>

      {/* ── Confidentiality note ── */}
      <div className="mt-6 p-4 rounded-xl border border-[#E5DDD4] bg-[#FAFAF8] flex items-start gap-3">
        <svg className="w-4 h-4 text-[#C8C0B5] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
        </svg>
        <p className="text-[#9A9FAF] text-xs leading-relaxed">
          Vos informations personnelles sont strictement confidentielles et uniquement partagées avec les
          investisseurs qui expriment un intérêt concret pour l&apos;un de vos projets.
        </p>
      </div>
    </div>
  );
}
