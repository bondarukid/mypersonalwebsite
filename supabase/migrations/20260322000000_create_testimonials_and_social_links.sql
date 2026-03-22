-- Testimonials table: quote, author, role per locale
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

-- Social links table: platform, url, enabled
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'threads', 'instagram', 'tiktok')),
  url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_links_enabled ON public.social_links (enabled);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read social_links"
  ON public.social_links FOR SELECT
  TO anon
  USING (true);

-- Seed: Akio Morita testimonial in en, uk, ja (only if empty)
INSERT INTO public.testimonials (locale, quote, author, role, sort_order)
SELECT * FROM (VALUES
  ('en'::text, 'Do not be afraid of making a mistake. But make sure you don''t make the same mistake twice.', 'Akio Morita', 'Co-founder, Sony', 0),
  ('uk', 'Не бійтеся робити помилки. Але переконайтеся, що ви не робите ту саму помилку двічі.', 'Акіо Моріта', 'Співзасновник, Sony', 0),
  ('ja', '失敗を恐れるな。同じ失敗を二度と繰り返さないようにせよ。', '盛田昭夫', '共同創業者、ソニー', 0)
) AS v(locale, quote, author, role, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);

-- Seed: social links (all disabled by default). Unique on platform for upsert.
ALTER TABLE public.social_links ADD CONSTRAINT social_links_platform_unique UNIQUE (platform);

INSERT INTO public.social_links (platform, url, enabled, sort_order) VALUES
  ('twitter', '#', false, 0),
  ('linkedin', '#', false, 1),
  ('facebook', '#', false, 2),
  ('threads', '#', false, 3),
  ('instagram', '#', false, 4),
  ('tiktok', '#', false, 5)
ON CONFLICT (platform) DO NOTHING;
