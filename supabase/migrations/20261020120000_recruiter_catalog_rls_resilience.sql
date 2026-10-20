ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

DROP POLICY IF EXISTS "Owners and admins read companies" ON public.companies;
CREATE POLICY "Owners and admins read companies" ON public.companies
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Company owners create companies" ON public.companies;
CREATE POLICY "Company owners create companies" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'company') OR public.has_role(auth.uid(), 'recruiter')))
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Company owners update companies" ON public.companies;
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

DROP POLICY IF EXISTS "Published jobs are public" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are publicly readable" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters read own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins read all jobs" ON public.jobs;
CREATE POLICY "Published jobs are public" ON public.jobs
  FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Recruiters read own jobs" ON public.jobs
  FOR SELECT TO authenticated
  USING (auth.uid() = recruiter_id);
CREATE POLICY "Admins read all jobs" ON public.jobs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.companies (owner_id, name, description, country, city)
SELECT DISTINCT
  roles.user_id,
  'Entreprise de ' || coalesce(nullif(trim(profiles.full_name), ''), left(roles.user_id::text, 8)),
  '',
  'Sénégal',
  ''
FROM public.user_roles AS roles
LEFT JOIN public.profiles AS profiles ON profiles.id = roles.user_id
WHERE roles.role::text IN ('recruiter', 'company')
ON CONFLICT (owner_id) DO NOTHING;