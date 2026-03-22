# Portfolio Website

A personal portfolio site built with Next.js 16, featuring a public marketing landing page and an authenticated dashboard for content management.

## Features

- **Landing page** — Hero section, testimonials, integrations showcase
- **i18n** — Multi-language support (English, Ukrainian, Japanese)
- **Dashboard** — Protected admin area for managing:
  - **Testimonials** — Edit quote, author, and role per locale
  - **Landing stats** — GitHub stars, GA4 metrics, apps configuration
  - **Social links** — Social network URLs for the landing page
- **GitHub repo block** — Header badge with repo link, stars, and forks (MkDocs-style)
- **Analytics** — Firebase Analytics (optional)
- **Auth** — Supabase Auth with email whitelist

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui, Tailwind CSS, Lucide icons
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Analytics**: Firebase Analytics (optional)
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- Supabase project
- (Optional) Firebase project, GitHub token, GA4

### Installation

```bash
git clone <repository-url>
cd mypersonalwebsite
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in the required variables (see `.env.example` for descriptions):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for cron) | Supabase service role key |
| `ALLOWED_EMAILS` | Yes | Comma-separated emails allowed to sign in |
| `ENCRYPTION_KEY` | Yes (for dashboard credentials) | 64-char hex key: `openssl rand -hex 32` |
| `NEXT_PUBLIC_GITHUB_REPO` | Optional | Repo name for header block (owner from `GITHUB_USERNAME`) |
| `GITHUB_USERNAME` | If using repo block | GitHub username |

### Database

Apply Supabase migrations:

```bash
npx supabase db push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server uses Webpack (not Turbopack) for stability.

### Build

```bash
npm run build
npm run start
```

### Deploy

The app is suitable for deployment on Vercel, with Supabase and optional Firebase/GA4 configured via environment variables. For cron (stats refresh), set `CRON_SECRET` and configure Vercel Cron to call `/api/cron/refresh-stats` with `Bearer <CRON_SECRET>`.

## How It Works

1. **Landing** — Public routes (`/`, `/about`, `/contact`, etc.) render the marketing site. Testimonials and hero content come from Supabase.
2. **Auth** — Dashboard routes (`/dashboard/*`) require sign-in. Supabase Auth + `ALLOWED_EMAILS` restrict access.
3. **Dashboard** — Server-rendered pages fetch data from Supabase. Client components handle forms and updates via Server Actions.
4. **i18n** — Locale is derived from the URL (`/en/...`, `/uk/...`, `/ja/...`). Messages live in `messages/*.json`.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### Key points

- **Copyleft**: Any modifications or larger works must also be licensed under AGPL-3.0.
- **Network Disclosure**: If you run a modified version as a service (SaaS), you **must** make your source code available to your users.
- **Non-Commercial**: While AGPL does not strictly forbid selling, its copyleft nature makes proprietary commercial use difficult without releasing your modifications.

See [LICENSE](LICENSE) for the full text.
