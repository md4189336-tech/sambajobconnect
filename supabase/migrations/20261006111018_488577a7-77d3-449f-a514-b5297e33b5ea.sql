create type public.app_role as enum ('candidate','recruiter','institution','admin');

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text not null default '',
  role public.app_role not null default 'candidate',
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare r public.app_role;
begin
  r := case new.raw_user_meta_data->>'role'
         when 'recruiter' then 'recruiter'::public.app_role
         when 'institution' then 'institution'::public.app_role
         else 'candidate'::public.app_role end;
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(left(new.raw_user_meta_data->>'full_name', 100), ''), coalesce(new.email, ''), r);
  insert into public.user_roles (user_id, role) values (new.id, r);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();