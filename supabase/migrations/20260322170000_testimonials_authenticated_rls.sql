-- Allow authenticated users to read and update testimonials (dashboard)
CREATE POLICY "Allow authenticated read testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
