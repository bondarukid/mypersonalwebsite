# Projects & Project Pages Guide

How to add projects and public `/projects/[slug]` pages. All data is in the repo — edit TypeScript under `src/content/`.

## Overview

Each project is a `Project` row in [`src/content/projects.ts`](../src/content/projects.ts). The public page shows:

1. **Hero** — name, description, icon, store links (from `store_links`)
2. **FAQ** — optional block when a matching FAQ set exists in [`src/content/faq.ts`](../src/content/faq.ts)

## Add a project

1. Open [`src/content/projects.ts`](../src/content/projects.ts).
2. Append an object to the `projects` array with:
   - **`id`** — stable UUID string (generate one and keep it fixed).
   - **`name`**, **`slug`** — `slug` becomes the URL (`/projects/your-slug`).
   - **`description`** — shown on the list and detail page.
   - **`icon_path`** — `null`, a path under `public/images/project-icons/` (e.g. `my-app.png` → file at `public/images/project-icons/my-app.png`), or an absolute image URL.
   - **`store_links`** — keys match your platform config (see [`src/config/platforms.ts`](../src/config/platforms.ts)); use `"#"` or omit for unused stores.
   - **`platforms`**, **`min_os_versions`** — optional metadata maps.
   - **`sort_order`** — lower numbers appear first on `/projects`.
   - **`created_at`**, **`updated_at`** — ISO strings (e.g. reuse `CONTENT_TS`).

3. Run `npm run build` to verify types and routes.

## Per-project FAQ

1. In [`src/content/faq.ts`](../src/content/faq.ts), add a `FaqSet` with **`project_id`** equal to the project’s `id`.
2. Add `FaqItem` rows with the same **`faq_set_id`** as that set’s `id`.
3. The project page loads FAQ via `getFaqSetByProjectId(project.id)`.

## Landing FAQ

The home page FAQ uses the set with slug `landing` in [`src/content/faq.ts`](../src/content/faq.ts).

## Tips

- **Slug** — Unique, lowercase, hyphenated; used in `generateMetadata` and the sitemap.
- **Sitemap** — [`src/app/sitemap.ts`](../src/app/sitemap.ts) lists `projects/[slug]` from the same content module.
- **No FAQ** — If there is no FAQ set for a project, the FAQ block is omitted on the public page.
