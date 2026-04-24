-- Stats API credentials: GA4 and GitHub, encrypted at rest
CREATE TABLE IF NOT EXISTS public.stats_api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE UNIQUE,
  ga_client_email_encrypted text,
  ga_private_key_encrypted text,
  github_token_encrypted text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stats_api_credentials_company_id ON public.stats_api_credentials (company_id);

ALTER TABLE public.stats_api_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can manage stats_api_credentials"
  ON public.stats_api_credentials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = stats_api_credentials.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = stats_api_credentials.company_id AND user_id = auth.uid()
    )
  );
