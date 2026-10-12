ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Sénégal',
  ADD COLUMN IF NOT EXISTS salary_min integer,
  ADD COLUMN IF NOT EXISTS salary_max integer,
  ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS required_degree text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS remote boolean NOT NULL DEFAULT false;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_salary_min_nonnegative CHECK (salary_min IS NULL OR salary_min >= 0);
ALTER TABLE public.jobs ADD CONSTRAINT jobs_salary_max_nonnegative CHECK (salary_max IS NULL OR salary_max >= 0);
ALTER TABLE public.jobs ADD CONSTRAINT jobs_salary_order_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min);

DROP POLICY IF EXISTS "Jobs are publicly readable" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters insert own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters delete own jobs" ON public.jobs;
CREATE POLICY "Published jobs are public" ON public.jobs FOR SELECT TO anon, authenticated
  USING (status = 'published' OR recruiter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters publish own jobs" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));
CREATE POLICY "Recruiters update own jobs" ON public.jobs FOR UPDATE TO authenticated
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'))
  WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));
CREATE POLICY "Recruiters delete own jobs" ON public.jobs FOR DELETE TO authenticated
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS education text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience_details text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS professional_references text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.candidate_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Alerte emploi',
  sector text NOT NULL DEFAULT '',
  job_title text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_alerts TO authenticated;
ALTER TABLE public.candidate_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own alerts" ON public.candidate_alerts FOR ALL TO authenticated
  USING (auth.uid() = candidate_id AND public.has_role(auth.uid(), 'candidate'))
  WITH CHECK (auth.uid() = candidate_id AND public.has_role(auth.uid(), 'candidate'));

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'shortlisted', 'interview', 'accepted', 'rejected')),
  interview_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS applications_job_id_idx ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS applications_candidate_id_idx ON public.applications(candidate_id);
GRANT SELECT, INSERT, DELETE ON public.applications TO authenticated;
GRANT UPDATE (status, interview_at, updated_at) ON public.applications TO authenticated;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates read own applications" ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates apply to published jobs" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = candidate_id AND public.has_role(auth.uid(), 'candidate') AND EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.status = 'published'
  ));
CREATE POLICY "Candidates withdraw pending applications" ON public.applications FOR DELETE TO authenticated
  USING (auth.uid() = candidate_id AND status = 'pending');
CREATE POLICY "Recruiters read applications to own jobs" ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.recruiter_id = auth.uid()));
CREATE POLICY "Recruiters manage applications to own jobs" ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.recruiter_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_id AND jobs.recruiter_id = auth.uid()));

CREATE POLICY "Recruiters read CVs for visible candidates" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'recruiter') AND EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE candidate_profiles.resume_path = name AND candidate_profiles.is_visible
  ));

CREATE TABLE IF NOT EXISTS public.candidate_shortlists (
  recruiter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (recruiter_id, candidate_id)
);
GRANT SELECT, INSERT, DELETE ON public.candidate_shortlists TO authenticated;
ALTER TABLE public.candidate_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters manage own shortlists" ON public.candidate_shortlists FOR ALL TO authenticated
  USING (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'))
  WITH CHECK (auth.uid() = recruiter_id AND public.has_role(auth.uid(), 'recruiter'));

CREATE TABLE IF NOT EXISTS public.company_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  registration_number text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'Sénégal',
  city text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_note text NOT NULL DEFAULT '',
  verified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.company_profiles TO authenticated;
GRANT SELECT (user_id, company_name, website, country, city, description, verification_status) ON public.company_profiles TO anon;
GRANT INSERT (user_id, company_name, registration_number, website, country, city, description, updated_at) ON public.company_profiles TO authenticated;
GRANT UPDATE (user_id, company_name, registration_number, website, country, city, description, updated_at) ON public.company_profiles TO authenticated;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees verified companies" ON public.company_profiles FOR SELECT TO anon, authenticated
  USING (verification_status = 'verified');
CREATE POLICY "Companies read own profile" ON public.company_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all company profiles" ON public.company_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters create own company profile" ON public.company_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'recruiter'));
CREATE POLICY "Recruiters update own company profile" ON public.company_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'recruiter'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'recruiter'));
CREATE POLICY "Admins update company verification" ON public.company_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.reset_company_verification_on_identity_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF OLD.verification_status = 'verified' AND (
    OLD.company_name IS DISTINCT FROM NEW.company_name OR
    OLD.registration_number IS DISTINCT FROM NEW.registration_number
  ) THEN
    NEW.verification_status := 'pending';
    NEW.verification_note := 'Les informations légales ont changé et nécessitent une nouvelle vérification.';
    NEW.verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER company_identity_change_resets_verification
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.reset_company_verification_on_identity_change();

CREATE OR REPLACE FUNCTION public.request_company_verification()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'recruiter') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.company_profiles
  SET verification_status = 'pending', verification_note = '', verified_at = NULL, updated_at = now()
  WHERE user_id = auth.uid() AND company_name <> '' AND registration_number <> '';
  IF NOT FOUND THEN RAISE EXCEPTION 'Complete the company name and registration number first'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.request_company_verification() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_company_verification() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_company_verification(_target uuid, _status text, _note text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('pending', 'verified', 'rejected', 'unverified') THEN
    RAISE EXCEPTION 'Invalid verification status';
  END IF;
  UPDATE public.company_profiles
  SET verification_status = _status,
      verification_note = left(_note, 1000),
      verified_at = CASE WHEN _status = 'verified' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE user_id = _target;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_company_verification(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_company_verification(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM storage.objects WHERE bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text;
  DELETE FROM public.candidate_profiles WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

INSERT INTO public.sectors (slug, name, description, icon, sort_order) VALUES
  ('hotellerie-restauration', 'Hôtellerie, restauration et métiers de bouche', 'Cuisine, pâtisserie, bar, réception, gouvernance et traiteur.', 'UtensilsCrossed', 20),
  ('nettoyage-services-entreprises', 'Nettoyage et services aux entreprises', 'Entretien, gouvernance, supervision et housekeeping.', 'Sparkles', 21),
  ('services-personne', 'Services à la personne', 'Garde d''enfants, aide à domicile et accompagnement.', 'Heart', 22),
  ('industrie-maintenance', 'Industrie et maintenance', 'Électricité, mécanique, maintenance et opérations.', 'Factory', 23),
  ('immobilier-batiments', 'Immobilier et gestion de bâtiments', 'Transaction, gestion immobilière et maintenance de bâtiments.', 'Building2', 24),
  ('securite-prevention', 'Sécurité et prévention', 'Sécurité des personnes, des biens et prévention HSE.', 'ShieldCheck', 25),
  ('communication-marketing-medias', 'Communication, marketing et médias', 'Communication, création, vidéo et marketing numérique.', 'Megaphone', 26),
  ('artisanat-metiers-manuels', 'Artisanat et métiers manuels', 'Métiers de fabrication, d''installation et de réparation.', 'Hammer', 27),
  ('environnement-economie-verte', 'Environnement et économie verte', 'Recyclage, déchets et énergies renouvelables.', 'Leaf', 28),
  ('ong-developpement-cooperation', 'ONG, développement et coopération', 'Projets, opérations terrain et suivi-évaluation.', 'Globe2', 29),
  ('droit-services-professionnels', 'Droit et services professionnels', 'Conseil juridique, expertise et services aux organisations.', 'Scale', 30),
  ('sport-loisirs-evenementiel', 'Sport, loisirs et événementiel', 'Coaching, animation et organisation d''événements.', 'Trophy', 31),
  ('import-export-commerce-international', 'Import-export et commerce international', 'Transit, douane, achats et approvisionnement.', 'Ship', 32),
  ('independant-entrepreneuriat', 'Travail indépendant et entrepreneuriat', 'Activités indépendantes, prestation et conseil.', 'BriefcaseBusiness', 33)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO public.job_titles (sector_slug, name, sort_order) VALUES
  ('hotellerie-restauration', 'Cuisinier', 1), ('hotellerie-restauration', 'Chef de cuisine', 2), ('hotellerie-restauration', 'Pâtissier', 3), ('hotellerie-restauration', 'Boulanger', 4), ('hotellerie-restauration', 'Barman', 5), ('hotellerie-restauration', 'Barista', 6), ('hotellerie-restauration', 'Réceptionniste', 7), ('hotellerie-restauration', 'Gouvernant', 8), ('hotellerie-restauration', 'Traiteur', 9), ('hotellerie-restauration', 'Serveur', 10),
  ('nettoyage-services-entreprises', 'Agent d''entretien', 1), ('nettoyage-services-entreprises', 'Gouvernant', 2), ('nettoyage-services-entreprises', 'Superviseur housekeeping', 3), ('nettoyage-services-entreprises', 'Major d''homme superviseur', 4), ('nettoyage-services-entreprises', 'Nounou', 5),
  ('services-personne', 'Garde d''enfants', 1), ('services-personne', 'Nounou', 2), ('services-personne', 'Aide à domicile', 3), ('services-personne', 'Accompagnant à la personne', 4), ('services-personne', 'Employé de maison / housekeeping', 5),
  ('industrie-maintenance', 'Électricien', 1), ('industrie-maintenance', 'Mécanicien', 2), ('industrie-maintenance', 'Technicien de maintenance', 3), ('industrie-maintenance', 'Opérateur de production', 4),
  ('immobilier-batiments', 'Agent immobilier', 1), ('immobilier-batiments', 'Gestionnaire immobilier', 2), ('immobilier-batiments', 'Technicien de maintenance bâtiment', 3),
  ('securite-prevention', 'Agent de sécurité', 1), ('securite-prevention', 'Responsable HSE', 2), ('securite-prevention', 'Préventeur sécurité', 3),
  ('communication-marketing-medias', 'Community manager', 1), ('communication-marketing-medias', 'Graphiste', 2), ('communication-marketing-medias', 'Vidéaste', 3), ('communication-marketing-medias', 'Chargé de communication', 4),
  ('artisanat-metiers-manuels', 'Couturier', 1), ('artisanat-metiers-manuels', 'Menuisier', 2), ('artisanat-metiers-manuels', 'Plombier', 3), ('artisanat-metiers-manuels', 'Soudeur', 4),
  ('environnement-economie-verte', 'Agent de recyclage', 1), ('environnement-economie-verte', 'Gestionnaire des déchets', 2), ('environnement-economie-verte', 'Technicien énergies renouvelables', 3),
  ('ong-developpement-cooperation', 'Chef de projet ONG', 1), ('ong-developpement-cooperation', 'Agent de terrain', 2), ('ong-developpement-cooperation', 'Chargé de suivi-évaluation', 3),
  ('droit-services-professionnels', 'Juriste', 1), ('droit-services-professionnels', 'Assistant juridique', 2), ('droit-services-professionnels', 'Consultant', 3),
  ('sport-loisirs-evenementiel', 'Coach sportif', 1), ('sport-loisirs-evenementiel', 'Animateur', 2), ('sport-loisirs-evenementiel', 'Organisateur d''événements', 3),
  ('import-export-commerce-international', 'Agent de transit', 1), ('import-export-commerce-international', 'Déclarant en douane', 2), ('import-export-commerce-international', 'Acheteur', 3), ('import-export-commerce-international', 'Responsable approvisionnement', 4),
  ('independant-entrepreneuriat', 'Freelance', 1), ('independant-entrepreneuriat', 'Prestataire de services', 2), ('independant-entrepreneuriat', 'Consultant indépendant', 3)
ON CONFLICT (sector_slug, name) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'jobs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
    END IF;
  END IF;
END;
$$;
