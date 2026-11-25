-- Used by the RLS policies. Must exist before the tables' policies are created.
-- plpgsql, so the body is only resolved when it runs (the users table does not exist yet).
-- SECURITY DEFINER so it can read public.users even though that table has RLS enabled.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END
$$;
