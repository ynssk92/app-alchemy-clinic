CREATE TABLE public.user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role_assignments TO authenticated;
GRANT ALL ON public.user_role_assignments TO service_role;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assignments" ON public.user_role_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users see own assignments" ON public.user_role_assignments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _module text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments a
      JOIN public.roles r ON r.id = a.role_id
      WHERE a.user_id = _user_id
        AND r.status = 'active'
        AND coalesce((r.permissions -> _module ->> _action)::boolean, false) = true
    )
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text, text) TO authenticated, service_role;