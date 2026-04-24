-- Landing home: Features section + Tech stack (company-scoped, landing company public read)

-- 1) Feature section (heading + intro)
CREATE TABLE IF NOT EXISTS public.landing_feature_section (
  company_id uuid NOT NULL PRIMARY KEY REFERENCES public.companies (id) ON DELETE CASCADE,
  heading_en text NOT NULL DEFAULT '',
  heading_uk text NOT NULL DEFAULT '',
  heading_ja text NOT NULL DEFAULT '',
  intro_en text NOT NULL DEFAULT '',
  intro_uk text NOT NULL DEFAULT '',
  intro_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Feature cards
CREATE TABLE IF NOT EXISTS public.landing_feature_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  lucide_icon text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_uk text NOT NULL DEFAULT '',
  body_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_feature_cards_company_sort
  ON public.landing_feature_cards (company_id, sort_order);

-- 3) Tech stack section (one row per company)
CREATE TABLE IF NOT EXISTS public.landing_tech_stack_section (
  company_id uuid NOT NULL PRIMARY KEY REFERENCES public.companies (id) ON DELETE CASCADE,
  heading_en text NOT NULL DEFAULT '',
  heading_uk text NOT NULL DEFAULT '',
  heading_ja text NOT NULL DEFAULT '',
  subcopy_en text NOT NULL DEFAULT '',
  subcopy_uk text NOT NULL DEFAULT '',
  subcopy_ja text NOT NULL DEFAULT '',
  learn_more_en text NOT NULL DEFAULT '',
  learn_more_uk text NOT NULL DEFAULT '',
  learn_more_ja text NOT NULL DEFAULT '',
  tab_mobile_en text NOT NULL DEFAULT '',
  tab_mobile_uk text NOT NULL DEFAULT '',
  tab_mobile_ja text NOT NULL DEFAULT '',
  tab_web_en text NOT NULL DEFAULT '',
  tab_web_uk text NOT NULL DEFAULT '',
  tab_web_ja text NOT NULL DEFAULT '',
  tab_ides_en text NOT NULL DEFAULT '',
  tab_ides_uk text NOT NULL DEFAULT '',
  tab_ides_ja text NOT NULL DEFAULT '',
  tab_robotics_en text NOT NULL DEFAULT '',
  tab_robotics_uk text NOT NULL DEFAULT '',
  tab_robotics_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Tech stack items (per tab)
CREATE TABLE IF NOT EXISTS public.landing_tech_stack_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  tab_key text NOT NULL CHECK (tab_key IN ('mobile', 'web', 'ides', 'robotics')),
  sort_order int NOT NULL DEFAULT 0,
  simple_icon_slug text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  desc_uk text NOT NULL DEFAULT '',
  desc_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_tech_stack_items_company_tab_sort
  ON public.landing_tech_stack_items (company_id, tab_key, sort_order);

-- RLS
ALTER TABLE public.landing_feature_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_tech_stack_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_tech_stack_items ENABLE ROW LEVEL SECURITY;

-- Anon: landing company only
CREATE POLICY "Anon read landing_feature_section for landing"
  ON public.landing_feature_section FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Anon read landing_feature_cards for landing"
  ON public.landing_feature_cards FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Anon read landing_tech_stack_section for landing"
  ON public.landing_tech_stack_section FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Anon read landing_tech_stack_items for landing"
  ON public.landing_tech_stack_items FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

-- Authenticated: members
CREATE POLICY "Members read landing_feature_section"
  ON public.landing_feature_section FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_feature_section"
  ON public.landing_feature_section FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_feature_section"
  ON public.landing_feature_section FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members read landing_feature_cards"
  ON public.landing_feature_cards FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_feature_cards"
  ON public.landing_feature_cards FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_feature_cards"
  ON public.landing_feature_cards FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members delete landing_feature_cards"
  ON public.landing_feature_cards FOR DELETE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members read landing_tech_stack_section"
  ON public.landing_tech_stack_section FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_tech_stack_section"
  ON public.landing_tech_stack_section FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_tech_stack_section"
  ON public.landing_tech_stack_section FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members read landing_tech_stack_items"
  ON public.landing_tech_stack_items FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_tech_stack_items"
  ON public.landing_tech_stack_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_tech_stack_items"
  ON public.landing_tech_stack_items FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members delete landing_tech_stack_items"
  ON public.landing_tech_stack_items FOR DELETE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

-- Idempotent seed for landing company (only if missing)
INSERT INTO public.landing_feature_section (
  company_id, heading_en, heading_uk, heading_ja, intro_en, intro_uk, intro_ja
)
SELECT c.id,
  'The foundation for creative teams management',
  'Основа для управління креативними командами',
  'クリエイティブチーム管理の基盤',
  'Ivan Bondaruk brings expertise in full-stack development, modern frameworks, and delivering clean, user-centered solutions.',
  'Іван Бондарук має досвід у full-stack розробці, сучасних фреймворках та створенні чистих, орієнтованих на користувача рішень.',
  'Ivan Bondarukは、フルスタック開発、モダンフレームワーク、そしてクリーンでユーザー中心のソリューション提供に精通しています。'
FROM public.companies c
WHERE c.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.landing_feature_section s WHERE s.company_id = c.id);

INSERT INTO public.landing_feature_cards (company_id, sort_order, lucide_icon, title_en, title_uk, title_ja, body_en, body_uk, body_ja)
SELECT c.id, v.ord, v.luc, v.ten, v.tuk, v.tja, v.ben, v.buk, v.bja
FROM public.companies c
CROSS JOIN (VALUES
  (0, 'zap', 'Faaast', 'Швидко', '高速',
   'It supports an entire helping developers and innovate.',
   'Підтримує всю екосистему, допомагаючи розробникам та інноваціям.',
   '開発者とイノベーションをサポートするエコシステム全体を支援します。'),
  (1, 'cpu', 'Powerful', 'Потужно', '強力',
   'It supports an entire helping developers and businesses.',
   'Підтримує весь стек, допомагаючи розробникам та бізнесу.',
   '開発者とビジネスを支援する全体をサポートします。'),
  (2, 'fingerprint', 'Security', 'Безпека', 'セキュリティ',
   'It supports an helping developers businesses.',
   'Забезпечує безпеку для розробників та бізнесу.',
   '開発者とビジネスのセキュリティをサポートします。'),
  (3, 'pencil', 'Customization', 'Кастомізація', 'カスタマイズ',
   'It supports helping developers and businesses innovate.',
   'Допомагає розробникам та бізнесу створювати інновації.',
   '開発者とビジネスのイノベーションを支援します。'),
  (4, 'settings-2', 'Control', 'Контроль', 'コントロール',
   'It supports helping developers and businesses innovate.',
   'Дає змогу розробникам та бізнесу інноваційно розвиватися.',
   '開発者とビジネスのイノベーションを支援します。'),
  (5, 'sparkles', 'Built for AI', 'Для штучного інтелекту', 'AI対応',
   'It supports helping developers and businesses innovate.',
   'Підтримує інновації для розробників та бізнесу.',
   '開発者とビジネスのイノベーションを支援します。')
) AS v(ord, luc, ten, tuk, tja, ben, buk, bja)
WHERE c.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.landing_feature_cards f WHERE f.company_id = c.id);

INSERT INTO public.landing_tech_stack_section (
  company_id, heading_en, heading_uk, heading_ja, subcopy_en, subcopy_uk, subcopy_ja,
  learn_more_en, learn_more_uk, learn_more_ja,
  tab_mobile_en, tab_mobile_uk, tab_mobile_ja,
  tab_web_en, tab_web_uk, tab_web_ja,
  tab_ides_en, tab_ides_uk, tab_ides_ja,
  tab_robotics_en, tab_robotics_uk, tab_robotics_ja
)
SELECT c.id,
  'Tech Stack & Tooling', 'Технологічний стек та інструменти', 'Tech Stack & ツール',
  'My expertise spans mobile, web, and hardware, utilizing industry-standard tools to deliver robust applications.',
  'Мій досвід охоплює мобільну, веб та апаратну розробку з використанням стандартних інструментів для створення надійних застосунків.',
  'モバイル、ウェブ、ハードウェアをカバーし、業界標準ツールで堅牢なアプリケーションを提供します。',
  'Learn More', 'Детальніше', '詳細',
  'Mobile development', 'Мобільна розробка', 'モバイル開発',
  'Web development', 'Веб-розробка', 'ウェブ開発',
  'IDEs', 'IDE', 'IDE',
  'Robotics & IoT', 'Робототехніка та IoT', 'ロボティクス・IoT'
FROM public.companies c
WHERE c.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.landing_tech_stack_section s WHERE s.company_id = c.id);

-- Tech items (en/uk/ja from messages; icon slugs match app config)
INSERT INTO public.landing_tech_stack_items (company_id, tab_key, sort_order, simple_icon_slug, title_en, title_uk, title_ja, desc_en, desc_uk, desc_ja)
SELECT c.id, w.tab, w.ord, w.slg, w.ten, w.tuk, w.tja, w.ben, w.buk, w.bja
FROM public.companies c
CROSS JOIN (VALUES
  -- mobile
  ('mobile', 0, 'kotlin', 'Kotlin', 'Kotlin', 'Kotlin',
   'Modern language for Android and multiplatform development with concise syntax and null safety.',
   'Сучасна мова для Android та мультиплатформенної розробки з лаконичним синтаксисом та null safety.',
   'Androidおよびマルチプラットフォーム開発のための現代的言語。簡潔な構文とnull safetyを提供。'),
  ('mobile', 1, 'swift', 'Swift', 'Swift', 'Swift',
   'Apple''s powerful language for iOS, macOS, and beyond.',
   'Потужна мова Apple для iOS, macOS та інших платформ.',
   'iOS、macOSなどを支えるAppleの強力な言語。'),
  ('mobile', 2, 'swiftui', 'SwiftUI', 'SwiftUI', 'SwiftUI',
   'Declarative UI framework for building native Apple apps.',
   'Декларативний UI-фреймворк для створення нативних додатків Apple.',
   'ネイティブAppleアプリを構築するための宣言的UIフレームワーク。'),
  ('mobile', 3, 'xcode', 'Xcode', 'Xcode', 'Xcode',
   'Apple''s IDE for building iOS, macOS, watchOS, and tvOS apps.',
   'IDE Apple для розробки додатків iOS, macOS, watchOS та tvOS.',
   'iOS、macOS、watchOS、tvOSアプリを構築するAppleのIDE。'),
  ('mobile', 4, 'androidstudio', 'Android Studio', 'Android Studio', 'Android Studio',
   'Official IDE for Android development with powerful emulator and tools.',
   'Офіційна IDE для розробки Android з потужним емулятором та інструментами.',
   '強力なエミュレータとツールを備えたAndroid開発の公式IDE。'),
  -- web
  ('web', 0, 'nextdotjs', 'Next.js', 'Next.js', 'Next.js',
   'React framework for production with SSR, routing, and optimizations.',
   'React-фреймворк для продакшену з SSR, маршрутизацією та оптимізаціями.',
   'SSR、ルーティング、最適化を備えた本番向けReactフレームワーク。'),
  ('web', 1, 'react', 'React', 'React', 'React',
   'Library for building user interfaces with components and hooks.',
   'Бібліотека для створення інтерфейсів з компонентами та хуками.',
   'コンポーネントとフックでユーザーインターフェースを構築するライブラリ。'),
  ('web', 2, 'shadcnui', 'shadcn/ui', 'shadcn/ui', 'shadcn/ui',
   'Re-usable components built with Radix UI and Tailwind. Copy, paste, and customize.',
   'Повторно використовувані компоненти на базі Radix UI та Tailwind. Копіюй, вставляй, налаштовуй.',
   'Radix UIとTailwindで構築された再利用可能なコンポーネント。コピー、貼り付け、カスタマイズ。'),
  ('web', 3, 'tailwindcss', 'Tailwind CSS', 'Tailwind CSS', 'Tailwind CSS',
   'Utility-first CSS framework for rapid UI development with design tokens.',
   'Utility-first CSS фреймворк для швидкої розробки UI з design tokens.',
   'デザイントークンによる素早いUI開発のためのユーティリティファーストCSSフレームワーク。'),
  -- ides
  ('ides', 0, 'vscodium', 'VS Code', 'VS Code', 'VS Code',
   'Lightweight, extensible code editor by Microsoft.',
   'Легкий і розширюваний редактор коду від Microsoft.',
   'Microsoft製の軽量で拡張可能なコードエディタ。'),
  ('ides', 1, 'webstorm', 'WebStorm', 'WebStorm', 'WebStorm',
   'JetBrains IDE for JavaScript, TypeScript, and web development.',
   'IDE JetBrains для JavaScript, TypeScript та веб-розробки.',
   'JavaScript、TypeScript、Web開発のためのJetBrains IDE。'),
  -- robotics
  ('robotics', 0, 'arduino', 'Arduino', 'Arduino', 'Arduino',
   'Open-source electronics platform for prototyping and IoT projects.',
   'Відкрита платформа електроніки для прототипування та IoT-проєктів.',
   'プロトタイピングとIoTプロジェクトのためのオープンソース電子基板プラットフォーム。')
) AS w(tab, ord, slg, ten, tuk, tja, ben, buk, bja)
WHERE c.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.landing_tech_stack_items t WHERE t.company_id = c.id);
