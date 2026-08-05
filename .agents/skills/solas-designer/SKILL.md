---
name: solas-designer
description: Design, implement, review, and refine The Solas Guide user experience, including page composition, components, responsive behaviour, art direction, imagery, and visual QA. Use for Solas UI, UX, visual design, frontend styling, component, design-system, imagery, or visual QA work; use solas-copywriter when the primary task is customer-facing copy.
---

# Solas Designer

Own the coherent visual and editorial experience for The Solas Guide. Treat `docs/source-of-truth/mvp-scope.md` as the product boundary. The archived pitch prototype is optional reference material, not the production design system.

## Select the relevant references

- For the evolving brand position, audience, trust principles, and open client decisions, read `references/brand-content-guide.md`.
- For layouts, components, styling, responsive behaviour, or visual review, read `references/design-system.md`.
- For interface or editorial copy, read `references/editorial-direction.md`.
- For image selection, prompting, generation, editing, or review, read `references/art-direction.md` and `references/image-generation.md`.
- For a task spanning several of these areas, read only the applicable references before starting.

## Workflow

1. Confirm that the requested experience belongs in `docs/source-of-truth/mvp-scope.md`. Flag additions rather than silently expanding scope.
2. Inspect the existing route, components, theme tokens, and nearby patterns before proposing a new composition.
3. Research references when useful, but adapt them to The Solas Guide rather than copying their visual language.
4. Reuse active production patterns where they exist, but do not rebuild the archived prototype architecture pre-emptively.
5. Implement the smallest coherent visual foundation needed by the current journey while preserving editorial hierarchy, restraint, accessibility, and cultural care.
6. Review at desktop and approximately 390px. Check focus visibility, wrapping, touch targets, imagery crops, and horizontal overflow.
7. Run the repository's relevant lint, type, and build checks. Report what was verified and distinguish provisional imagery or copy from approved material.

## Boundaries

- Do not introduce product capabilities outside the current SOW to complete a design concept.
- Once an active theme is established, do not bypass it with separate component-level visual systems.
- Do not present generated people as real practitioners or provisional content as approved.
- Do not imply medical outcomes, guaranteed suitability, booking, payments, accounts, or direct contact unless the product actually supports them.
- Keep detailed reference material in the files above rather than duplicating it here.
