/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * Idempotent: ensures the Landing site company row exists so features that
 * FK to companies (timeline, projects, ensureUserInLanding) work even if
 * an older DB missed the original seed.
 */

INSERT INTO public.companies (name, slug)
VALUES ('Landing', 'landing')
ON CONFLICT (slug) DO NOTHING;
