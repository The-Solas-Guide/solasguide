<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project source of truth

- This repository root is the application root; do not assume a `web/` subdirectory.
- The current delivery scope is `docs/source-of-truth/mvp-scope.md`.
- Keep contracts, transcripts, commercial material, private research, internal planning, and generated outputs outside this repository.
- Treat the archived pitch prototype as historical reference only. Its route names, phase labels, components, copy, and data do not define the production application.

## Current data-storage decision

- For the current MVP build, Supabase is the application's only data store and source of truth for submissions and operational data.
- Do not add Airtable runtime writes, Airtable API clients, webhooks, sync jobs, or Airtable environment variables unless the decision is explicitly revisited before launch.
- A temporary manual or exported handoff of leads to Airtable is outside the application and must not become a runtime dependency.
- The signed commercial SOW is held in the internal workspace and names Airtable as the operational workspace. Do not silently rewrite its acceptance criteria; record the agreed Supabase-only change separately before launch.

## MVP delivery principle

- Do not overengineer this platform. It is an MVP, so prioritise delivery momentum, simple maintainable implementations, and user-facing performance.
- Build the smallest reliable solution that satisfies the current SOW and critical user journeys. Do not add speculative abstractions, enterprise infrastructure, generic extensibility, or support for hypothetical future phases.
- Cover security, authorization, data integrity, recoverability, and essential failure handling on critical paths. Do not use MVP speed as a reason to weaken these safeguards.
- When a non-critical edge case is plausible but not required for the MVP, note it with its impact and defer it instead of automatically expanding implementation scope.
- Implement an edge case now only when it affects the critical journey, creates material security or data risk, or is substantially cheaper to address correctly during the current change.

## Design-system workflow

- Invoke the `solas-designer` skill for The Solas Guide UI, UX, visual design, art direction, image generation, or visual QA work.
- Invoke the `solas-copywriter` skill when the primary task is customer-facing copy, interface language, calls to action, editorial voice, or terminology review.
- For combined work, let `solas-copywriter` own wording and claims, then let `solas-designer` own hierarchy, placement, wrapping, and responsive visual integration.
- Load only the reference files relevant to the task.
- The archived pitch prototype is a reference, not a production design system or component source of truth.
- Establish the active visual direction through an approved representative MVP page, then document only the reusable patterns that are actually implemented.
- Use the Relume MCP to research suitable section-level layouts and page compositions before inventing a new composition from scratch.
- Use Untitled UI as component-pattern inspiration when evaluating controls, navigation, feedback, forms, and other interface primitives.
- References are starting points, not source designs to copy. Adapt structure and interaction to The Solas Guide's editorial positioning, content needs, and MVP scope.
- Build the minimum reusable design foundation needed by the active MVP pages. Do not recreate the prototype component registry pre-emptively.
- Once active semantic theme tokens and reusable components exist, extend them before creating visually similar one-offs.

## Specialist agents and skills

- Use installed official Supabase skills for schema, migration, RLS, query, and integration work; do not recreate that guidance in a project skill.
- Delegate completed work to `solas-reviewer` when independent SOW, correctness, security, or regression review would materially improve confidence.
- Delegate browser, responsive, persistence, build, or preview verification to `solas-qa` when the work is sufficiently complete to test.
- Keep implementation in the main thread when planning, building, and refinement share significant context. Give specialist agents a bounded task and required evidence rather than a broad ownership area.

## Project model routing

- Use `gpt-5.6-sol` with medium reasoning for planning and architecture decisions.
- Use `gpt-5.6-luna` with max reasoning and the fast service tier for routine implementation and coding tasks.
- Escalate complex, unfamiliar, regression-prone, or security-sensitive coding tasks to `gpt-5.6-terra` with xhigh reasoning.
- Use `gpt-5.6-sol` with medium reasoning for pull request and final implementation review.
