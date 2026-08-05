# Guide Index Teaser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, image-led homepage teaser that helps visitors understand The Solas Guide as a curated network of people, places, and experiences without introducing a public directory.

**Architecture:** Keep the homepage as a Server Component and add one focused Client Component for tab state and keyboard interaction. Store the small provisional preview dataset beside the component, use existing local imagery, and expose no card links, profiles, search, filters, or booking actions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, `next/image`.

## Global Constraints

- The section is an editorial preview, not a directory or claim of availability.
- People are clearly identified as illustrative examples, not real Solas practitioners.
- Place and experience references are clearly identified as research references with no implied partnership or endorsement.
- Use one CTA: `Tell us what you need`.
- Tabs must support mouse, touch, Tab, ArrowLeft, ArrowRight, Home, and End.
- Show four columns by two rows on large screens and two columns by four rows at approximately 390px.
- Use only existing local Solas imagery and active theme tokens.

---

### Task 1: Build the guide index teaser

**Files:**
- Create: `src/components/home/guide-index.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: existing local images under `public/images/solas-imagery`, `Button` styling, and the `/find-a-match` enquiry route.
- Produces: `GuideIndex` React component with accessible tab interaction and an eight-card panel for each content type.

- [ ] **Step 1: Create typed preview data and the client component**

Define `GuideCategory`, `GuideItem`, and three eight-item category arrays. Render a labelled tablist, active tabpanel, image cards, content-status note, and single enquiry CTA.

- [ ] **Step 2: Implement keyboard behaviour**

Use a tab ref array and an `onKeyDown` handler so ArrowLeft/ArrowRight wrap, Home selects the first tab, and End selects the last tab. Keep `aria-selected`, `aria-controls`, `role="tab"`, and `role="tabpanel"` in sync.

- [ ] **Step 3: Add the section after the homepage hero**

Import `GuideIndex` into `src/app/page.tsx` and render it immediately after the hero section so visitors encounter the network preview before the explanatory content.

- [ ] **Step 4: Run static verification**

Run: `npm run lint && npm run type-check`

Expected: both commands exit successfully with no warnings or errors.

### Task 2: Verify responsive and accessible behaviour

**Files:**
- Verify: `src/components/home/guide-index.tsx`
- Verify: `src/app/page.tsx`

**Interfaces:**
- Consumes: the completed homepage implementation.
- Produces: browser evidence that the teaser works at desktop and mobile sizes.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Next.js builds the homepage successfully.

- [ ] **Step 2: Review the desktop layout**

At desktop width, confirm the heading, tabs, four-column grid, status note, and CTA are legible; images crop cleanly; and changing tabs swaps all eight cards.

- [ ] **Step 3: Review the mobile layout**

At approximately 390px, confirm two columns by four rows, readable card copy, usable tab targets, and no horizontal overflow.

- [ ] **Step 4: Review keyboard and semantics**

Confirm visible focus, ArrowLeft/ArrowRight/Home/End operation, correct `aria-selected`, and a labelled active tabpanel.

- [ ] **Step 5: Commit the implementation**

```bash
git add docs/superpowers/plans/2026-08-05-guide-index-teaser.md src/components/home/guide-index.tsx src/app/page.tsx
git commit -m "feat: preview the curated Solas network"
```
