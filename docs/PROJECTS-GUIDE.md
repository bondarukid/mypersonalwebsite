# Projects & Project Pages Guide

This guide explains how to add projects and their public pages to the portfolio site.

## Overview

Projects are products or apps you want to showcase (e.g. mobile app, desktop app, game). Each project has:

- **Public page** — `/[locale]/projects/[slug]` (e.g. `/projects/my-app`)
- **Dashboard** — edit at `/dashboard/projects` (catalog) and `/dashboard/projects/[id]/overview`, `platforms`, `faq`

## Adding a New Project

### 1. Go to the Projects Catalog

1. Sign in to the dashboard
2. In the sidebar, click **Projects**
3. You will see the list of existing projects (or "No projects yet")

### 2. Create a Project

1. Click **Add Project**
2. Fill in:
  - **Name** — Display name (e.g. "My Awesome App")
  - **Slug** — URL-friendly identifier (e.g. `my-awesome-app`). Must be unique per company, lowercase, alphanumeric with hyphens
3. Click **Create**

The project is created and you are redirected to its **Overview** tab.

### 3. Fill in Overview

In **Overview** you can configure:

- **Name** — Project display name
- **Slug** — Public URL segment (`/projects/[slug]`)
- **Description** — Short description shown on the project page
- **Icon upload** — Upload JPEG, PNG, or WebP (recommended: 512×512 or larger)
- **iTunes icon** — Enter the app's bundle ID (e.g. `com.example.app`) and click **Fetch from iTunes** to auto-download the App Store icon

### 4. Configure Platforms (Optional)

In the **Platforms** tab:

- **Store links** — Add URLs for Google Play, App Store, Steam, etc.
- **Platforms** — Check which platforms the app supports (iOS, iPadOS, macOS, Android, Windows, etc.)
- **Min OS versions** — Minimum version per platform (e.g. `ios: "14.0"`, `android: "8.0"`)

### 5. Add Project FAQ (Optional)

In the **FAQ** tab:

- Add FAQ items with questions and answers
- Edit per locale (English, Ukrainian, Japanese)
- Use **Drag to reorder** to change item order
- Choose an icon for each item (help-circle, clock, credit-card, etc.)

## Project Page Structure

The public project page at `/[locale]/projects/[slug]` includes:

1. **Hero** — App icon, name, description, and store link buttons (if configured)
2. **FAQ** — Project-specific FAQ accordion (if FAQ items exist)

## Sidebar Navigation

- **Main dashboard** — **Projects** in the sidebar shows the catalog
- **Inside a project** — When you open a project, the sidebar switches to:
  - **Back to Projects** — Return to catalog
  - **Overview** — Basic info and icon
  - **Platforms** — Store links and platforms
  - **FAQ** — Project FAQ editor

## Tips

- **Slug** — Keep it short and readable. It appears in the URL: `yoursite.com/projects/my-app`
- **Icon** — For iOS/Android apps, use **Fetch from iTunes** with the bundle ID for a clean App Store icon
- **FAQ** — If the project has no FAQ, the FAQ section is hidden on the public page
- **Store links** — Buttons appear in the Hero only when you add valid URLs (not `#`)

## Technical Notes

- Projects are company-scoped (landing company by default)
- Each project automatically gets a linked FAQ set when created
- Icons are stored in Supabase Storage (`project-icons` bucket)
- Project pages are included in the sitemap for SEO

