/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

-- faq_sets: landing or project-specific FAQ
CREATE TABLE IF NOT EXISTS public.faq_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
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

ALTER TABLE public.faq_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read faq_sets"
  ON public.faq_sets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated read faq_sets"
  ON public.faq_sets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated insert faq_sets"
  ON public.faq_sets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update faq_sets"
  ON public.faq_sets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete faq_sets"
  ON public.faq_sets FOR DELETE
  TO authenticated
  USING (true);

-- faq_items: individual Q&A items
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

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read faq_items"
  ON public.faq_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated read faq_items"
  ON public.faq_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated insert faq_items"
  ON public.faq_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update faq_items"
  ON public.faq_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete faq_items"
  ON public.faq_items FOR DELETE
  TO authenticated
  USING (true);
