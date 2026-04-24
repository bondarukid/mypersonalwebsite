/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * Fix: RLS policy on company_members used EXISTS (SELECT ... FROM company_members),
 * which re-evaluated RLS on the same table and caused infinite recursion.
 * Use SECURITY DEFINER helper is_company_member() for membership checks.
 */

CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_company_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_member(uuid, uuid) TO service_role;

DROP POLICY IF EXISTS "Members can read companies they belong to" ON public.companies;
CREATE POLICY "Members can read companies they belong to"
  ON public.companies FOR SELECT
  TO authenticated
  USING (public.is_company_member(companies.id, auth.uid()));

DROP POLICY IF EXISTS "Members can read company_members for their companies" ON public.company_members;
CREATE POLICY "Members can read company_members for their companies"
  ON public.company_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_company_member(company_members.company_id, auth.uid())
  );
