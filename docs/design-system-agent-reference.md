# The Solas Guide — agent reference

This file is the implementation index for agents building The Solas Guide. The visual source of truth is `/design-system`; this document points to the code that makes it reusable.

## System rules

- Use semantic theme tokens from `src/app/globals.css`. Prefer classes such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, and `bg-accent` over literal colours.
- Aman is the default theme. Bambu and Chanel are review options, not separate component implementations.
- Use `font-display` for editorial headings and the body font for interface copy.
- Preserve the restrained spacing, low-radius geometry, visible focus states, and clear information hierarchy shown on `/design-system`.
- The theme switcher and review controls in `src/components/theme-switcher.tsx` are presentation tools only. Do not ship them as directory UI.
- Identity marks shown on `/design-system#identity` are provisional format references. Use the wordmark, social avatar, square mark, and favicon as one coordinated asset family when final artwork is supplied.

## Design and component workflow

1. Start with the journey and content requirement. Confirm that the proposed section belongs within the agreed MVP before designing it.
2. Use the Relume MCP to research appropriate section layouts and page-level compositions. Select references for information hierarchy, pacing, and responsive structure.
3. Use Untitled UI as inspiration for component patterns such as navigation, inputs, filters, lists, cards, progress, feedback, and overlays.
4. Do not copy a reference implementation or import its visual language unchanged. Translate the useful pattern into The Solas Guide's restrained editorial system.
5. Build with semantic tokens from `src/app/globals.css`, including background, foreground, card, muted, accent, border, typography, and focus treatments. A component must respond to the complete active theme rather than carrying its own palette.
6. Extend a component already listed in the registry through props or variants when possible. Create a new component only when it represents a genuinely different semantic pattern.
7. Export approved reusable work through `src/components/component-registry.ts` and add its purpose to the registry table below.
8. Review the result in Aman, Bambu, and Chanel at desktop and approximately 390px wide. Confirm focus visibility, content wrapping, touch targets, and horizontal overflow.

Relume provides composition research. Untitled UI provides component inspiration. The Solas Guide design system remains the authority for the final appearance and implementation.

## Reusable component registry

| Component | Source | Intended use |
| --- | --- | --- |
| Practitioner teaser card | `src/components/directory/practitioner-teaser-card.tsx` | Curated practitioner collections and editorial grids |
| Practitioner list item | `src/components/directory/practitioner-list-item.tsx` | Dense results, comparisons, and saved lists |
| Category card | `src/components/directory/category-card.tsx` | Image-led practice navigation |
| Category navigation variants | `src/components/directory/category-navigation.tsx` | Compact cards, image tiles, and index rows |
| Form choice card | `src/components/forms/form-choice-card.tsx` | High-consideration radio or checkbox choices |
| Form progress | `src/components/forms/form-progress.tsx` | Multi-step enquiry progress |
| Form feedback | `src/components/forms/form-feedback.tsx` | Accessible error and success notices |
| Filter pill group | `src/components/directory/filter-pill-group.tsx` | Search and discovery filters |
| Discovery controls | `src/components/directory/discovery-controls.tsx` | Responsive search, filtering, sorting, and selection summary |
| Brand marks | `src/components/brand/brand-marks.tsx` | Provisional wordmark and compact mark formats |
| Authority card | `src/components/patterns/authority-card.tsx` | Credentials, quotations, and editorial proof |
| Site header and footer | `src/components/layout/` | Shared MVP navigation and footer |
| Breadcrumbs and pagination | `src/components/navigation/navigation-primitives.tsx` | Detail-page context and result navigation |
| Landing-page header | `src/components/marketing/landing-page-header.tsx` | Practitioner, venue, event, and application openings |
| Editorial blocks | `src/components/editorial/editorial-blocks.tsx` | Category context, curator notes, and fact panels |
| FAQ and disclosure blocks | `src/components/editorial/editorial-blocks.tsx` | Verification, safety, scope, and independence explanations |
| Copywriting guide | `src/components/editorial/copywriting-guide.tsx` | Voice, claims, vocabulary, calls to action, content templates, and publishing checks |
| Enquiry patterns | `src/components/enquiry/enquiry-patterns.tsx` | Entry points into multi-step forms |
| Customer enquiry form | `src/components/enquiry/customer-enquiry-form.tsx` | Concierge-led six-step customer brief, modality preferences, teaser handoff, and contact confirmation |
| Empty and loading states | `src/components/feedback/feedback-patterns.tsx` | Result feedback and loading placeholders |
| Overlay examples | `src/components/overlays/overlay-examples.tsx` | Enquiry dialogs and mobile filter sheets |
| Base UI primitives | `src/components/ui/` | Buttons, fields, selects, badges, dialogs, and sheets |

Extend these components through props or variants before creating a visually similar one-off component.

Import approved components through `@/components/component-registry`. The exported `COMPONENT_REGISTRY` array provides machine-readable component names, categories, and import paths for build agents.

## Content and product boundaries

- The Solas Guide is a curated guide, not an unrestricted public directory.
- Lead with specificity: practitioner, place, lineage, years, modality, and editorial context.
- Avoid wellness superlatives, transformation claims, urgency, and generic spiritual language.
- Do not imply booking, payments, accounts, or direct practitioner contact unless those product capabilities are explicitly added.
- MVP landing journeys are Find a Practitioner, Find a Venue, Events & Workshops, Become a Practitioner, and their related multi-step forms.
- Do not add pricing, testimonials, user accounts, saved or recently viewed items, or newsletter infrastructure to the MVP without an explicit scope change.
- Placeholder imagery on the design-system page demonstrates art direction only and is not approved final brand content.

## Copywriting rules

- Voice: quiet authority, specific over spiritual, warm without assumed intimacy, and editorial rather than promotional.
- Facts: distinguish reviewed facts from practitioner-supplied statements. Attribute teachers, traditions, lineages, qualifications, years, and places precisely.
- Claims: do not imply medical outcomes, guaranteed suitability, transformation, or endorsement without evidence.
- Naming: always write `The Solas Guide` in full; never shorten the brand name in customer-facing copy.
- Vocabulary: prefer practitioner, practice, experience, specific, introduce, explore, and may support. Avoid healer, guru, transformation journey, exclusive, elite, perfect match, and cure.
- Calls to action: name the real next step, such as Explore practitioners, View the profile, Start an enquiry, or Begin your application.
- Mechanics: use sentence case, active voice, short paragraphs, concrete nouns and verbs, restrained punctuation, and definitions for unfamiliar practices.
- Cultural care: preserve local names and terminology, avoid exoticising people or places, and do not flatten distinct traditions into generic wellness language.
- Approval: never present provisional, unreviewed, or practitioner-supplied information as independently verified.

## Stable design-system anchors

`#principles`, `#comparison`, `#colour`, `#typography`, `#identity`, `#layout`, `#buttons`, `#lists`, `#filters`, `#cards`, `#forms`, `#states`, `#navigation`, `#page-headers`, `#editorial-content`, `#enquiry-patterns`, `#overlays-feedback`, `#imagery`, `#voice`.

## Validation

From `web/`, run:

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Review the page at desktop and approximately 390px wide. Confirm every theme, interactive state, focus treatment, and horizontal content rail remains usable.

## Image generation

Use the project skill at `.agents/skills/solas-image-direction/SKILL.md`. It standardizes The Solas Guide art direction and uses OpenAI's specialized `gpt-image-2` model. Start concept rounds at low quality, promote shortlisted compositions to medium, and reserve high quality for approved final candidates.
