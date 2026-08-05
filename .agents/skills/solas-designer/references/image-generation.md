---
last_updated: "2026-08-05T12:54:15-04:00"
---

# Image generation workflow

Use the shared `imagegen` skill for generation and editing. Apply `art-direction.md` to every prompt and review.

## Workflow

1. Confirm that the asset is required by an active MVP page, then classify it as hero, human context, place, practice, or editorial detail.
2. Write a concise production prompt covering scene, subject, composition, natural light, palette, textures, constraints, and avoid list.
3. Use the shared `imagegen` skill's default built-in workflow. Generate distinct concepts rather than near-duplicates.
4. Review credibility, cultural specificity, anatomy, architecture, lighting, negative space, and prohibited wellness clichés.
5. Iterate on a shortlisted concept with one targeted change at a time and re-check the result.
6. Keep concepts, rejected variants, prompts, approval notes, and generation metadata outside this repository.
7. Only after explicit approval, copy the selected optimized production asset into the appropriate `public/images/` directory with a descriptive kebab-case filename. Do not add its working files or prompt record.
8. Verify the production crop, dimensions, file size, alt text, responsive behaviour, and that the consuming page references the repository asset.

## Tool contract

- Follow the installed shared `imagegen` skill for tool choice, editing inputs, save paths, iteration, and transparent-image handling.
- Do not request or document model, quality, size, or destination-path controls unless the selected image-generation path explicitly exposes them.
- Preview-only work may remain in the image tool's default external storage. A production asset must be copied into the repository only after approval.

## Safety and integrity

- Treat generated imagery as provisional until explicitly approved.
- Never depict a generated person as a real named practitioner.
- Do not imply that a generated subject has a profile, endorsement, or availability through The Solas Guide.
- Do not add readable signage, trademarks, logos, watermarks, or generated text.
- Preserve geographic and cultural plausibility. Do not invent ceremonial details or costumes.
- Never request that the user paste an API key into chat.
