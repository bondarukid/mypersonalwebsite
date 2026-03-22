-- Companies and company_members tables
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON public.company_members (user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON public.company_members (company_id);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read companies they belong to"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = companies.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can read Landing company to join"
  ON public.companies FOR SELECT
  TO authenticated
  USING (slug = 'landing');

CREATE POLICY "Anon can read Landing company for public stats"
  ON public.companies FOR SELECT
  TO anon
  USING (slug = 'landing');

CREATE POLICY "Members can read company_members for their companies"
  ON public.company_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = company_members.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join company (insert) when invited - restricted"
  ON public.company_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Seed: Landing company
INSERT INTO public.companies (name, slug) VALUES ('Landing', 'landing') ON CONFLICT (slug) DO NOTHING;
