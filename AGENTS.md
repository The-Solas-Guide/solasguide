<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

- This repository root is the application root. Do not assume a `web/` subdirectory.
- The application uses Next.js, React, TypeScript, Tailwind CSS, Supabase, MailerSend, and Vercel.
- The archived pitch prototype is historical reference only. Its routes and content do not define production behavior.
- Keep the MVP simple, maintainable, focused, and fast for critical user journeys.

## Source of Truth

- Read `docs/source-of-truth/mvp-scope.md` before planning or implementing work.
- That scope document defines current delivery scope, acceptance criteria, technical decisions, and change control.
- Its directory and Admin Portal V1 scope supersedes stale exclusions in `README.md` and design references.
- Supabase is the application runtime store and authoritative source for submissions, directory records, and operational data.
- `src/lib/airtable-sync.ts` implements the approved one-way Supabase-to-Airtable CRM projection.
- `src/workflows/airtable-sync.ts` starts that projection after submissions. The public application never reads Airtable.
- Airtable owns CRM status, owners, outreach activity, follow-up, and notes. It never writes those changes back to Supabase.
- Privacy or retention deletion removes the Supabase record and matching Airtable record.
- Airtable deletion is a documented manual operational step for this MVP.
- Keep the signed commercial SOW and its actual change record in the private internal workspace.
- Record approved scope changes in the actual SOW change record before launch.
- Do not silently rewrite SOW acceptance criteria or treat private commercial material as repository documentation.

## Working Rules

- Complete authorized work and make reasonable assumptions for routine, reversible choices.
- Ask when missing information changes the result; preserve unrelated user and agent edits.
- Build the smallest reliable solution that satisfies the active scope and critical journeys.
- Avoid speculative abstractions, enterprise infrastructure, generic extensibility, and support for hypothetical future phases.
- Protect authorization, security, data integrity, recoverability, and essential failure handling.
- Record plausible non-critical edge cases with impact and defer them when the scope does not require them.
- Address edge cases now when critical journeys, material security/data risks, or substantially lower implementation cost justify it.
- Use the installed official Supabase skills for schema, migration, RLS, query, and integration work.
- Use `solas-designer` for UI, UX, art direction, imagery, and visual QA work.
- Use `solas-copywriter` for customer-facing copy, interface language, calls to action, and terminology review.
- For combined work, copywriter owns wording and claims. Designer owns hierarchy and responsive integration.
- Use Relume MCP for relevant section layouts and page compositions before inventing a new composition.
- Use Untitled UI for component-pattern inspiration for controls, navigation, feedback, and forms.
- Load only references relevant to the assigned task. Adapt references to Solas content and scope.
- Establish visual direction through an approved representative MVP page; document reusable patterns only after implementing them.
- Extend implemented theme tokens and reusable components before creating similar one-off components.
- Use bounded `solas-reviewer` work when independent scope, correctness, security, or regression review improves confidence.
- Use bounded `solas-qa` work when browser, responsive, persistence, build, or preview behavior is ready to verify.
- Keep tightly connected implementation together; give specialists independent tasks with clear required evidence.

### Model routing

- Use `gpt-5.6-sol` with medium reasoning for planning and architecture decisions.
- Use `gpt-5.6-luna` with max reasoning and the fast service tier for routine implementation and coding.
- Escalate complex, unfamiliar, regression-prone, or security-sensitive coding to `gpt-5.6-terra` with xhigh reasoning.
- Use `gpt-5.6-sol` with medium reasoning for pull request and final implementation review.

## Boundaries

- Included MVP work covers the public website, forms, privacy, terms, practitioner directory, and practitioner profiles.
- Included MVP work covers Admin Portal V1 for one authorised administrator and practitioner listing lifecycle controls.
- Included MVP work covers Supabase persistence, MailerSend notifications, analytics, responsive QA, and Vercel deployment configuration.
- Do not add customer or practitioner accounts, automated matching, booking, payments, subscriptions, billing, or messaging.
- Do not add venue or event directories, Airtable public reads, reverse sync, or an Airtable source of truth.
- The approved Supabase-to-Airtable projection remains the only application Airtable integration.
- Keep contracts, transcripts, private research, internal plans, generated outputs, credentials, and private personal data outside this repository.
- Approved public practitioner profiles and portraits follow the scope document's publication rules.
- Confirm target accounts and environments before remote changes; existing authorization counts within its stated scope.
- Production changes, publication, and customer messages require explicit authorization for the requested action.
- Do not expand scope from prototype concepts, stale README text, or unapproved future-phase ideas.

## Commands

- Install dependencies with `npm ci`.
- Run the application with `npm run dev`.
- Run linting with `npm run lint`.
- Run TypeScript checks with `npm run type-check`.
- Build with `npm run build`.
- Run the package check with `npm run check`; it runs lint, type-check, and build, and excludes tests.
- Run unit tests with `npm run test` and browser tests with `npm run test:e2e` when relevant.
- Use `supabase start`, `supabase db reset`, and `supabase status` for local database work.

## Verification

- For documentation-only changes, read through the result and run `git diff --check`.
- For code changes, run lint, type checks, and focused tests; run a build when the affected behavior requires it.
- Use `npm run check` for combined lint, type-check, and build verification; it does not replace tests.
- For schema or RLS changes, use local `supabase test db` and the database checks defined in `.github/workflows/ci.yml`.
- Treat local, Preview, provider, and production evidence as separate evidence sources.
- For UI changes, inspect the affected flow on desktop and around 390px; release checks include Chrome and Safari.
- Verify form persistence, success and error states, provider notifications, analytics, and configuration safeguards.
- Report skipped checks, unavailable evidence, risks, and remaining work clearly.

## References

- Active scope: `docs/source-of-truth/mvp-scope.md`.
- Repository overview: `README.md`.
- CRM projection: `src/lib/airtable-sync.ts` and `src/workflows/airtable-sync.ts`.
- Package commands: `package.json`.
- Environment shape: `.env.example`.
- Local database: `supabase/`.
- Project agents: `.codex/agents/solas-reviewer.toml` and `.codex/agents/solas-qa.toml`.
- Project skills: `.agents/skills/solas-designer/SKILL.md` and `.agents/skills/solas-copywriter/SKILL.md`.
