# ⚠️ PROJECT IDENTITY — READ FIRST

**This is the CEO Summit project. It is NOT FinkSmart / Freedom Path.**

| Field | Value |
|---|---|
| **Name** | IO Capital Hub |
| **Belongs to** | 🏛️ CEO Summit |
| **Folder** | `CEO Summit/io-capital-hub` |
| **GitHub** | `github.com/zosoa/io-capital-hub` (remote `origin`) |
| **Vercel project** | `io-capital-hub` → io-capital-hub.vercel.app (projectId `prj_4Jn5idgHpjIzOiODQAzlyB5qq8NN`, linked in `.vercel/`) |
| **Framework** | Next.js 15 (App Router) + TypeScript + Tailwind |
| **Database** | Supabase `qvldafrttkmfnrfuwvfk` (eu-west-3). NB: the Supabase *org* is called "FinkSmart's Org" — ignore that, this is still the CEO Summit app. |

## Do NOT confuse with the sibling project
The FinkSmart / Freedom Path app lives at `../../Financial-Freedom-Path`, pushes to
`github.com/zosoa/Financial-Freedom-Path`, and deploys to the Vercel project **`finksmart`**.
**Never** push this repo to that remote or that Vercel project, and vice-versa.

## Publish / deploy
- `git push origin main` → triggers the Vercel deploy for **io-capital-hub**.
- Manual: `vercel --prod` from this folder (linked to `io-capital-hub` via `.vercel/`).
- Always confirm `git remote -v` shows `io-capital-hub.git` AND
  `.vercel/project.json` says `"projectName":"io-capital-hub"` before publishing.

## Gotcha
- The app root IS this folder. The nested `io-capital-hub/io-capital-hub/` subfolder is a
  **stale, untracked leftover** (Apr 2026) — do not edit files there or `cd` into it.
