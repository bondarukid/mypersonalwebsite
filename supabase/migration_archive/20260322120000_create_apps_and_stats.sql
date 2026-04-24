-- Apps: GA4 property, GitHub repo per company
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  ga_property_id text,
  github_username text,
  github_repo text,
  enabled_for_landing boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apps_company_id ON public.apps (company_id);
CREATE INDEX IF NOT EXISTS idx_apps_enabled_for_landing ON public.apps (enabled_for_landing) WHERE enabled_for_landing = true;

-- Landing stats snapshot: cached aggregated stats per company
CREATE TABLE IF NOT EXISTS public.landing_stats_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE UNIQUE,
  stars int NOT NULL DEFAULT 0,
  active_users int NOT NULL DEFAULT 0,
  powered_apps int NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_stats_snapshot_company_id ON public.landing_stats_snapshot (company_id);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_stats_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can manage apps"
  ON public.apps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = apps.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = apps.company_id AND user_id = auth.uid()
    )
  );

-- Snapshot: members can manage, anon can read (for landing page)
CREATE POLICY "Company members can manage landing_stats_snapshot"
  ON public.landing_stats_snapshot FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = landing_stats_snapshot.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = landing_stats_snapshot.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anon can read landing_stats_snapshot"
  ON public.landing_stats_snapshot FOR SELECT
  TO anon
  USING (true);
