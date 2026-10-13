ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS sectors_id_key ON public.sectors(id);

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'Sénégal',
  website text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies public read" ON public.companies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner insert company" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND is_verified = false);
CREATE POLICY "Owner or admin update company" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete company" ON public.companies FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.protect_company_verification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER companies_protect_verified BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.protect_company_verification();

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Sénégal',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS salary_min integer,
  ADD COLUMN IF NOT EXISTS salary_max integer,
  ADD COLUMN IF NOT EXISTS experience_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_remote boolean NOT NULL DEFAULT false;
UPDATE public.jobs SET city = location WHERE city = '';

DROP POLICY IF EXISTS "Jobs are publicly readable" ON public.jobs;
CREATE POLICY "Published jobs readable" ON public.jobs FOR SELECT TO anon, authenticated USING (status = 'published' OR auth.uid() = recruiter_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update jobs" ON public.jobs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete jobs" ON public.jobs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.is_job_owner(_job_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs WHERE id = _job_id AND recruiter_id = auth.uid())
$$;

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL,
  candidate_name text NOT NULL DEFAULT '',
  candidate_email text NOT NULL DEFAULT '',
  cover_letter text NOT NULL DEFAULT '',
  resume_path text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','shortlisted','accepted','rejected')),
  interview_at timestamptz,
  interview_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applications read" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = candidate_id OR public.is_job_owner(job_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Candidate apply" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = candidate_id AND status = 'pending');
CREATE POLICY "Recruiter update applications" ON public.applications FOR UPDATE TO authenticated USING (public.is_job_owner(job_id)) WITH CHECK (public.is_job_owner(job_id));
CREATE POLICY "Candidate withdraw" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = candidate_id);
ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

CREATE TABLE public.candidate_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('education','experience','reference')),
  title text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  period text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_entries TO authenticated;
GRANT ALL ON public.candidate_entries TO service_role;
ALTER TABLE public.candidate_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entries own all" ON public.candidate_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Entries recruiter admin read" ON public.candidate_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'recruiter'));

CREATE TABLE public.job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sector text NOT NULL DEFAULT '',
  job_title text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  contract text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_alerts TO authenticated;
GRANT ALL ON public.job_alerts TO service_role;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts own all" ON public.job_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidate own delete" ON public.candidate_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Recruiters read applicant resumes" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM public.applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE j.recruiter_id = auth.uid() AND a.candidate_id::text = split_part(storage.objects.name,'/',1)
  )
);