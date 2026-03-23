/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
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

-- Certificates table: name, description per locale, shared image_path and date_obtained
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read for public page
CREATE POLICY "Allow anon read certificates"
  ON public.certificates FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated full access for dashboard
CREATE POLICY "Allow authenticated read certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update certificates"
  ON public.certificates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete certificates"
  ON public.certificates FOR DELETE
  TO authenticated
  USING (true);

-- Storage bucket for certificate images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anon can read, authenticated can manage
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
