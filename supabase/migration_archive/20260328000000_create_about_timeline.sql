/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

-- About page timeline milestones (company-scoped, landing = public site)
CREATE TABLE IF NOT EXISTS public.about_timeline_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  happened_on date NOT NULL,
  icon text NOT NULL DEFAULT 'circle',
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_uk text NOT NULL DEFAULT '',
  description_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_milestones_company_id
  ON public.about_timeline_milestones (company_id);
CREATE INDEX IF NOT EXISTS idx_about_timeline_milestones_company_sort
  ON public.about_timeline_milestones (company_id, sort_order);

CREATE TABLE IF NOT EXISTS public.about_timeline_depth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.about_timeline_milestones (id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  happened_on date NOT NULL,
  icon text NOT NULL DEFAULT 'circle',
  title_en text NOT NULL DEFAULT '',
  title_uk text NOT NULL DEFAULT '',
  title_ja text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_uk text NOT NULL DEFAULT '',
  body_ja text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_about_timeline_depth_milestone_id
  ON public.about_timeline_depth_events (milestone_id);
CREATE INDEX IF NOT EXISTS idx_about_timeline_depth_milestone_sort
  ON public.about_timeline_depth_events (milestone_id, sort_order);

ALTER TABLE public.about_timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline_depth_events ENABLE ROW LEVEL SECURITY;

-- Public read (landing company only)
CREATE POLICY "Anon read about timeline milestones for landing"
  ON public.about_timeline_milestones FOR SELECT
  TO anon
  USING (
    company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
  );

CREATE POLICY "Anon read about timeline depth for landing"
  ON public.about_timeline_depth_events FOR SELECT
  TO anon
  USING (
    milestone_id IN (
      SELECT id FROM public.about_timeline_milestones
      WHERE company_id IN (SELECT id FROM public.companies WHERE slug = 'landing')
    )
  );

-- Authenticated read (members)
CREATE POLICY "Members read about timeline milestones"
  ON public.about_timeline_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members read about timeline depth events"
  ON public.about_timeline_depth_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert about timeline milestones"
  ON public.about_timeline_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members update about timeline milestones"
  ON public.about_timeline_milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete about timeline milestones"
  ON public.about_timeline_milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_id = about_timeline_milestones.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members insert about timeline depth events"
  ON public.about_timeline_depth_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members update about timeline depth events"
  ON public.about_timeline_depth_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members delete about timeline depth events"
  ON public.about_timeline_depth_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.about_timeline_milestones m
      INNER JOIN public.company_members cm ON cm.company_id = m.company_id
      WHERE m.id = about_timeline_depth_events.milestone_id AND cm.user_id = auth.uid()
    )
  );

-- Seed from previous English JSON defaults (only if empty)
INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 0, '2010-09-01'::date, 'graduation-cap',
  'First step into STEM education',
  'Placeholder: add how you discovered teaching or technology.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (
  SELECT 1 FROM public.about_timeline_milestones m2 WHERE m2.company_id = c.id AND m2.sort_order = 0
);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 1, '2015-01-01'::date, 'bot',
  'Deepening robotics & programming',
  'Placeholder: robotics kits, competitions, or classroom initiatives.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 1 AND company_id = c.id);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 2, '2020-06-01'::date, 'cpu',
  'Web & IoT projects',
  'Placeholder: major web builds or hardware projects you want to highlight.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 2 AND company_id = c.id);

INSERT INTO public.about_timeline_milestones (
  company_id, sort_order, happened_on, icon,
  title_en, description_en, title_uk, title_ja, description_uk, description_ja
)
SELECT c.id, 3, '2024-01-01'::date, 'sparkles',
  'Today',
  'Placeholder: what you are working on now—courses, products, or research.',
  '', '', '', ''
FROM public.companies c WHERE c.slug = 'landing'
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_milestones WHERE sort_order = 3 AND company_id = c.id);

-- Depth seed (only if no depth rows yet)
INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2008-06-15'::date, 'circle',
  'First hands-on tech projects',
  'Placeholder: summer camps, hobby electronics, or early programming experiments that pointed you toward STEM.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events LIMIT 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2009-03-10'::date, 'circle',
  'Choosing a teaching-oriented path',
  'Placeholder: school electives, mentors, or competitions that shaped your interest in education.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2010-08-20'::date, 'circle',
  'Formal start of this chapter',
  'Placeholder: enrollment, first classroom experience, or a defining project before this milestone date.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 0
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2012-04-01'::date, 'circle',
  'First robotics kit in the classroom',
  'Placeholder: platform, age group, and what students built first.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2013-11-05'::date, 'circle',
  'Regional competition or showcase',
  'Placeholder: team structure, awards, and lessons learned.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2014-09-12'::date, 'circle',
  'Curriculum integration',
  'Placeholder: how robotics fit into wider CS goals and assessment.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 1
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2017-02-18'::date, 'circle',
  'First production web stack',
  'Placeholder: frameworks, hosting, and what shipped to real users.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2018-10-30'::date, 'circle',
  'IoT prototype to pilot',
  'Placeholder: hardware, protocols, and field testing.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2019-12-01'::date, 'circle',
  'Scaling lessons',
  'Placeholder: reliability, security, and maintainability before the main milestone.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 2
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 0, '2021-06-01'::date, 'circle',
  'Current teaching focus',
  'Placeholder: courses, robotics labs, or student outcomes you prioritize.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 0);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 1, '2022-09-15'::date, 'circle',
  'Product or research thread',
  'Placeholder: web, IoT, or mobile work in progress.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 1);

INSERT INTO public.about_timeline_depth_events (
  milestone_id, sort_order, happened_on, icon, title_en, body_en, title_uk, title_ja, body_uk, body_ja
)
SELECT m.id, 2, '2023-11-01'::date, 'circle',
  'Near-term goals',
  'Placeholder: what you want to achieve before the next update to this timeline.',
  '', '', '', ''
FROM public.about_timeline_milestones m
INNER JOIN public.companies c ON c.id = m.company_id AND c.slug = 'landing'
WHERE m.sort_order = 3
AND NOT EXISTS (SELECT 1 FROM public.about_timeline_depth_events WHERE milestone_id = m.id AND sort_order = 2);
