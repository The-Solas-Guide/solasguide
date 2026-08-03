# Image generation workflow

Use the shared `imagegen` skill for generation and editing. Apply `art-direction.md` to every prompt and review.

## Workflow

1. Classify the asset as hero, practitioner, place, practice, or editorial detail.
2. Write a concise production prompt covering scene, subject, composition, natural light, palette, textures, constraints, and avoid list.
3. Generate distinct low-quality concepts rather than near-duplicates.
4. Review credibility, cultural specificity, anatomy, architecture, lighting, negative space, and prohibited wellness clichés.
5. Regenerate shortlisted concepts at medium quality. Use high quality only for an approved final candidate.
6. Save approved working outputs under `public/images/solas-imagery/generated/<asset-type>/` using descriptive kebab-case filenames.
7. Record prompt, model, quality, size, date, and approval status in a sibling Markdown file.

## Model and sizes

- Use `gpt-image-2` for image generation and editing.
- Use `1536x1024` for landscape heroes, category cards, and place imagery.
- Use `1024x1536` for practitioner portraits and vertical editorial crops.
- Use `1024x1024` for compact tiles and neutral composition tests.
- Solve composition at low quality before spending on rendering fidelity.

## Safety and integrity

- Treat generated imagery as provisional until explicitly approved.
- Never depict a generated person as a real named practitioner.
- Do not add readable signage, trademarks, logos, watermarks, or generated text.
- Preserve geographic and cultural plausibility. Do not invent ceremonial details or costumes.
- Never request that the user paste an API key into chat.
