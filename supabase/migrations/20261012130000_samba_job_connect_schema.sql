CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  icon text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.sectors
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.sectors SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE public.sectors ALTER COLUMN id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS sectors_id_key ON public.sectors (id);

GRANT SELECT ON public.sectors TO anon, authenticated;
GRANT ALL ON public.sectors TO service_role;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sectors public read" ON public.sectors;
CREATE POLICY "Sectors public read" ON public.sectors FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.sectors (slug, name, description, sort_order) VALUES
  ('hotellerie-restauration', 'Hôtellerie, restauration et métiers de bouche', 'Cuisine, pâtisserie, bar, réception, gouvernance et traiteur.', 20),
  ('nettoyage-services-entreprises', 'Nettoyage et services aux entreprises', 'Entretien, gouvernance, supervision et housekeeping.', 21),
  ('services-personne', 'Services à la personne', 'Garde d''enfants, aide à domicile et accompagnement.', 22),
  ('industrie-maintenance', 'Industrie et maintenance', 'Électricité, mécanique, maintenance et opérations.', 23),
  ('immobilier-batiments', 'Immobilier et gestion de bâtiments', 'Transaction, gestion immobilière et maintenance de bâtiments.', 24),
  ('securite-prevention', 'Sécurité et prévention', 'Sécurité des personnes, des biens et prévention HSE.', 25),
  ('communication-marketing-medias', 'Communication, marketing et médias', 'Communication, création, vidéo et marketing numérique.', 26),
  ('artisanat-metiers-manuels', 'Artisanat et métiers manuels', 'Métiers de fabrication, d''installation et de réparation.', 27),
  ('environnement-economie-verte', 'Environnement et économie verte', 'Recyclage, déchets et énergies renouvelables.', 28),
  ('ong-developpement-cooperation', 'ONG, développement et coopération', 'Projets, opérations terrain et suivi-évaluation.', 29),
  ('droit-services-professionnels', 'Droit et services professionnels', 'Conseil juridique, expertise et services aux organisations.', 30),
  ('sport-loisirs-evenementiel', 'Sport, loisirs et événementiel', 'Coaching, animation et organisation d''événements.', 31),
  ('import-export-commerce-international', 'Import-export et commerce international', 'Transit, douane, achats et approvisionnement.', 32),
  ('independant-entrepreneuriat', 'Travail indépendant et entrepreneuriat', 'Activités indépendantes, prestation et conseil.', 33)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_id_auth_users_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END;
$$;

GRANT UPDATE (phone, avatar_url, bio) ON public.profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  logo_url text,
  website text,
  country text NOT NULL DEFAULT 'Sénégal',
  city text NOT NULL DEFAULT '',
  subscription_plan text NOT NULL DEFAULT 'starter',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies (owner_id);
CREATE INDEX IF NOT EXISTS companies_sector_id_idx ON public.companies (sector_id);
CREATE UNIQUE INDEX IF NOT EXISTS companies_owner_id_key ON public.companies (owner_id);

INSERT INTO public.companies (owner_id, name, description, website, country, city, is_verified)
SELECT
  company_profiles.user_id,
  company_profiles.company_name,
  company_profiles.description,
  nullif(company_profiles.website, ''),
  company_profiles.country,
  company_profiles.city,
  company_profiles.verification_status = 'verified'
FROM public.company_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies
  WHERE companies.owner_id = company_profiles.user_id
);

GRANT SELECT ON public.companies TO anon, authenticated;
REVOKE INSERT, UPDATE ON public.companies FROM authenticated;
GRANT INSERT (owner_id, name, description, sector_id, logo_url, website, country, city)
  ON public.companies TO authenticated;
GRANT UPDATE (name, description, sector_id, logo_url, website, country, city)
  ON public.companies TO authenticated;
GRANT DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verified companies are public" ON public.companies
  FOR SELECT TO anon, authenticated USING (is_verified);
CREATE POLICY "Owners and admins read companies" ON public.companies
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company owners create companies" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'recruiter'))
  );
CREATE POLICY "Company owners update companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (
    (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'recruiter')))
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'recruiter')))
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Company owners delete companies" ON public.companies
  FOR DELETE TO authenticated
  USING (
    (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'recruiter')))
    OR public.has_role(auth.uid(), 'admin')
  );

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contract_type text NOT NULL DEFAULT 'CDI',
  ADD COLUMN IF NOT EXISTS experience_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS salary_range text,
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_remote boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

UPDATE public.jobs
SET sector_id = sectors.id
FROM public.sectors
WHERE jobs.sector_id IS NULL AND jobs.sector = sectors.slug;

UPDATE public.jobs
SET contract_type = contract,
    experience_level = experience,
    education_level = required_degree,
    city = location,
    is_remote = remote,
    salary_range = CASE
      WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN salary_min::text || '-' || salary_max::text
      WHEN salary_min IS NOT NULL THEN salary_min::text || '+'
      WHEN salary_max IS NOT NULL THEN '0-' || salary_max::text
      ELSE NULL
    END;

UPDATE public.jobs
SET company_id = companies.id
FROM public.companies
WHERE jobs.company_id IS NULL
  AND jobs.recruiter_id = companies.owner_id;

CREATE INDEX IF NOT EXISTS jobs_company_id_idx ON public.jobs (company_id);
CREATE INDEX IF NOT EXISTS jobs_sector_id_idx ON public.jobs (sector_id);

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cv_url text;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'viewed', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'));

CREATE OR REPLACE FUNCTION public.sync_verified_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.companies (owner_id, name, description, website, country, city, is_verified)
  VALUES (
    NEW.user_id,
    NEW.company_name,
    NEW.description,
    nullif(NEW.website, ''),
    NEW.country,
    NEW.city,
    NEW.verification_status = 'verified'
  )
  ON CONFLICT (owner_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    is_verified = EXCLUDED.is_verified;
  RETURN NEW;
END;
$$;
CREATE TRIGGER company_profiles_sync_companies
  AFTER INSERT OR UPDATE OF company_name, description, website, country, city, verification_status
  ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_verified_company();

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR (_role = 'recruiter' AND role = 'company')
        OR (_role = 'company' AND role = 'recruiter')
      )
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.app_role;
BEGIN
  r := CASE NEW.raw_user_meta_data->>'role'
    WHEN 'company' THEN 'company'::public.app_role
    WHEN 'recruiter' THEN 'recruiter'::public.app_role
    WHEN 'institution' THEN 'institution'::public.app_role
    ELSE 'candidate'::public.app_role
  END;
  IF lower(coalesce(NEW.email, '')) = 'md4189336@gmail.com' THEN
    r := 'admin';
  END IF;
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    coalesce(left(NEW.raw_user_meta_data->>'full_name', 100), ''),
    coalesce(NEW.email, ''),
    r
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r);
  RETURN NEW;
END;
$$;
