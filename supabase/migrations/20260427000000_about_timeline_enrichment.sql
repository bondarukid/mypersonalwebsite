-- About timeline: date ranges, skills, tags, attachments; storage bucket

-- -----------------------------------------------------------------------------
-- Date range on milestones and depth events
-- -----------------------------------------------------------------------------

ALTER TABLE public.about_timeline_milestones
  ADD COLUMN IF NOT EXISTS ended_on date;

ALTER TABLE public.about_timeline_milestones
  DROP CONSTRAINT IF EXISTS about_timeline_milestones_ended_on_check;

ALTER TABLE public.about_timeline_milestones
  ADD CONSTRAINT about_timeline_milestones_ended_on_check
  CHECK (ended_on IS NULL OR ended_on >= happened_on);

ALTER TABLE public.about_timeline_depth_events
  ADD COLUMN IF NOT EXISTS ended_on date;

ALTER TABLE public.about_timeline_depth_events
  DROP CONSTRAINT IF EXISTS about_timeline_depth_events_ended_on_check;

ALTER TABLE public.about_timeline_depth_events
  ADD CONSTRAINT about_timeline_depth_events_ended_on_check
  CHECK (ended_on IS NULL OR ended_on >= happened_on);

-- -----------------------------------------------------------------------------
-- Skills (per company) + milestone junction
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.about_timeline_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  slug text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  label_uk text NOT NULL DEFAULT '',
  label_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_skills_company_sort
  ON public.about_timeline_skills (company_id, sort_order);

-- -----------------------------------------------------------------------------
-- Tags (per company) + milestone junction
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.about_timeline_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  slug text NOT NULL,
  label_en text NOT NULL DEFAULT '',
  label_uk text NOT NULL DEFAULT '',
  label_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_tags_company_sort
  ON public.about_timeline_tags (company_id, sort_order);

CREATE TABLE IF NOT EXISTS public.about_timeline_milestone_skills (
  milestone_id uuid NOT NULL REFERENCES public.about_timeline_milestones (id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.about_timeline_skills (id) ON DELETE CASCADE,
  PRIMARY KEY (milestone_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_milestone_skills_skill
  ON public.about_timeline_milestone_skills (skill_id);

CREATE TABLE IF NOT EXISTS public.about_timeline_milestone_tags (
  milestone_id uuid NOT NULL REFERENCES public.about_timeline_milestones (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.about_timeline_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (milestone_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_milestone_tags_tag
  ON public.about_timeline_milestone_tags (tag_id);

-- -----------------------------------------------------------------------------
-- Attachments (milestone or depth; exactly one target)
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.about_timeline_attachment_kind AS ENUM (
    'link',
    'image',
    'file',
    'note'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.about_timeline_event_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES public.about_timeline_milestones (id) ON DELETE CASCADE,
  depth_event_id uuid REFERENCES public.about_timeline_depth_events (id) ON DELETE CASCADE,
  kind public.about_timeline_attachment_kind NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  title text,
  body text,
  url text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_timeline_attachment_target_check CHECK (
    (milestone_id IS NOT NULL AND depth_event_id IS NULL)
    OR (milestone_id IS NULL AND depth_event_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_timeline_attachments_milestone
  ON public.about_timeline_event_attachments (milestone_id, sort_order)
  WHERE milestone_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_timeline_attachments_depth
  ON public.about_timeline_event_attachments (depth_event_id, sort_order)
  WHERE depth_event_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- RLS: skills, tags, junctions, attachments
-- -----------------------------------------------------------------------------

ALTER TABLE public.about_timeline_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_milestone_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_milestone_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_event_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon read about_timeline_skills for landing"
  ON public.about_timeline_skills FOR SELECT
  TO anon
  USING (company_id IN (SELECT id FROM public.companies WHERE slug = 'landing'));

CREATE POLICY "Members read about_timeline_skills"
  ON public.about_timeline_skills FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_skills.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members insert about_timeline_skills"
  ON public.about_timeline_skills FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_skills.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members update about_timeline_skills"
  ON public.about_timeline_skills FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_skills.company_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_skills.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members delete about_timeline_skills"
  ON public.about_timeline_skills FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_skills.company_id AND user_id = auth.uid()
  ));

-- Tags (same pattern)
CREATE POLICY "Anon read about_timeline_tags for landing"
  ON public.about_timeline_tags FOR SELECT
  TO anon
  USING (company_id IN (SELECT id FROM public.companies WHERE slug = 'landing'));

CREATE POLICY "Members read about_timeline_tags"
  ON public.about_timeline_tags FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_tags.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members insert about_timeline_tags"
  ON public.about_timeline_tags FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_tags.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members update about_timeline_tags"
  ON public.about_timeline_tags FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_tags.company_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_tags.company_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members delete about_timeline_tags"
  ON public.about_timeline_tags FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = about_timeline_tags.company_id AND user_id = auth.uid()
  ));

-- milestone_skills
CREATE POLICY "Anon read about_timeline_milestone_skills for landing"
  ON public.about_timeline_milestone_skills FOR SELECT
  TO anon
  USING (
    milestone_id IN (
      SELECT id FROM public.about_timeline_milestones
      WHERE company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

CREATE POLICY "Members read about_timeline_milestone_skills"
  ON public.about_timeline_milestone_skills FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_skills.milestone_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Members insert about_timeline_milestone_skills"
  ON public.about_timeline_milestone_skills FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_skills.milestone_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Members delete about_timeline_milestone_skills"
  ON public.about_timeline_milestone_skills FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_skills.milestone_id AND cm.user_id = auth.uid()
  ));

-- milestone_tags
CREATE POLICY "Anon read about_timeline_milestone_tags for landing"
  ON public.about_timeline_milestone_tags FOR SELECT
  TO anon
  USING (
    milestone_id IN (
      SELECT id FROM public.about_timeline_milestones
      WHERE company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

CREATE POLICY "Members read about_timeline_milestone_tags"
  ON public.about_timeline_milestone_tags FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_tags.milestone_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Members insert about_timeline_milestone_tags"
  ON public.about_timeline_milestone_tags FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_tags.milestone_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Members delete about_timeline_milestone_tags"
  ON public.about_timeline_milestone_tags FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.about_timeline_milestones m
    INNER JOIN public.company_members cm ON cm.company_id = m.company_id
    WHERE m.id = about_timeline_milestone_tags.milestone_id AND cm.user_id = auth.uid()
  ));

-- Attachments (milestone)
CREATE POLICY "Anon read about_timeline_attachments milestone for landing"
  ON public.about_timeline_event_attachments FOR SELECT
  TO anon
  USING (
    milestone_id IS NOT NULL
    AND milestone_id IN (
      SELECT id FROM public.about_timeline_milestones
      WHERE company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

-- Attachments (depth)
CREATE POLICY "Anon read about_timeline_attachments depth for landing"
  ON public.about_timeline_event_attachments FOR SELECT
  TO anon
  USING (
    depth_event_id IS NOT NULL
    AND depth_event_id IN (
      SELECT d.id FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      WHERE m.company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

-- Combined: authenticated read any row where member can read parent milestone/depth
CREATE POLICY "Members read about_timeline_attachments"
  ON public.about_timeline_event_attachments FOR SELECT
  TO authenticated
  USING (
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_event_attachments.milestone_id AND cm.user_id = auth.uid()
    ))
    OR
    (depth_event_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE d.id = about_timeline_event_attachments.depth_event_id AND cm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Members insert about_timeline_attachments"
  ON public.about_timeline_event_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = (SELECT company_id FROM public.about_timeline_milestones WHERE id = milestone_id)
        AND user_id = auth.uid()
    ))
    OR
    (depth_event_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE d.id = depth_event_id AND cm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Members update about_timeline_attachments"
  ON public.about_timeline_event_attachments FOR UPDATE
  TO authenticated
  USING (
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = (SELECT company_id FROM public.about_timeline_milestones WHERE id = milestone_id)
        AND user_id = auth.uid()
    ))
    OR
    (depth_event_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE d.id = depth_event_id AND cm.user_id = auth.uid()
    ))
  )
  WITH CHECK (
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = (SELECT company_id FROM public.about_timeline_milestones WHERE id = milestone_id)
        AND user_id = auth.uid()
    ))
    OR
    (depth_event_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE d.id = depth_event_id AND cm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Members delete about_timeline_attachments"
  ON public.about_timeline_event_attachments FOR DELETE
  TO authenticated
  USING (
    (milestone_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = (SELECT company_id FROM public.about_timeline_milestones WHERE id = milestone_id)
        AND user_id = auth.uid()
    ))
    OR
    (depth_event_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.about_timeline_depth_events d
      INNER JOIN public.about_timeline_milestones m ON m.id = d.milestone_id
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE d.id = depth_event_id AND cm.user_id = auth.uid()
    ))
  );

-- -----------------------------------------------------------------------------
-- Storage
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('about-timeline', 'about-timeline', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon read about-timeline bucket"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'about-timeline');

CREATE POLICY "Allow authenticated upload about-timeline"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'about-timeline');

CREATE POLICY "Allow authenticated update about-timeline"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'about-timeline');

CREATE POLICY "Allow authenticated delete about-timeline"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'about-timeline');
