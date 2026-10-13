# Samba Job Connect — full connection plan

The app currently fails to load offers because the code expects database fields that don't exist yet (companies, country, salary, remote...). Work is split into phases so each one is tested before the next.

## Phase 1 — Fix loading + taxonomy (priority)
- Add the missing database pieces: `companies` (with `is_verified`), and on `jobs`: country, city, sector_id, salary min/max, experience level, required degree, is_remote, closed status.
- Replace the 8 old sectors with the 14 new sectors and their métiers.
- Home page, /jobs and job details never crash: empty list shows a clean "Aucune offre" message.
- Fix the current build errors (login role type, jobs sort, recruiter page, vite config).

## Phase 2 — Search filters
- /jobs filters run real queries: country, city, sector, métier, salary, contract (CDI, CDD, Stage, Freelance, Intérim), experience, degree, remote, publication date.
- "Rechercher un emploi" updates results instantly.

## Phase 3 — Candidate space
- Profile edit + delete personal data, PDF CV upload (private storage).
- Sections: diplômes, compétences, expériences, références.
- Apply to an offer; application tracking with statuses pending / reviewed / shortlisted / accepted / rejected (live updates).
- Job alerts (sector, métier, city, contract).

## Phase 4 — Company space
- Company profile, publish/edit/close offers, see applicants, shortlist, schedule interview (date + note), close recruitment.
- "Entreprise vérifiée" badge from `is_verified` on cards, offer page, company page.

## Phase 5 — Admin
- Admin account md4189336@gmail.com named "Mamadou Yaya Diallo", role admin.
- New tabs: verify/unverify companies, manage offers (hide/close/delete), alongside existing users/payments/CV tabs.

## Technical details
- Roles stay in `user_roles` (security); `profiles.role` remains a read-only mirror. "Entreprise" maps to the existing `recruiter` role.
- New tables: companies, applications, candidate_education, candidate_experience, candidate_references, job_alerts, interviews — each with GRANTs + RLS (owner, recruiter-of-job, admin).
- Applications realtime via channel subscription.
- Catalog server function returns `[]` on any read error.
