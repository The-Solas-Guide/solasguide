# Public Directory Completion Specification

## Outcome

Complete the remaining Sprint 8 and Sprint 9 public-directory requirements before Admin Portal V1 begins.

## Confirmed inputs

- The taxonomy, profile content, profile fields, and practitioner portraits are approved.
- Supabase remains authoritative for practitioner profiles, taxonomy, publication state, and portrait paths.
- Admin Portal V1 remains later work and is not part of this change.
- Public pages may expose published profiles only.

## Required journeys

1. Visitors can search published practitioner content through PostgreSQL-backed queries.
2. Visitors can combine the confirmed filters.
3. Search and filters persist in the URL.
4. Shared URLs, refreshes, back, and forward navigation restore the same results.
5. Unknown or inactive filter values produce a clear invalid-filter message without exposing private data.
6. Support-area and location discovery pages list matching published practitioners.
7. Directory, discovery, profile, homepage, and Find a Match links form one coherent public journey.

## SEO requirements

- The directory, profiles, and discovery pages use canonical URLs.
- Published pages provide Open Graph and Twitter metadata.
- Published profiles provide accurate structured data without implying independent verification.
- The sitemap contains the directory, published profiles, and valid discovery pages.
- Draft, archived, missing, and invalid pages stay unavailable or non-indexable.

## Experience requirements

- Reuse the current practitioner cards, filters, page frame, and theme.
- Preserve keyboard focus, useful loading and empty states, and approximately 390px layouts.
- Keep customer-facing wording calm, specific, and free from automated-matching, booking, or outcome claims.

## Verification

- Add database tests for search, combined filters, and unpublished-row protection.
- Add unit tests for URL parsing, canonical serialization, and invalid values.
- Add browser tests for sharing, refresh, back, forward, discovery navigation, metadata, and mobile layouts.
- Run database reset, pgTAP, advisors, unit tests, lint, type checks, build, and browser tests.
