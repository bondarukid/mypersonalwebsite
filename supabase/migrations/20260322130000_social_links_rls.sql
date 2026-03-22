-- Allow authenticated users to update social_links (dashboard admin)
CREATE POLICY "Allow authenticated update social_links"
  ON public.social_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
