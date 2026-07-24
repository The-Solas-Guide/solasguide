---
name: solas-image-direction
description: Generate, edit, review, and prepare provisional imagery for The Solas Guide using the OpenAI Image API. Use for The Solas Guide website heroes, practitioner portraits, place and architecture photography, editorial details, category imagery, or image concept batches.
---

# The Solas Guide image direction

Use the shared `imagegen` skill and its bundled CLI for API execution. Apply The Solas Guide-specific rules below to every prompt and review.

## Workflow

1. Read `references/art-direction.md` before writing prompts.
2. Read `references/model-selection.md` before choosing model and quality.
3. Classify the asset as hero, practitioner, place, practice, or editorial detail.
4. Create a concise production prompt containing scene, subject, composition, natural light, palette, textures, constraints, and avoid list.
5. Generate concepts with `gpt-image-2` at low quality. Produce distinct compositions rather than near-duplicates.
6. Review subject credibility, cultural specificity, anatomy, architecture, lighting, negative space, and prohibited wellness clichés.
7. Regenerate only shortlisted concepts at medium quality. Use high quality only for an approved final candidate.
8. Save approved working outputs under `public/images/solas-imagery/generated/<asset-type>/` using descriptive kebab-case filenames.
9. Record the prompt, model, quality, size, date, and approval status in a sibling Markdown file.

## Execution

Locate the shared image CLI and always override its model default:

```sh
python /Users/connorfinlayson/.agents/skills/imagegen/scripts/image_gen.py generate \
  --model gpt-image-2 \
  --quality low \
  --size 1536x1024 \
  --prompt-file tmp/imagegen/solas-prompt.txt \
  --out-dir public/images/solas-imagery/generated
```

Require `OPENAI_API_KEY` for live calls. Never ask the user to paste the key into chat. Use `--dry-run` to validate prompt and arguments without spending API credit.

## Non-negotiable constraints

- Treat generated imagery as provisional until explicitly approved.
- Do not depict a generated person as a real named practitioner.
- Do not include logos, readable signage, trademarks, watermarks, or generated text.
- Avoid stock-wellness poses, hands on hearts, prayer gestures, staged meditation, yoga silhouettes, mystical effects, and exaggerated luxury.
- Preserve geographic and cultural plausibility. Do not invent ceremonial details or costumes.
- Prefer lived-in imperfection, natural materials, quiet human presence, and documentary restraint.
