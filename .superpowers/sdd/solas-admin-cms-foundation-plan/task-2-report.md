# Task 2 delivery report

## Result

Implemented issue #37 as a shared admin CMS interface foundation. The existing
Pages & Content placeholder remains unchanged. No domain screen or Supabase
code was added.

## Changed files

- `package.json`
- `package-lock.json`
- `src/lib/admin/types.ts` and `src/lib/admin/types.test.ts`
- `src/hooks/use-admin-table-query.ts` and `src/hooks/use-admin-table-query.test.ts`
- `src/components/admin/admin-table.tsx` and `src/components/admin/admin-table.test.ts`
- `src/components/admin/admin-form.tsx` and `src/components/admin/admin-form.test.ts`
- `src/components/admin/lifecycle-controls.tsx` and
  `src/components/admin/lifecycle-controls.test.ts`
- `src/components/admin/record-deletion.tsx` and
  `src/components/admin/record-deletion.test.ts`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/alert-dialog.tsx`

## Implementation

- Pinned `@tanstack/react-table` to exact version `8.21.3`.
- Added exact test dependencies `@testing-library/react` `16.3.3` and
  `jsdom` `26.1.0`.
- Added distinct public, taxonomy, operational, archive, blocker, and table
  query types.
- Added safe URL query parsing and serialization for search, filters, status,
  page, page size, and sorting.
- Added a controlled TanStack table shell with search, filters, status tabs,
  result counts, sorting, pagination, desktop rows, mobile cards, loading,
  empty, no-results, loading-more, retry, unauthorized, and expired-session
  states.
- Added a reusable editor layout with editable sections, protected fields,
  explicit Save, pending and saved feedback, validation errors, server errors,
  cancellation, dirty navigation warnings, and published-site warnings.
- Added separate public lifecycle, taxonomy lifecycle, and private workflow
  controls. Operational controls have no publishing action.
- Added relationship summaries, archive confirmation, typed permanent-delete
  confirmation, dependency blocking, and submission delete suppression.
- Added only the missing shadcn-style primitives required by issue #37.

## TDD evidence

Initial RED command before production components:

```text
npm test -- --run src/lib/admin/types.test.ts src/hooks/use-admin-table-query.test.ts src/components/admin/admin-table.test.ts src/components/admin/admin-form.test.ts src/components/admin/lifecycle-controls.test.ts src/components/admin/record-deletion.test.ts
```

Result: 6 suites failed because the shared modules did not exist.

Focused GREEN command after implementation:

```text
npm test -- --run src/lib/admin/types.test.ts src/hooks/use-admin-table-query.test.ts src/components/admin/admin-table.test.ts src/components/admin/admin-form.test.ts src/components/admin/lifecycle-controls.test.ts src/components/admin/record-deletion.test.ts
```

Result: 6 files passed, 18 tests passed. A follow-up added reset-state,
keyboard, and focus-restoration coverage.

## Checks

- `npm test`: passed; 17 files, 81 tests.
- `npm run lint`: passed with no warnings.
- `npm run type-check`: passed.
- `npm run build`: passed; 25 routes generated.
- `git diff --check`: passed.
- `npx playwright test tests/e2e/homepage.spec.ts --project=chromium`: passed;
  4 tests, including desktop and 390px overflow coverage.
- Local Playwright browser check of `/admin/sign-in`: passed at 1280px and
  390px. Both returned 200, showed the existing sign-in form, had no horizontal
  overflow, and produced no console errors.

## Skipped browser checks

Shared table, form, lifecycle, and deletion browser checks remain deferred.
Issue #39 must provide the first real domain consumer. No fake CMS route was
created for browser testing.

No screenshot artifacts were added for the deferred shared states.

## Risks and remaining work

- The shared components are not connected to a domain CRUD screen yet.
- Table data loading, filtering, and mutations remain consumer-owned.
- Server Actions must perform authentication, authorization, input validation,
  constrained returns, and revalidation when issue #39 adds mutations.
- The operational workflow status list allows the union needed by both private
  submission tables. Consumers should pass a narrower status list when needed.

No production deployment, Supabase change, data mutation, or PR was performed.
