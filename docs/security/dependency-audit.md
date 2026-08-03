# Dependency audit baseline

Last reviewed: 2026-08-03

`npm audit` currently reports advisories inherited through Next.js 16.2.11 for its bundled PostCSS and Sharp versions. npm proposes Next.js 9.3.3 as the automated resolution, which is not a safe or compatible fix for this Next.js 16 application.

The application does not accept user-provided CSS or image files in the current MVP scope. This lowers exposure to the reported PostCSS and Sharp paths, but does not resolve the upstream advisories.

Temporary decision:

- Keep the current supported Next.js 16 baseline.
- Do not apply npm's incompatible downgrade.
- Re-run `npm audit` when upgrading Next.js and before the first production launch.
- Treat any new directly exploitable or critical advisory as a release blocker.

Unused prototype tooling that introduced separate advisories was removed from the active dependency tree.
