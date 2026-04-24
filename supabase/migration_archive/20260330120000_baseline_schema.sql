/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * Consolidated baseline schema: single migration replacing former incremental
 * migrations through 20260329170000. Final RLS matches 291500 (faq/certificates)
 * and 291200 (testimonials/social_links UPDATE); schema includes company_id
 * on certificates and faq_sets from creation.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

-- =============================================================================
-- 1. Profiles + auth trigger
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    new.id,
    trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', ''))
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. Companies + company_members (created_by on companies from the start)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
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

-- Membership check bypasses RLS; policies must not SELECT company_members directly
-- or PostgreSQL raises "infinite recursion detected in policy for relation company_members".
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

CREATE POLICY "Members can read companies they belong to"
  ON public.companies FOR SELECT
  TO authenticated
  USING (public.is_company_member(companies.id, auth.uid()));

CREATE POLICY "Authenticated can read Landing company to join"
  ON public.companies FOR SELECT
  TO authenticated
  USING (slug = 'landing');

CREATE POLICY "Anon can read Landing company for public stats"
  ON public.companies FOR SELECT
  TO anon
  USING (slug = 'landing');

CREATE POLICY "Authenticated can create companies they own"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Members can read company_members for their companies"
  ON public.company_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_company_member(company_members.company_id, auth.uid())
  );

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

INSERT INTO public.companies (name, slug)
VALUES ('Landing', 'landing')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 3. ensure_landing_company RPC (bootstrap when RLS blocks direct INSERT)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.ensure_landing_company()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
BEGIN
  INSERT INTO public.companies (name, slug)
  VALUES ('Landing', 'landing')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO cid FROM public.companies WHERE slug = 'landing' LIMIT 1;
  RETURN cid;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_landing_company() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_landing_company() TO anon;
GRANT EXECUTE ON FUNCTION public.ensure_landing_company() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_landing_company() TO service_role;

-- =============================================================================
-- 4. Testimonials + social_links (final UPDATE RLS: landing members only)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('en', 'uk', 'ja')),
  quote text NOT NULL,
  author text NOT NULL,
  role text NOT NULL,
  avatar_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_locale ON public.testimonials (locale);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read testimonials"
  ON public.testimonials FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  );

CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'threads', 'instagram', 'tiktok')),
  url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_links_platform_unique UNIQUE (platform)
);

CREATE INDEX IF NOT EXISTS idx_social_links_enabled ON public.social_links (enabled);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read social_links"
  ON public.social_links FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read social_links"
  ON public.social_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update social_links"
  ON public.social_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  );

INSERT INTO public.testimonials (locale, quote, author, role, sort_order)
SELECT * FROM (VALUES
  ('en'::text, 'Do not be afraid of making a mistake. But make sure you don''t make the same mistake twice.', 'Akio Morita', 'Co-founder, Sony', 0),
  ('uk', 'Не бійтеся робити помилки. Але переконайтеся, що ви не робите ту саму помилку двічі.', 'Акіо Моріта', 'Співзасновник, Sony', 0),
  ('ja', '失敗を恐れるな。同じ失敗を二度と繰り返さないようにせよ。', '盛田昭夫', '共同創業者、ソニー', 0)
) AS v(locale, quote, author, role, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);

INSERT INTO public.social_links (platform, url, enabled, sort_order) VALUES
  ('twitter', '#', false, 0),
  ('linkedin', '#', false, 1),
  ('facebook', '#', false, 2),
  ('threads', '#', false, 3),
  ('instagram', '#', false, 4),
  ('tiktok', '#', false, 5)
ON CONFLICT (platform) DO NOTHING;

-- =============================================================================
-- 5. Apps + landing_stats_snapshot
-- =============================================================================

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

-- =============================================================================
-- 6. Stats API credentials
-- =============================================================================

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

-- =============================================================================
-- 7. Certificates (company_id from creation; RLS from 291500)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en', 'uk', 'ja')),
  name text NOT NULL,
  description text,
  image_path text NOT NULL,
  date_obtained date NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_locale ON public.certificates (locale);
CREATE INDEX IF NOT EXISTS idx_certificates_sort_order ON public.certificates (sort_order);
CREATE INDEX IF NOT EXISTS idx_certificates_company_id ON public.certificates (company_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read certificates"
  ON public.certificates FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Members read certificates of their company"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = certificates.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert certificates in their company"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = certificates.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members update certificates of their company"
  ON public.certificates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = certificates.company_id AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = certificates.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete certificates of their company"
  ON public.certificates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = certificates.company_id AND cm.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon read certificates bucket"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated upload certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated update certificates bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated delete certificates bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates');

-- =============================================================================
-- 8. Projects + project-icons storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon_path text,
  itunes_bundle_id text,
  store_links jsonb NOT NULL DEFAULT '{}',
  platforms jsonb NOT NULL DEFAULT '{}',
  min_os_versions jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects (company_id);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects (sort_order);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read projects for landing company"
  ON public.projects FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Members read projects of their companies"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = projects.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert projects in their companies"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = projects.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members update projects in their companies"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = projects.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = projects.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete projects in their companies"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = projects.company_id AND user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-icons', 'project-icons', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon read project-icons bucket"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'project-icons');

CREATE POLICY "Allow authenticated upload project-icons"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-icons');

CREATE POLICY "Allow authenticated update project-icons"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-icons');

CREATE POLICY "Allow authenticated delete project-icons"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-icons');

-- =============================================================================
-- 9. FAQ sets + items (company_id from creation; RLS from 291500)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.faq_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects (id) ON DELETE CASCADE,
  title_en text,
  title_uk text,
  title_ja text,
  support_blurb_en text,
  support_blurb_uk text,
  support_blurb_ja text,
  support_link text,
  support_link_text_en text,
  support_link_text_uk text,
  support_link_text_ja text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_sets_project_id ON public.faq_sets (project_id);
CREATE INDEX IF NOT EXISTS idx_faq_sets_slug ON public.faq_sets (slug);
CREATE INDEX IF NOT EXISTS idx_faq_sets_company_id ON public.faq_sets (company_id);

CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_set_id uuid NOT NULL REFERENCES public.faq_sets (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  question_en text NOT NULL DEFAULT '',
  question_uk text NOT NULL DEFAULT '',
  question_ja text NOT NULL DEFAULT '',
  answer_en text NOT NULL DEFAULT '',
  answer_uk text NOT NULL DEFAULT '',
  answer_ja text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'help-circle',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_items_faq_set_id ON public.faq_items (faq_set_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_sort_order ON public.faq_items (sort_order);

ALTER TABLE public.faq_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read faq_sets"
  ON public.faq_sets FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Members read faq_sets of their company"
  ON public.faq_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = faq_sets.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert faq_sets in their company"
  ON public.faq_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = faq_sets.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members update faq_sets of their company"
  ON public.faq_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = faq_sets.company_id AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = faq_sets.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete faq_sets of their company"
  ON public.faq_sets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = faq_sets.company_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon read faq_items"
  ON public.faq_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      WHERE fs.id = faq_items.faq_set_id
        AND fs.company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

CREATE POLICY "Members read faq_items via parent faq_set"
  ON public.faq_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      INNER JOIN public.company_members cm ON cm.company_id = fs.company_id
      WHERE fs.id = faq_items.faq_set_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert faq_items via parent faq_set"
  ON public.faq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      INNER JOIN public.company_members cm ON cm.company_id = fs.company_id
      WHERE fs.id = faq_items.faq_set_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members update faq_items via parent faq_set"
  ON public.faq_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      INNER JOIN public.company_members cm ON cm.company_id = fs.company_id
      WHERE fs.id = faq_items.faq_set_id AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      INNER JOIN public.company_members cm ON cm.company_id = fs.company_id
      WHERE fs.id = faq_items.faq_set_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete faq_items via parent faq_set"
  ON public.faq_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      INNER JOIN public.company_members cm ON cm.company_id = fs.company_id
      WHERE fs.id = faq_items.faq_set_id AND cm.user_id = auth.uid()
    )
  );

INSERT INTO public.faq_sets (
  slug,
  company_id,
  title_en,
  title_uk,
  title_ja,
  support_blurb_en,
  support_blurb_uk,
  support_blurb_ja,
  support_link,
  support_link_text_en,
  support_link_text_uk,
  support_link_text_ja
)
SELECT
  'landing',
  (SELECT id FROM public.companies WHERE slug = 'landing' LIMIT 1),
  'Frequently Asked Questions',
  'Часті запитання',
  'よくある質問',
  'Can''t find what you''re looking for? Contact our',
  'Не знайшли потрібне? Зв''яжіться з нашим',
  'お探しの情報が見つかりませんか？',
  '#',
  'customer support team',
  'службу підтримки',
  'カスタマーサポート'
WHERE NOT EXISTS (SELECT 1 FROM public.faq_sets WHERE slug = 'landing');

INSERT INTO public.faq_items (faq_set_id, sort_order, question_en, question_uk, question_ja, answer_en, answer_uk, answer_ja, icon)
SELECT
  fs.id,
  v.ord,
  v.q_en,
  v.q_uk,
  v.q_ja,
  v.a_en,
  v.a_uk,
  v.a_ja,
  v.ico
FROM public.faq_sets fs
CROSS JOIN (VALUES
  (0, 'What are your business hours?', 'Які ваші години роботи?', '営業時間は何時ですか？',
   'Our customer service team is available Monday through Friday from 9:00 AM to 8:00 PM EST, and weekends from 10:00 AM to 6:00 PM EST. During holidays, hours may vary and will be posted on our website.',
   'Наша служба підтримки працює з понеділка по п''ятницю з 9:00 до 20:00 EST, у вихідні з 10:00 до 18:00 EST.',
   'カスタマーサポートは平日9:00〜20:00、週末10:00〜18:00（EST）です。祝日は変動することがあります。',
   'clock'),
  (1, 'How do subscription payments work?', 'Як працюють платежі за підпискою?', 'サブスクリプションの支払いはどのように機能しますか？',
   'Subscription payments are automatically charged to your default payment method on the same day each month or year, depending on your billing cycle. You can update your payment information and view billing history in your account dashboard.',
   'Платежі за підпискою автоматично списуються з вашого платіжного методу щомісяця або щороку. Інформацію можна оновити в особистому кабінеті.',
   'サブスクリプションは、請求サイクルに応じて毎月または毎年、同じ日にデフォルトの支払い方法に自動的に請求されます。アカウントダッシュボードで支払い情報を更新し、請求履歴を確認できます。',
   'credit-card'),
  (2, 'Can I expedite my shipping?', 'Чи можу я прискорити доставку?', '配送を expedite できますか？',
   'Yes, we offer several expedited shipping options at checkout. Next-day and 2-day shipping are available for most U.S. addresses if orders are placed before 2:00 PM EST.',
   'Так, ми пропонуємо кілька варіантів прискореної доставки при оформленні замовлення.',
   'はい、チェックアウト時に複数の迅速配送オプションをご用意しています。',
   'truck'),
  (3, 'Do you offer localized support?', 'Чи пропонуєте ви локалізовану підтримку?', '現地語のサポートはありますか？',
   'We offer multilingual support in English, Spanish, French, German, and Japanese. Our support team can assist customers in these languages via email, chat, and phone during standard business hours for each respective region.',
   'Ми пропонуємо багатомовну підтримку англійською, іспанською, французькою, німецькою та японською.',
   '英語、スペイン語、フランス語、ドイツ語、日本語で多言語サポートを提供しています。',
   'globe'),
  (4, 'How do I track my order?', 'Як відстежити замовлення?', '注文を追跡するには？',
   'Once your order ships, you will receive a confirmation email with a tracking number. You can use this number on our website or the carrier''s website to track your package. You can also view order status and tracking information in your account dashboard under "Order History."',
   'Після відправлення замовлення ви отримаєте email із номером відстеження. Ви можете переглянути статус замовлення в особистому кабінеті.',
   '発送後、追跡番号を含む確認メールが届きます。当社のウェブサイトまたは運送業者のウェブサイトで追跡できます。「注文履歴」で確認することもできます。',
   'package')
) AS v(ord, q_en, q_uk, q_ja, a_en, a_uk, a_ja, ico)
WHERE fs.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.faq_items WHERE faq_set_id = fs.id LIMIT 1);

UPDATE public.faq_sets fs
SET company_id = lc.id,
    updated_at = now()
FROM (SELECT id FROM public.companies WHERE slug = 'landing' LIMIT 1) AS lc
WHERE fs.slug = 'landing'
  AND fs.project_id IS NULL
  AND fs.company_id IS DISTINCT FROM lc.id;

-- =============================================================================
-- 10. About page timeline (from 20260328000000_create_about_timeline.sql)
-- =============================================================================

-- About page timeline milestones (company-scoped, landing = public site)
CREATE TABLE IF NOT EXISTS public.about_timeline_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  happened_on date NOT NULL,
  icon text NOT NULL DEFAULT 'circle',
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_uk text NOT NULL DEFAULT '',
  description_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_milestones_company_id
  ON public.about_timeline_milestones (company_id);
CREATE INDEX IF NOT EXISTS idx_about_timeline_milestones_company_sort
  ON public.about_timeline_milestones (company_id, sort_order);

CREATE TABLE IF NOT EXISTS public.about_timeline_depth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.about_timeline_milestones (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  happened_on date NOT NULL,
  icon text NOT NULL DEFAULT 'circle',
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_uk text NOT NULL DEFAULT '',
  body_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_depth_milestone_id
  ON public.about_timeline_depth_events (milestone_id);
CREATE INDEX IF NOT EXISTS idx_about_timeline_depth_milestone_sort
  ON public.about_timeline_depth_events (milestone_id, sort_order);

ALTER TABLE public.about_timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_depth_events ENABLE ROW LEVEL SECURITY;

-- Public read (landing company only)
CREATE POLICY "Anon read about timeline milestones for landing"
  ON public.about_timeline_milestones FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Anon read about timeline depth for landing"
  ON public.about_timeline_depth_events FOR SELECT
  TO anon
  USING (
    milestone_id IN (
      SELECT id FROM public.about_timeline_milestones
      WHERE company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

-- Authenticated read (members)
CREATE POLICY "Members read about timeline milestones"
  ON public.about_timeline_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members read about timeline depth events"
  ON public.about_timeline_depth_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert about timeline milestones"
  ON public.about_timeline_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members update about timeline milestones"
  ON public.about_timeline_milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete about timeline milestones"
  ON public.about_timeline_milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert about timeline depth events"
  ON public.about_timeline_depth_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members update about timeline depth events"
  ON public.about_timeline_depth_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete about timeline depth events"
  ON public.about_timeline_depth_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

-- Seed from previous English JSON defaults (only if empty)
INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 0, '2010-09-01'::date, 'graduation-cap',
  'First step into STEM education',
  'Placeholder: add how you discovered teaching or technology.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (
  SELECT 1 FROM public.about_timeline_milestones m2 WHERE m2.company_id = c.id AND m2.sort_order = 0
);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 1, '2015-01-01'::date, 'bot',
  'Deepening robotics & programming',
  'Placeholder: robotics kits, competitions, or classroom initiatives.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 1 AND company_id = c.id);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 2, '2020-06-01'::date, 'cpu',
  'Web & IoT projects',
  'Placeholder: major web builds or hardware projects you want to highlight.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 2 AND company_id = c.id);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 3, '2024-01-01'::date, 'sparkles',
  'Today',
  'Placeholder: what you are working on now—courses, products, or research.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 3 AND company_id = c.id);

-- Depth seed (only if no depth rows yet)
INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2008-06-15'::date, 'circle',
  'First hands-on tech projects',
  'Placeholder: summer camps, hobby electronics, or early programming experiments that pointed you toward STEM.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events LIMIT 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2009-03-10'::date, 'circle',
  'Choosing a teaching-oriented path',
  'Placeholder: school electives, mentors, or competitions that shaped your interest in education.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2010-08-20'::date, 'circle',
  'Formal start of this chapter',
  'Placeholder: enrollment, first classroom experience, or a defining project before this milestone date.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2012-04-01'::date, 'circle',
  'First robotics kit in the classroom',
  'Placeholder: platform, age group, and what students built first.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2013-11-05'::date, 'circle',
  'Regional competition or showcase',
  'Placeholder: team structure, awards, and lessons learned.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2014-09-12'::date, 'circle',
  'Curriculum integration',
  'Placeholder: how robotics fit into wider CS goals and assessment.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2017-02-18'::date, 'circle',
  'First production web stack',
  'Placeholder: frameworks, hosting, and what shipped to real users.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2018-10-30'::date, 'circle',
  'IoT prototype to pilot',
  'Placeholder: hardware, protocols, and field testing.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2019-12-01'::date, 'circle',
  'Scaling lessons',
  'Placeholder: reliability, security, and maintainability before the main milestone.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2021-06-01'::date, 'circle',
  'Current teaching focus',
  'Placeholder: courses, robotics labs, or student outcomes you prioritize.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2022-09-15'::date, 'circle',
  'Product or research thread',
  'Placeholder: web, IoT, or mobile work in progress.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2023-11-01'::date, 'circle',
  'Near-term goals',
  'Placeholder: what you want to achieve before the next update to this timeline.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);
