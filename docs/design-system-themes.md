# The Solas Guide design-system themes

This document records the three visual registers currently included in the design-system review page at `/design-system`. The page is a design-review surface, not the final production homepage.

## Default: Aman

`Aman` is the current default. It uses a warm ivory background, quiet charcoal ink, deep green accent, and restrained rounded corners. It is the recommended starting point because it communicates calm authority without feeling clinical or decorative.

## Candidate registers

### Aman — quiet minimal

- Warm ivory and charcoal foundation.
- Deep green accent for actions, focus states, and emphasis.
- Small radius for a softened editorial feel.
- Best fit for the primary direction for The Solas Guide.

### Bambu — earth and material

- Sand foundation with terracotta and forest accents.
- More visibly tactile and place-based than Aman.
- Slightly larger radius and warmer contrast.
- Useful if the brand should lean further into Bali, craft, and natural materials.

### Chanel — editorial contrast

- White, black, cream, and bronze palette.
- No-radius geometry and sharper contrast.
- Most fashion-editorial of the three registers.
- Useful if the brand should feel more luxury-publication than retreat register.

## Shared system

Components consume semantic tokens such as `background`, `foreground`, `card`, `muted`, `accent`, `border`, and `ring`; they should not introduce one-off brand hex values. Fraunces is used for display type and Inter for body copy, labels, and controls. Generous vertical spacing is intentional: the page should slow the reader down and leave room for imagery.

Use uppercase letterspaced labels sparingly for navigation, credentials, section indices, and metadata. Body copy should remain direct, specific, and checkable.

## Review controls

The floating control panel is temporary review tooling. It applies the selected theme to the document root and allows constrained experiments with typography, corner treatment, layout density, and accent emphasis. Theme selection persists in localStorage; the other controls reset when the page reloads. These controls are not part of the final brand or public product experience and should be removed after the system is approved.

The guide also includes fixed side-by-side theme specimens, sticky chapter navigation, brand principles, provisional identity guidance, layout rules, interaction states, and signature patterns for The Solas Guide. The identity specimen is a typographic stand-in only; no final logo has been invented or approved.
