---
last_updated: "2026-09-04T21:11:01-04:00"
---

# The Solas Guide design system

## Starting point

- The production design system starts from the approved representative MVP page and the reusable patterns implemented from it.
- The archived pitch prototype may inform composition, tone, and art direction, but it is not production architecture or approved scope.
- Preserve restrained spacing, visible focus states, and clear information hierarchy while the active visual direction is established.

## Composition and component workflow

1. Start with the journey and content requirement.
2. Research suitable section layouts and page compositions with available design references or tools when this would materially improve the result.
3. Use established component patterns for navigation, inputs, filters, lists, cards, progress, feedback, and overlays.
4. Translate references into The Solas Guide's restrained editorial system; do not copy another product's styling unchanged.
5. Add only the semantic tokens required by approved active pages.
6. Reuse an active production component or variant before creating another visually similar pattern.
7. Document reusable patterns after they prove useful across the MVP; do not create a speculative registry.

## Product presentation

- Treat The Solas Guide as a knowledgeable guide and curator with a curated public directory. It is not a booking marketplace or automated matching service.
- Lead with the visitor's context, the enquiry process, and a clear account of what happens next.
- Use practitioner profiles, browseable listings, filters, and Admin Portal V1 controls where the active MVP scope requires them. Do not introduce direct-contact affordances or unapproved capabilities.
- Treat identity marks and placeholder imagery as provisional until final artwork or content is approved.

## Copy integration

- The designer owns hierarchy, placement, wrapping, legibility, and responsive behaviour.
- Use `solas-copywriter` for customer-facing wording, calls to action, claims, voice, and terminology decisions.
- Do not silently rewrite approved copy to solve a layout issue; adjust the composition or request a bounded copy revision.

## Visual validation

- Review desktop and approximately 390px wide.
- Check keyboard focus, touch targets, content wrapping, overflow, loading and empty states, and image cropping.
- Prefer screenshots or browser evidence for material visual decisions.
