-- Tech stack: move tab labels to landing_tech_stack_categories; items use category_id

CREATE TABLE IF NOT EXISTS public.landing_tech_stack_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  label_en text NOT NULL DEFAULT '',
  label_uk text NOT NULL DEFAULT '',
  label_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_tech_stack_categories_company_sort
  ON public.landing_tech_stack_categories (company_id, sort_order);

-- Backfill: one row per (company, 0..3) from old section column labels; defaults if no section
INSERT INTO public.landing_tech_stack_categories (company_id, sort_order, label_en, label_uk, label_ja)
SELECT
  c.company_id,
  t.ord,
  COALESCE(
    CASE t.ord
      WHEN 0 THEN s.tab_mobile_en
      WHEN 1 THEN s.tab_web_en
      WHEN 2 THEN s.tab_ides_en
      WHEN 3 THEN s.tab_robotics_en
    END,
    (ARRAY['Mobile', 'Web', 'IDEs', 'Robotics'])[t.ord + 1]
  ),
  COALESCE(
    CASE t.ord
      WHEN 0 THEN s.tab_mobile_uk
      WHEN 1 THEN s.tab_web_uk
      WHEN 2 THEN s.tab_ides_uk
      WHEN 3 THEN s.tab_robotics_uk
    END,
    ''
  ),
  COALESCE(
    CASE t.ord
      WHEN 0 THEN s.tab_mobile_ja
      WHEN 1 THEN s.tab_web_ja
      WHEN 2 THEN s.tab_ides_ja
      WHEN 3 THEN s.tab_robotics_ja
    END,
    ''
  )
FROM (
  SELECT DISTINCT company_id FROM public.landing_tech_stack_items
  UNION
  SELECT company_id FROM public.landing_tech_stack_section
) c
LEFT JOIN public.landing_tech_stack_section s ON s.company_id = c.company_id
CROSS JOIN (VALUES (0), (1), (2), (3)) AS t(ord)
WHERE NOT EXISTS (
  SELECT 1 FROM public.landing_tech_stack_categories cat
  WHERE cat.company_id = c.company_id
);

ALTER TABLE public.landing_tech_stack_items
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.landing_tech_stack_categories (id) ON DELETE CASCADE;

UPDATE public.landing_tech_stack_items i
SET category_id = (
  SELECT cat.id
  FROM public.landing_tech_stack_categories cat
  WHERE cat.company_id = i.company_id
    AND cat.sort_order = (
      CASE i.tab_key
        WHEN 'mobile' THEN 0
        WHEN 'web' THEN 1
        WHEN 'ides' THEN 2
        WHEN 'robotics' THEN 3
        ELSE 0
      END
    )
  LIMIT 1
)
WHERE i.category_id IS NULL;

ALTER TABLE public.landing_tech_stack_items
  ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE public.landing_tech_stack_items
  DROP COLUMN IF EXISTS tab_key;

DROP INDEX IF EXISTS idx_landing_tech_stack_items_company_tab_sort;

CREATE INDEX IF NOT EXISTS idx_landing_tech_stack_items_company_category_sort
  ON public.landing_tech_stack_items (company_id, category_id, sort_order);

ALTER TABLE public.landing_tech_stack_section
  DROP COLUMN IF EXISTS tab_mobile_en,
  DROP COLUMN IF EXISTS tab_mobile_uk,
  DROP COLUMN IF EXISTS tab_mobile_ja,
  DROP COLUMN IF EXISTS tab_web_en,
  DROP COLUMN IF EXISTS tab_web_uk,
  DROP COLUMN IF EXISTS tab_web_ja,
  DROP COLUMN IF EXISTS tab_ides_en,
  DROP COLUMN IF EXISTS tab_ides_uk,
  DROP COLUMN IF EXISTS tab_ides_ja,
  DROP COLUMN IF EXISTS tab_robotics_en,
  DROP COLUMN IF EXISTS tab_robotics_uk,
  DROP COLUMN IF EXISTS tab_robotics_ja;

-- RLS for categories
ALTER TABLE public.landing_tech_stack_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read landing_tech_stack_categories for landing"
  ON public.landing_tech_stack_categories FOR SELECT
  TO anon
  USING (company_id IN (SELECT id FROM public.companies WHERE slug = 'landing'));

CREATE POLICY "Members read landing_tech_stack_categories"
  ON public.landing_tech_stack_categories FOR SELECT
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members insert landing_tech_stack_categories"
  ON public.landing_tech_stack_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members update landing_tech_stack_categories"
  ON public.landing_tech_stack_categories FOR UPDATE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()))
  WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Members delete landing_tech_stack_categories"
  ON public.landing_tech_stack_categories FOR DELETE
  TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
