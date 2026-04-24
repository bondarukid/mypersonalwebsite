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

-- Replace permissive authenticated INSERT/UPDATE/DELETE policies (USING/WITH CHECK true)
-- with membership checks: landing company for site-wide tables; project company for project FAQs.

-- ---------------------------------------------------------------------------
-- certificates (landing editors only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow authenticated update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow authenticated delete certificates" ON public.certificates;

CREATE POLICY "Allow authenticated insert certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  );

CREATE POLICY "Allow authenticated update certificates"
  ON public.certificates FOR UPDATE
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

CREATE POLICY "Allow authenticated delete certificates"
  ON public.certificates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      INNER JOIN public.companies c ON c.id = cm.company_id
      WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
    )
  );

-- ---------------------------------------------------------------------------
-- faq_sets (landing FAQ: project_id IS NULL; project FAQ: project company member)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated insert faq_sets" ON public.faq_sets;
DROP POLICY IF EXISTS "Authenticated update faq_sets" ON public.faq_sets;
DROP POLICY IF EXISTS "Authenticated delete faq_sets" ON public.faq_sets;

CREATE POLICY "Authenticated insert faq_sets"
  ON public.faq_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      faq_sets.project_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.company_members cm
        INNER JOIN public.companies c ON c.id = cm.company_id
        WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
      )
    )
    OR (
      faq_sets.project_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.projects p
        INNER JOIN public.company_members cm ON cm.company_id = p.company_id
        WHERE p.id = faq_sets.project_id AND cm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated update faq_sets"
  ON public.faq_sets FOR UPDATE
  TO authenticated
  USING (
    (
      faq_sets.project_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.company_members cm
        INNER JOIN public.companies c ON c.id = cm.company_id
        WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
      )
    )
    OR (
      faq_sets.project_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.projects p
        INNER JOIN public.company_members cm ON cm.company_id = p.company_id
        WHERE p.id = faq_sets.project_id AND cm.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    (
      faq_sets.project_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.company_members cm
        INNER JOIN public.companies c ON c.id = cm.company_id
        WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
      )
    )
    OR (
      faq_sets.project_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.projects p
        INNER JOIN public.company_members cm ON cm.company_id = p.company_id
        WHERE p.id = faq_sets.project_id AND cm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated delete faq_sets"
  ON public.faq_sets FOR DELETE
  TO authenticated
  USING (
    (
      faq_sets.project_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.company_members cm
        INNER JOIN public.companies c ON c.id = cm.company_id
        WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
      )
    )
    OR (
      faq_sets.project_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.projects p
        INNER JOIN public.company_members cm ON cm.company_id = p.company_id
        WHERE p.id = faq_sets.project_id AND cm.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- faq_items (inherit access via parent faq_set)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated insert faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated update faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated delete faq_items" ON public.faq_items;

CREATE POLICY "Authenticated insert faq_items"
  ON public.faq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      WHERE fs.id = faq_items.faq_set_id
        AND (
          (
            fs.project_id IS NULL
            AND EXISTS (
              SELECT 1 FROM public.company_members cm
              INNER JOIN public.companies c ON c.id = cm.company_id
              WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
            )
          )
          OR (
            fs.project_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.projects p
              INNER JOIN public.company_members cm ON cm.company_id = p.company_id
              WHERE p.id = fs.project_id AND cm.user_id = auth.uid()
            )
          )
        )
    )
  );

CREATE POLICY "Authenticated update faq_items"
  ON public.faq_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      WHERE fs.id = faq_items.faq_set_id
        AND (
          (
            fs.project_id IS NULL
            AND EXISTS (
              SELECT 1 FROM public.company_members cm
              INNER JOIN public.companies c ON c.id = cm.company_id
              WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
            )
          )
          OR (
            fs.project_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.projects p
              INNER JOIN public.company_members cm ON cm.company_id = p.company_id
              WHERE p.id = fs.project_id AND cm.user_id = auth.uid()
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      WHERE fs.id = faq_items.faq_set_id
        AND (
          (
            fs.project_id IS NULL
            AND EXISTS (
              SELECT 1 FROM public.company_members cm
              INNER JOIN public.companies c ON c.id = cm.company_id
              WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
            )
          )
          OR (
            fs.project_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.projects p
              INNER JOIN public.company_members cm ON cm.company_id = p.company_id
              WHERE p.id = fs.project_id AND cm.user_id = auth.uid()
            )
          )
        )
    )
  );

CREATE POLICY "Authenticated delete faq_items"
  ON public.faq_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.faq_sets fs
      WHERE fs.id = faq_items.faq_set_id
        AND (
          (
            fs.project_id IS NULL
            AND EXISTS (
              SELECT 1 FROM public.company_members cm
              INNER JOIN public.companies c ON c.id = cm.company_id
              WHERE cm.user_id = auth.uid() AND c.slug = 'landing'
            )
          )
          OR (
            fs.project_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.projects p
              INNER JOIN public.company_members cm ON cm.company_id = p.company_id
              WHERE p.id = fs.project_id AND cm.user_id = auth.uid()
            )
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- social_links, testimonials (landing editors only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated update social_links" ON public.social_links;

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

DROP POLICY IF EXISTS "Allow authenticated update testimonials" ON public.testimonials;

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
