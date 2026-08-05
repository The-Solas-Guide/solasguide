# Dependency audit baseline

Last reviewed: 2026-08-05

The application now uses Next.js 16.3.0. This stable release updates the bundled
PostCSS dependency to 8.5.23 and resolves the PostCSS and Sharp advisories that
were reported through Next.js 16.2.11.

Verification on 2026-08-05:

- `npm audit` reports zero known vulnerabilities.
- `npm run check` passes lint, TypeScript, and the production build.
- The production build exposes `/`, `/find-a-match`, the unlinked and noindex
  `/design-system` review route, and the framework not-found route.

Continue to run `npm audit` during dependency updates and before the first
production launch. Treat any directly exploitable or critical advisory as a
release blocker.

Unused prototype tooling that introduced separate advisories was removed from the active dependency tree.
