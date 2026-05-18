# Portfolio Website

**Repository**: [https://github.com/bondarukid/mypersonalwebsite](https://github.com/bondarukid/mypersonalwebsite)

A personal portfolio site built with Next.js 16. Public content lives in the repo under `src/content/` (no database).

## Features

- **Landing page** — Hero, features, tech stack, stats, testimonials, FAQ
- **Projects** — Static project list and `/projects/[slug]` pages with optional per-project FAQ
- **i18n** — English, Ukrainian, Japanese (`messages/*.json`)
- **GitHub repo block** — Header badge with repo link (optional)
- **Analytics** — Firebase Analytics (optional)

## Documentation

- **[Projects Guide](docs/PROJECTS-GUIDE.md)** — How to add projects and FAQs in `src/content/`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui, Tailwind CSS, Lucide icons
- **Content**: TypeScript modules in `src/content/`
- **Analytics**: Firebase Analytics (optional)
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/bondarukid/mypersonalwebsite.git
cd mypersonalwebsite
npm install
```

### Environment Setup

Optional variables (see `.env.example` if present):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |
| `NEXT_PUBLIC_LANDING_HERO_URL` | Hero image: `/path` under `public/` or full URL |
| `NEXT_PUBLIC_GITHUB_REPO` | Repo for header block |
| `GITHUB_USERNAME` | GitHub username when repo is not `owner/name` |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server uses Webpack (not Turbopack) for stability.

### Build

```bash
npm run build
npm start
```

### Deploy

Deploy on Vercel or any Node host. No Supabase or cron jobs required.

## How it works

1. **Content** — Edit `src/content/*.ts` (projects, FAQ, social links, landing copy, stats numbers, about timeline, certificates).
2. **Assets** — Place images under `public/images/` (e.g. `public/images/myphotolanding.jpg`, `public/images/project-icons/…`, `public/images/certificates/…`).
3. **i18n** — Locale from the URL (`/en/…`, `/uk/…`, `/ja/…`). UI strings in `messages/*.json`.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### Key points

- **Copyleft**: Any modifications or larger works must also be licensed under AGPL-3.0.
- **Network Disclosure**: If you run a modified version as a service (SaaS), you **must** make your source code available to your users.
- **Non-Commercial**: While AGPL does not strictly forbid selling, its copyleft nature makes proprietary commercial use difficult without releasing your modifications.

See [LICENSE](LICENSE) for the full text.
