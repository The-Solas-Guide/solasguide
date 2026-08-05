# Guide index teaser design

## Status

Approved direction for implementation.

## Objective

Make the homepage feel like the front door to a populated, curated wellness network. A first-time visitor should understand that The Solas Guide has access to people, places, and experiences across Bali and uses human judgement to recommend a relevant direction.

The intended mental model is the breadth and discovery value of a travel platform, combined with a smaller, selective network and personal concierge service. Customer-facing copy must not compare The Solas Guide directly with another brand.

## Hypothesis

Showing the shape and breadth of the network will make the concierge proposition more tangible and increase qualified buyer enquiries.

The teaser tests whether visitors want access to this curated network before Solas invests in public profiles, search, filters, and full directory functionality.

## Placement

Place the guide index immediately after the homepage hero. It should establish what visitors can access before the page explains the concierge process in detail.

The revised homepage sequence is:

1. Hero and primary enquiry action.
2. Guide index teaser.
3. What The Solas Guide does.
4. How the human concierge works.
5. Why the guide exists.
6. Practitioner expression of interest.
7. Final buyer enquiry action.

## Section composition

Use the label `Explore the guide` and introduce the section as a glimpse of the network rather than a searchable catalogue.

Provide three tabs:

- People
- Places
- Experiences

Each tab displays eight cards in a four-column, two-row grid on desktop. On approximately 390px screens, use two columns and four rows.

The active tab must be visually clear. Tabs must support keyboard navigation, visible focus, and appropriate tab semantics.

## Card content

### People

Use illustrative practitioner previews until approved practitioner content is available. Each card may show:

- Portrait
- Display name
- Location
- Two or three practice areas

Never present a generated or stock subject as a real practitioner. During review, keep a clear section-level disclosure that the profiles are illustrative. Replace placeholders only with approved names, imagery, facts, and publishing permission.

### Places

Use real Bali venues only after confirming the name, current public description, image rights, and permission to present the venue as part of the Solas network.

During prototype and research review, publicly verifiable venues may appear as research references with an explicit statement that inclusion does not imply partnership or endorsement.

Each approved card may show:

- Venue name
- Location
- Concise venue type or relevant facilities
- Approved image

### Experiences

Use real, currently available experiences only after confirming the provider, wording, availability status, image rights, and permission.

Each approved card may show:

- Experience name
- Provider or location
- One-sentence factual description
- Approved image

Avoid medical outcomes, transformation promises, or language stronger than the provider evidence.

## Interaction

Tabs only switch the visible teaser cards. Cards do not link to public profiles, venue pages, booking, or search in the current MVP.

The section should lead into the existing concierge journey with a single action such as `Tell us what you need`.

Do not add filters, pagination, saved items, ratings, prices, availability, booking controls, or direct-contact actions.

## Visual direction

- Use an image-led editorial grid with restrained borders and minimal card decoration.
- Keep the background warm and light with high-contrast dark text.
- Let imagery establish variety while typography and spacing keep the section coherent.
- Do not place category badges over the card images.
- Show location as a small high-contrast overlay and keep the primary name and description beneath the image.
- Use visible keyboard focus and maintain WCAG AA text contrast.

## Content and data boundary

The production application must not contain invented people, unapproved listings, or claims of partnership.

For the first implementation, teaser content should live as a small local typed dataset because it is presentational and does not justify a new CMS or directory model. Mark placeholder people explicitly in code and replace them through an approved content pass before production.

The teaser does not change the current exclusion of public practitioner profiles, venue directories, automated matching, booking, or direct messaging.

## Success criteria

- A first-time visitor can explain that Solas is a curated network of people, places, and experiences.
- The section makes the service feel populated without pretending a full directory exists.
- Visitors understand that Solas uses the network to support a human-led recommendation and introduction.
- All real names, descriptions, and images have a recorded approval or permission source before production.
- The grid is usable without horizontal overflow at desktop and approximately 390px.
- Tabs work with pointer and keyboard input and expose correct selected-state semantics.
- No card implies booking, guaranteed suitability, verification, endorsement, or direct access.

## Deferred work

- Public practitioner profiles
- Venue and experience detail pages
- Search and category filters
- Ratings or reviews
- Saved items
- Availability and booking
- Automated recommendations
- Directory administration tools
