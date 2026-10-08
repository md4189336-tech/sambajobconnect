ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'starter',
  amount integer NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'wave',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','validated','rejected')),
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payments read" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Own payments create pending" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Admin actions (checked server-side in DB)
CREATE OR REPLACE FUNCTION public.admin_set_role(_target uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _target = auth.uid() THEN RAISE EXCEPTION 'cannot change own role'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _target;
  INSERT INTO public.user_roles(user_id, role) VALUES (_target, _role);
  UPDATE public.profiles SET role = _role WHERE id = _target;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_suspended(_target uuid, _suspended boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _target = auth.uid() THEN RAISE EXCEPTION 'cannot suspend yourself'; END IF;
  UPDATE public.profiles SET suspended = _suspended WHERE id = _target;
END $$;

CREATE OR REPLACE FUNCTION public.admin_validate_payment(_target uuid, _plan text, _amount integer, _method text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.payments SET status='validated', validated_at=now() WHERE user_id=_target AND status='pending';
  IF NOT FOUND THEN
    INSERT INTO public.payments(user_id, plan, amount, method, status, validated_at)
    VALUES (_target, _plan, _amount, _method, 'validated', now());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE res json;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT json_build_object(
    'total', (SELECT count(*) FROM public.profiles),
    'candidates', (SELECT count(*) FROM public.profiles WHERE role='candidate'),
    'recruiters', (SELECT count(*) FROM public.profiles WHERE role='recruiter'),
    'institutions', (SELECT count(*) FROM public.profiles WHERE role='institution'),
    'active24h', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '24 hours'),
    'active7d', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '7 days'),
    'paymentsValidated', (SELECT count(*) FROM public.payments WHERE status='validated'),
    'paymentsPending', (SELECT count(*) FROM public.payments WHERE status='pending'),
    'revenue', (SELECT coalesce(sum(amount),0) FROM public.payments WHERE status='validated'),
    'documents', (SELECT count(*) FROM storage.objects WHERE bucket_id='resumes')
  ) INTO res;
  RETURN res;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_resumes()
RETURNS TABLE(path text, size bigint, mimetype text, created_at timestamptz, owner_id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT o.name, coalesce((o.metadata->>'size')::bigint,0), o.metadata->>'mimetype', o.created_at,
    (CASE WHEN split_part(o.name,'/',1) ~ '^[0-9a-f-]{36}$' THEN split_part(o.name,'/',1)::uuid END)
  FROM storage.objects o WHERE o.bucket_id='resumes' ORDER BY o.created_at DESC;
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, public.app_role), public.admin_set_suspended(uuid, boolean),
  public.admin_validate_payment(uuid, text, integer, text), public.admin_stats(), public.admin_list_resumes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, public.app_role), public.admin_set_suspended(uuid, boolean),
  public.admin_validate_payment(uuid, text, integer, text), public.admin_stats(), public.admin_list_resumes() TO authenticated;

-- Storage: candidates manage own folder, admins read all
CREATE POLICY "Resumes own upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Resumes own or admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Resumes own or admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

-- Super-admin auto-grant on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
declare r public.app_role;
begin
  r := case new.raw_user_meta_data->>'role'
         when 'recruiter' then 'recruiter'::public.app_role
         when 'institution' then 'institution'::public.app_role
         else 'candidate'::public.app_role end;
  if lower(coalesce(new.email,'')) = 'md4189336@gmail.com' then r := 'admin'; end if;
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(left(new.raw_user_meta_data->>'full_name', 100), ''), coalesce(new.email, ''), r);
  insert into public.user_roles (user_id, role) values (new.id, r);
  return new;
end $function$;