-- Add created_by to companies for onboarding-created companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- Authenticated users can create companies they own
CREATE POLICY "Authenticated can create companies they own"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Replace company_members INSERT: allow self-join only for companies user created or Landing
DROP POLICY IF EXISTS "Users can join company (insert) when invited - restricted"
  ON public.company_members;

CREATE POLICY "Users can join company they created or Landing"
  ON public.company_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.created_by = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.slug = 'landing'
      )
    )
  );
