-- Public landing: editable copy + optional manual numbers for the stats block

CREATE TABLE IF NOT EXISTS public.landing_stats_content (
  company_id uuid NOT NULL PRIMARY KEY REFERENCES public.companies (id) ON DELETE CASCADE,
  heading_en text NOT NULL DEFAULT '',
  heading_uk text NOT NULL DEFAULT '',
  heading_ja text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_uk text NOT NULL DEFAULT '',
  description_ja text NOT NULL DEFAULT '',
  label_stars_en text NOT NULL DEFAULT '',
  label_stars_uk text NOT NULL DEFAULT '',
  label_stars_ja text NOT NULL DEFAULT '',
  label_active_en text NOT NULL DEFAULT '',
  label_active_uk text NOT NULL DEFAULT '',
  label_active_ja text NOT NULL DEFAULT '',
  label_powered_en text NOT NULL DEFAULT '',
  label_powered_uk text NOT NULL DEFAULT '',
  label_powered_ja text NOT NULL DEFAULT '',
  use_manual_totals boolean NOT NULL DEFAULT false,
  manual_stars int NOT NULL DEFAULT 0,
  manual_active_users int NOT NULL DEFAULT 0,
  manual_powered_apps int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_stats_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read landing_stats_content for landing"
  ON public.landing_stats_content FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Members read landing_stats_content"
  ON public.landing_stats_content FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_stats_content"
  ON public.landing_stats_content FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_stats_content"
  ON public.landing_stats_content FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

-- Seed (idempotent)
INSERT INTO public.landing_stats_content (
  company_id,
  heading_en, heading_uk, heading_ja,
  description_en, description_uk, description_ja,
  label_stars_en, label_stars_uk, label_stars_ja,
  label_active_en, label_active_uk, label_active_ja,
  label_powered_en, label_powered_uk, label_powered_ja
)
SELECT c.id,
  'Ivan Bondaruk in numbers',
  'Іван Бондарук у цифрах',
  'Ivan Bondarukの数字',
  'Highlights of Ivan Bondaruk''s work and impact across projects, open source, and collaborations.',
  'Основні показники роботи Івана Бондарука: проєкти, open source та співпраця.',
  'プロジェクト、オープンソース、コラボレーションにおけるIvan Bondarukの実績のハイライト.',
  'Stars on GitHub',
  'Зірок на GitHub',
  'GitHubのスター数',
  'Active Users',
  'Активних користувачів',
  'アクティブユーザー',
  'Powered Apps',
  'Створених додатків',
  '構築したアプリ'
FROM public.companies c
WHERE c.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.landing_stats_content x WHERE x.company_id = c.id);
