# Public Directory Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete URL-backed discovery, PostgreSQL search and filtering, public discovery pages, and Phase 2 SEO foundations.

**Architecture:** PostgreSQL owns public search and filter matching through a narrow RLS-safe RPC. Next.js parses stable slug-based URL parameters, loads matching profiles on the server, and renders the existing client controls from canonical URL state. Shared discovery and metadata helpers keep directory, category, location, profile, and sitemap behavior consistent.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Supabase PostgreSQL and RLS, Tailwind CSS, Radix UI, Vitest, pgTAP, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-01-public-directory-completion.md`

## Global Constraints

- Supabase is authoritative for practitioner profiles, taxonomy, publication state, and portrait paths.
- Public reads return published profiles and active linked terms only.
- URL filter values use stable taxonomy slugs, never database UUIDs.
- Admin Portal V1 remains later work.
- Reuse current cards, filters, page frames, theme tokens, and approved content.
- Do not imply automated matching, booking, medical outcomes, or independent verification.
- Verify desktop and approximately 390px layouts.

---

### Task 1: PostgreSQL-backed public search and filters

**Files:**
- Create: `supabase/migrations/<timestamp>_add_practitioner_search.sql`
- Modify: `supabase/tests/practitioner_schema_test.sql`
- Modify: `src/types/database.ts`
- Modify: `src/lib/practitioners.ts`
- Test: `src/lib/practitioners.test.ts`

**Interfaces:**
- Produces: `DirectoryFilters`, `DirectoryFacetType`, `parseDirectoryFilters()`, `serializeDirectoryFilters()`, and `getPublishedPractitioners(filters)`.
- Produces: `search_published_practitioner_ids` with query text, taxonomy slug arrays, and delivery-format values.
- Consumes: existing `Practitioner`, `PractitionerTerm`, RLS policies, and public Supabase client.

- [ ] **Step 1: Add failing pgTAP cases**

Cover name and profile-text search, linked-term search, combined support-area and location filters, format filters, inactive terms, invalid slugs, and draft-row exclusion.

- [ ] **Step 2: Run the database test and confirm failure**

Run: `npx supabase test db supabase/tests/practitioner_schema_test.sql`

Expected: new RPC assertions fail because `search_published_practitioner_ids` does not exist.

- [ ] **Step 3: Create the migration through the Supabase CLI**

Run: `npx supabase migration new add_practitioner_search`

Implement one `security invoker`, stable SQL function. Revoke default execution. Grant execution only to `anon`, `authenticated`, and `service_role`. Match every supplied taxonomy group with AND between groups and OR within each group. Return published practitioner IDs only.

- [ ] **Step 4: Add failing URL helper tests**

Test canonical trimming, repeated slug values, alphabetical deduplication, unknown parameter removal, supported `format` values, and round-trip serialization.

- [ ] **Step 5: Implement typed URL and query helpers**

Use this exact shape:

```ts
export type DirectoryFacetType =
  | "areas"
  | "approach"
  | "works-with"
  | "locations"
  | "format"
  | "languages";

export type DirectoryFilters = {
  query: string;
  areas: readonly string[];
  approach: readonly string[];
  "works-with": readonly string[];
  locations: readonly string[];
  format: readonly ("in-person" | "online")[];
  languages: readonly string[];
};
```

`getPublishedPractitioners(filters)` must call the RPC when any filter is active, then load only returned published profiles.

- [ ] **Step 6: Run focused tests**

Run: `npx supabase db reset && npx supabase test db && npm test -- src/lib/practitioners.test.ts`

Expected: all database and practitioner unit tests pass.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations supabase/tests/practitioner_schema_test.sql src/types/database.ts src/lib/practitioners.ts src/lib/practitioners.test.ts
git commit -m "feat: add URL-backed practitioner search"
```

### Task 2: URL-synchronised directory controls

**Files:**
- Modify: `src/app/practitioners/page.tsx`
- Modify: `src/components/practitioners/practitioner-directory.tsx`
- Modify: `src/components/practitioners/practitioner-status.tsx`
- Modify: `tests/e2e/practitioners.spec.ts`

**Interfaces:**
- Consumes: Task 1 `DirectoryFilters`, parser, serializer, server query, and stable slug options.
- Produces: shareable directory URLs with clear invalid-filter feedback.

- [ ] **Step 1: Add failing browser coverage**

Cover query and filter parameters after interaction, refresh restoration, back and forward navigation, combined filters, unknown slug feedback, clear-all behavior, keyboard dialog behavior, and 390px overflow.

- [ ] **Step 2: Confirm the focused test fails**

Run: `npm run test:e2e -- tests/e2e/practitioners.spec.ts`

Expected: URL and navigation assertions fail because current controls use component-only state.

- [ ] **Step 3: Load canonical URL state on the server**

Parse `searchParams` in `src/app/practitioners/page.tsx`. Validate supplied slugs against active public terms. Pass canonical filters, all available public facets, matching practitioners, and invalid values into the directory.

- [ ] **Step 4: Update controls through the router**

Use `useRouter`, `usePathname`, `useSearchParams`, and `useTransition`. Search changes use a short debounce. Filter changes update repeated slug parameters. Clear actions remove only directory parameters. Preserve focus and show a pending results state.

- [ ] **Step 5: Render invalid-filter feedback**

Use this copy:

```text
Some filters in this link are no longer available. The Guide is showing results using the remaining filters.
```

Do not echo unknown values into page content.

- [ ] **Step 6: Run focused checks**

Run: `npm test && npm run type-check && npm run test:e2e -- tests/e2e/practitioners.spec.ts`

Expected: unit, type, and directory browser tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/practitioners/page.tsx src/components/practitioners/practitioner-directory.tsx src/components/practitioners/practitioner-status.tsx tests/e2e/practitioners.spec.ts
git commit -m "feat: preserve practitioner discovery in URLs"
```

### Task 3: Support-area and location discovery pages

**Files:**
- Create: `src/app/practitioners/areas/[slug]/page.tsx`
- Create: `src/app/practitioners/locations/[slug]/page.tsx`
- Create: `src/components/practitioners/practitioner-discovery-page.tsx`
- Modify: `src/app/practitioners/[slug]/page.tsx`
- Modify: `src/components/practitioners/practitioner-directory.tsx`
- Modify: `tests/e2e/practitioners.spec.ts`

**Interfaces:**
- Consumes: Task 1 query helpers and existing practitioner cards.
- Produces: stable support-area and location pages linked from directory and profiles.

- [ ] **Step 1: Add failing browser coverage**

Cover valid area and location pages, practitioner links, directory return links, profile taxonomy links, missing and inactive slugs, empty states, and 390px layouts.

- [ ] **Step 2: Confirm the focused test fails**

Run: `npm run test:e2e -- tests/e2e/practitioners.spec.ts`

Expected: discovery routes return 404.

- [ ] **Step 3: Build one shared discovery composition**

Use the existing site frame and practitioner cards. Use these exact introductions:

```text
Explore practitioners whose published profiles include this area of support.
Explore practitioners whose published profiles include this location.
```

The page heading is the approved taxonomy name. The eyebrow is `Area of support` or `Location`.

- [ ] **Step 4: Link public taxonomy terms**

Support-area and location chips on profiles link to discovery pages. Active directory filter summaries may link to the equivalent discovery page without changing filter behavior.

- [ ] **Step 5: Run focused checks**

Run: `npm run type-check && npm run test:e2e -- tests/e2e/practitioners.spec.ts`

Expected: discovery routes and responsive checks pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/practitioners src/components/practitioners tests/e2e/practitioners.spec.ts
git commit -m "feat: add practitioner discovery pages"
```

### Task 4: Public metadata, structured data, and sitemap

**Files:**
- Create: `src/lib/practitioner-metadata.ts`
- Create: `src/app/sitemap.ts`
- Modify: `src/app/practitioners/page.tsx`
- Modify: `src/app/practitioners/[slug]/page.tsx`
- Modify: `src/app/practitioners/areas/[slug]/page.tsx`
- Modify: `src/app/practitioners/locations/[slug]/page.tsx`
- Modify: `src/lib/practitioners.ts`
- Test: `src/lib/practitioner-metadata.test.ts`
- Modify: `tests/e2e/practitioners.spec.ts`

**Interfaces:**
- Consumes: published profile and active taxonomy loaders from Tasks 1–3.
- Produces: canonical metadata, Open Graph, Twitter cards, profile JSON-LD, and dynamic sitemap entries.

- [ ] **Step 1: Add failing metadata unit tests**

Cover absolute canonical URLs, directory query canonicalisation to `/practitioners`, profile descriptions, discovery descriptions, safe external URLs, and JSON-LD omission of absent fields.

- [ ] **Step 2: Confirm focused tests fail**

Run: `npm test -- src/lib/practitioner-metadata.test.ts`

Expected: metadata helpers do not exist.

- [ ] **Step 3: Implement metadata helpers**

Use `NEXT_PUBLIC_APP_URL` with the existing localhost fallback. Profiles use `ProfilePage` with a nested `Person`. Include only published profile facts already rendered publicly. Do not add ratings, medical claims, verification claims, availability, booking actions, or contact details.

- [ ] **Step 4: Enable indexing for valid published pages**

Directory, profile, and valid discovery pages use `index: true, follow: true`. Missing, invalid, draft, and archived pages remain unavailable or non-indexable.

- [ ] **Step 5: Build the dynamic sitemap**

Include `/`, `/find-a-match`, `/become-a-practitioner`, `/practitioners`, every published profile, and every active support-area and location linked to a published profile.

- [ ] **Step 6: Add browser assertions**

Verify canonical, Open Graph, Twitter, robots, JSON-LD, and sitemap output for directory, one profile, one area, one location, and missing routes.

- [ ] **Step 7: Run focused checks**

Run: `npm test && npm run type-check && npm run build && npm run test:e2e -- tests/e2e/practitioners.spec.ts`

Expected: metadata, build, and browser tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/app src/lib tests/e2e/practitioners.spec.ts
git commit -m "feat: complete practitioner discovery SEO"
```

### Task 5: Whole-branch verification and delivery

**Files:**
- Modify only when verification reveals a confirmed defect.

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: a review-ready branch and evidence package.

- [ ] **Step 1: Run complete local verification**

Run:

```bash
npx supabase db reset
npx supabase test db
npx supabase db advisors --local --fail-on error
npm test
npm run check
npm run test:e2e
git diff --check main...HEAD
```

- [ ] **Step 2: Run independent Solas review**

Use `solas-reviewer` for SOW, security, RLS, SEO, regression, and scope review.

- [ ] **Step 3: Run independent browser QA**

Use `solas-qa` for desktop, 390px, URL navigation, filters, discovery pages, metadata, portraits, console, and build verification.

- [ ] **Step 4: Prepare the pull request**

Use a title under 70 characters. Include a `## Summary` with one to three bullets and a `## Test plan` checklist. Do not merge without a fresh user request.
