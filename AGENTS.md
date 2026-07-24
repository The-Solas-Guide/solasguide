<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design-system workflow

- Treat `/design-system` as the visual source of truth and `docs/design-system-agent-reference.md` as its implementation index.
- Use the Relume MCP to research suitable section-level layouts and page compositions before inventing a new composition from scratch.
- Use Untitled UI as component-pattern inspiration when evaluating controls, navigation, feedback, forms, and other interface primitives.
- References are starting points, not source designs to copy. Adapt structure and interaction to The Solas Guide's editorial positioning, content needs, and MVP scope.
- Every new or adapted component must use the semantic theme tokens in `src/app/globals.css`. Do not introduce standalone colours, typography, radii, shadows, or spacing that bypass the active theme.
- Verify new work in Aman, Bambu, and Chanel. Aman remains the default unless the approved direction changes.
- Extend an existing registry component through props or variants before creating a visually similar one-off component.
- Export approved reusable components through `src/components/component-registry.ts` and document their intended use in `docs/design-system-agent-reference.md`.
