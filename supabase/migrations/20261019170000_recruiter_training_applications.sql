ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS opening_date date,
  ADD COLUMN IF NOT EXISTS closing_date date;

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_publication_dates_valid;
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_publication_dates_valid
  CHECK (opening_date IS NULL OR closing_date IS NULL OR closing_date >= opening_date);

CREATE TABLE IF NOT EXISTS public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  institution_name text NOT NULL,
  location text NOT NULL,
  duration text NOT NULL,
  award text NOT NULL,
  opening_date date NOT NULL,
  closing_date date NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trainings_dates_valid CHECK (closing_date >= opening_date)
);

CREATE INDEX IF NOT EXISTS trainings_institution_id_idx ON public.trainings (institution_id);
CREATE INDEX IF NOT EXISTS trainings_publication_dates_idx ON public.trainings (opening_date, closing_date);
GRANT SELECT ON public.trainings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trainings TO authenticated;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published trainings are public" ON public.trainings FOR SELECT TO anon, authenticated
  USING (status = 'published' OR institution_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Institutions publish own trainings" ON public.trainings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = institution_id AND public.has_role(auth.uid(), 'institution'));
CREATE POLICY "Institutions manage own trainings" ON public.trainings FOR UPDATE TO authenticated
  USING (auth.uid() = institution_id AND public.has_role(auth.uid(), 'institution'))
  WITH CHECK (auth.uid() = institution_id AND public.has_role(auth.uid(), 'institution'));
CREATE POLICY "Institutions delete own trainings" ON public.trainings FOR DELETE TO authenticated
  USING (auth.uid() = institution_id AND public.has_role(auth.uid(), 'institution'));
CREATE POLICY "Admins manage trainings" ON public.trainings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.trainings REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Recruiters publish own jobs" ON public.jobs;
CREATE POLICY "Recruiters and admins publish own jobs" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = recruiter_id
    AND (public.has_role(auth.uid(), 'recruiter') OR public.has_role(auth.uid(), 'admin'))
  );

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS candidate_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS candidate_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS candidate_phone text NOT NULL DEFAULT '';

UPDATE public.applications
SET candidate_name = coalesce(nullif(candidate_profiles.display_name, ''), profiles.full_name, applications.candidate_name),
    candidate_email = coalesce(profiles.email, applications.candidate_email),
    candidate_phone = coalesce(profiles.phone, applications.candidate_phone),
    cv_url = coalesce(applications.cv_url, candidate_profiles.resume_path)
FROM public.profiles
LEFT JOIN public.candidate_profiles ON candidate_profiles.user_id = profiles.id
WHERE profiles.id = applications.candidate_id;
ALTER TABLE public.applications REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Candidates apply to published jobs" ON public.applications;
CREATE POLICY "Candidates apply to published jobs" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = candidate_id
    AND public.has_role(auth.uid(), 'candidate')
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_id
        AND jobs.status = 'published'
        AND (jobs.opening_date IS NULL OR jobs.opening_date <= current_date)
        AND (jobs.closing_date IS NULL OR jobs.closing_date >= current_date)
    )
  );

CREATE POLICY "Admins read all applications" ON public.applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters read applicant profiles" ON public.candidate_profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.applications
      JOIN public.jobs ON jobs.id = applications.job_id
      WHERE applications.candidate_id = candidate_profiles.user_id
        AND jobs.recruiter_id = auth.uid()
    )
  );
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters read applicant contact details" ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      JOIN public.jobs ON jobs.id = applications.job_id
      WHERE applications.candidate_id = profiles.id
        AND jobs.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters read CVs attached to own applications" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes'
    AND EXISTS (
      SELECT 1 FROM public.applications
      JOIN public.jobs ON jobs.id = applications.job_id
      WHERE jobs.recruiter_id = auth.uid()
        AND applications.cv_url = storage.objects.name
    )
  );
CREATE POLICY "Admins read application CVs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes'
    AND public.has_role(auth.uid(), 'admin')
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.cv_url = storage.objects.name
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'trainings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trainings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
END;
$$;
