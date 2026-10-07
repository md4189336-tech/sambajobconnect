CREATE TABLE public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  sector text not null default '',
  location text not null default '',
  company_name text not null default '',
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are publicly readable" ON public.jobs FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Recruiters insert own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters update own jobs" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = recruiter_id) WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters delete own jobs" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = recruiter_id);