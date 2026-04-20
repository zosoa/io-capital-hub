# IO Capital Hub — Guide de Déploiement

## Architecture
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + glassmorphism custom design
- **Auth + Database**: Supabase (PostgreSQL + RLS)
- **Deploy**: Vercel (recommandé)

## Supabase Project
- **URL**: https://qvldafrttkmfnrfuwvfk.supabase.co
- **Project**: IO Capital Hub (org: FinkSmart's Org)
- **Region**: eu-west-3 (Paris)
- **Schema**: déjà appliqué ✓

## Variables d'environnement (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://qvldafrttkmfnrfuwvfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Lancement en local
```bash
cd io-capital-hub
npm install
npm run dev
# → http://localhost:3000
```

## Déploiement Vercel
```bash
npm install -g vercel
vercel --prod
# Ajoutez les env vars dans le dashboard Vercel
```

## Créer un compte Admin
Dans Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'votre-email@example.com';
```

## Pages de l'application

| Route | Description | Accès |
|-------|-------------|-------|
| `/` | Landing page | Public |
| `/auth/signup` | Inscription 2 étapes | Public |
| `/auth/login` | Connexion | Public |
| `/dashboard` | Tableau de bord porteur | Client |
| `/dashboard/projects` | Liste des projets | Client |
| `/dashboard/projects/new` | Formulaire 5 étapes | Client |
| `/dashboard/projects/[id]` | Détail projet | Client |
| `/dashboard/profile` | Profil utilisateur | Client |
| `/admin` | Vue d'ensemble admin | Admin |
| `/admin/projects` | Tous les projets | Admin |
| `/admin/projects/[id]` | Revue + actions | Admin |
| `/admin/users` | Gestion utilisateurs | Admin |

## Schéma Base de Données

### profiles
- id, full_name, email, phone, organization, job_title
- country, role (client/admin), onboarding_completed

### projects
- Identification: title, tagline, description, slug
- Projet: sector, stage, country, city, legal_structure
- Financement: funding_type, amount_requested, currency, term
- Organisation: years_in_operation, team_size, annual_revenue
- Garanties: has_collateral, collateral_type, collateral_value
- Impact: job_creation_expected, impact_description
- Admin: status, admin_notes, rejection_reason

### Status flow des projets
```
draft → submitted → under_review → approved → funded
                              ↘ rejected
```

## Sécurité (RLS Policies)
- Les clients ne voient que leurs propres projets
- Les admins voient tout
- Trigger automatique: création de profil à l'inscription

## Roadmap fonctionnelle (prévu)
- [ ] Upload documents (CV, business plan, états financiers)
- [ ] Notifications email (Resend / SendGrid)
- [ ] Listing public des projets approuvés
- [ ] Matching investisseur ↔ projet
- [ ] Deal room / messagerie privée
- [ ] Tableau de bord analytics investisseur
- [ ] Abonnement premium (Stripe)
