# Model and quality selection

## Default

Use `gpt-image-2`. It is OpenAI's current specialized image generation and editing model. Do not use a GPT-5.6 text/reasoning model to render images.

## Quality ladder

- Low: broad composition exploration, contact sheets, and prompt testing. Default for first rounds.
- Medium: shortlisted art-direction concepts and design-system review.
- High: only an approved final candidate that needs maximum rendering fidelity.

Generate at the intended aspect ratio from the start:

- `1536x1024`: landscape heroes, category cards, and place imagery.
- `1024x1536`: practitioner portraits and vertical editorial crops.
- `1024x1024`: social concepts, compact tiles, and neutral composition tests.

Do not spend high-quality generations to solve a composition problem. Fix prompt, framing, and subject direction at low quality first.
