-- Allow authenticated users to read social_links (dashboard admin)
CREATE POLICY "Allow authenticated read social_links"
  ON public.social_links FOR SELECT
  TO authenticated
  USING (true);
