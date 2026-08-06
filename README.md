# The Solas Guide

The Solas Guide is a curated wellness discovery product. This repository contains the Next.js application and technical configuration for its first production release.

## MVP scope

The current release is focused on:

- A public introduction to The Solas Guide and its editorial approach.
- A guided Find a Match enquiry journey.
- A practitioner expression-of-interest journey.
- Structured submission storage in Supabase.
- Customer confirmations and internal notifications through MailerSend.
- Responsive, accessible public pages and form states.

The MVP does not include a public practitioner directory, public practitioner profiles, customer or practitioner accounts, payments, automated matching, direct messaging, or a custom administration portal.

The detailed delivery scope and acceptance criteria are maintained in [`docs/source-of-truth/mvp-scope.md`](docs/source-of-truth/mvp-scope.md). Commercial agreements, pricing, transcripts, private research, and internal planning do not belong in this repository.

## Technology

Currently installed:

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- Radix UI and shadcn component patterns
- Motion

Approved integration direction:

- Supabase for application data and local development services
- Vercel for preview and production deployments
- MailerSend for transactional email
- Google Analytics 4 when the analytics property is available

Supabase is the application runtime data store and source of truth. Airtable receives a one-way CRM projection through a Vercel Workflow; it is never read by the public application and never syncs operational CRM changes back to Supabase.

## Local development

Prerequisites:

- Node.js 22.22.1 and npm 10.9.4 (see `.nvmrc` and `package.json`)
- Docker Desktop when running Supabase locally
- Supabase CLI or `npx supabase`

Install dependencies, start Supabase, and create your local environment file:

```bash
npm ci
supabase start
cp .env.example .env.local
npm run dev
```

Use `supabase status` to retrieve the local publishable key and add it to `.env.local`. Open the app at <http://localhost:3000>, Supabase Studio at <http://127.0.0.1:55323>, and Mailpit at <http://127.0.0.1:55324>.

The local Supabase configuration uses project-specific ports so it can run alongside other Supabase projects. Migrations and deterministic seed data are applied by `supabase start` or `supabase db reset`. Generated database types live in `src/types/database.ts`.

## Checks

```bash
npm run lint
npm run type-check
npm run build
# or run all three:
npm run check
```

Only report a check as passing when it has been run against the current working tree.

## Environments

- **Local:** Next.js locally with Supabase Docker.
- **Preview:** Vercel preview deployments using non-production configuration.
- **Production:** Vercel production with the production Supabase project and production provider settings.

Do not commit credentials or environment files. MailerSend must remain in a safe development mode until production sending is explicitly approved.

## Repository structure

- `src/` — Next.js application code.
- `public/` — static application assets.
- `supabase/` — local Supabase configuration, migrations, and seed data.
- `docs/` — technical documentation and approved implementation references.
- `.github/workflows/` — continuous integration and changelog automation.
- `.agents/skills/` — repository-local Agent Skills.
- `.codex/agents/` — project-specific Codex agent definitions.
- `AGENTS.md` — durable project rules, scope boundaries, and model routing.
- `docs/source-of-truth/mvp-scope.md` — active delivery boundary and acceptance summary.
- `CHANGELOG.md` — automatically updated record of pull requests merged into `main`.

## Agent workflows

- Use `solas-designer` for UI, UX, editorial copy, art direction, imagery, and visual review.
- Use the installed official Supabase skills for schema, migration, RLS, query, and integration work.
- Use `solas-reviewer` for independent scope, correctness, security, and regression review.
- Use `solas-qa` for browser, responsive, persistence, build, and preview verification.

Read `AGENTS.md` before making changes. Keep detailed agent procedures in their skill or agent definitions rather than duplicating them here.

## Documentation boundary

Keep contracts, commercial terms, transcripts, client-private material, internal planning, follow-ups, and generated working artifacts in the separate internal project workspace. Do not commit secrets, provider credentials, personal data, or production exports.
