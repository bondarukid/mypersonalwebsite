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

-- Projects table (company-scoped)
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

-- Storage bucket for project icons
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
