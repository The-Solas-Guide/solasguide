# Public regions vs internal locations — implementation plan

> Planning only. No schema, seed, or production data changes in this PR.
> Parent epic: [#61](https://github.com/The-Solas-Guide/solasguide/issues/61) · This issue: [#66](https://github.com/The-Solas-Guide/solasguide/issues/66)

**Goal:** Stop publicly labelling practitioners with sensitive specific locations (especially Bali) while keeping those specifics stored and searchable so the directory still returns the right people.

**Status:** Awaiting Connor (schema / production-data) and Jitesh (region vocabulary + travel rule) approval before any implementation PR.

**Constraint from Connor:** no migrations or production reshape unless this plan is approved. Do not invent a full geo CMS. Do not remove Bali from internal search usefulness.

---

## Decision for Connor

| Question | Recommendation |
|---|---|
| Is Jitesh’s public-region / internal-specific split the right model? | **Yes.** It is the smallest model that unblocks joining without deleting Bali from search. |
| Safer while building? | **Ship Phase A first:** application-owned mapping, no database change, no production backfill. Hide specifics on every public *label* surface. Keep Bali on the practitioner record and in text search. |
| When do we touch the database? | **Phase B only**, after Connor reviews a one-column / one-table mapping. Not required to close the joining blocker. |
| What must not ship without Connor? | Any migration, seed rewrite, RLS change, or production `practitioner_terms` / `practitioner_term_links` update. |

---

## 1. Current state

Locations are a flat controlled taxonomy. There is no region layer, no parent term, and no visibility flag.

### Storage

| Object | Role |
|---|---|
| `public.practitioner_terms` where `type = 'location'` | Canonical location tags. Columns: `id`, `type`, `name`, `slug`, `sort_order`, `is_active`, `archived_at`. Allowed types are locked in `practitioner_terms_type_check`: `support_area`, `approach`, `modality`, `works_with`, `location`, `language`. |
| `public.practitioner_term_links` | Ordered many-to-many (`practitioner_id`, `term_id`, `display_order`). |
| Publish rule | A published practitioner must have at least one **active** location. Enforced by `validate_practitioner_publication()`, `assert_published_practitioner_has_location()`, and the term-link trigger. |

Created in `supabase/migrations/20260827155230_create_practitioner_directory.sql`. Taxonomy archive lifecycle added in `supabase/migrations/20260904162441_admin_cms_foundation.sql`. No later migration adds geo hierarchy or display visibility.

### Founding-cohort terms (seed)

From `supabase/seed.sql`:

| Term | Slug | Sort |
|---|---|---|
| Bali | `bali` | 10 |
| International | `international` | 20 |
| Switzerland | `switzerland` | 30 |
| Netherlands | `netherlands` | 40 |
| Italy | `italy` | 50 |
| Indonesia | `indonesia` | 60 |
| Singapore | `singapore` | 70 |
| Portugal | `portugal` | 80 |
| Kenya | `kenya` | 90 |
| UK | `uk` | 100 |

There is no `Southeast Asia`, `Europe`, `Asia`, `Africa`, or `Willing to travel` term today.

**Cohort links (20 published profiles):**

- 18 of 20 include `Bali`.
- `claudia-pietrantoni`: `Bali` + `Italy` (the brief’s second example).
- `dirk-hamelijnck`: `Bali` + `Netherlands`.
- `punnu-singh-wasu`: `Bali` + `Switzerland` + `International`.
- `livy-von-goh`: `Indonesia`, `Singapore`, `Portugal`, `Kenya`, `UK` — the only profile without `Bali`.
- 12 profiles are `Bali` + `International`.
- 5 profiles are `Bali` only (`kartika-alexandra`, `kimberley-utama`, `clare-hampton`, `indri-hapsari`, `aaron-binning`).

E2E fixtures in `src/lib/practitioner-e2e-fixtures.ts` only seed `Bali` and `International`.

### How a location becomes public copy

`mapPractitionerRow()` in `src/lib/practitioners.ts` joins every linked `location` name into `practitioner.location` with `", "`. That string is what cards render.

```352:359:src/lib/practitioners.ts
  const locations = namesForType("location");
  // ...
    location: locations.length ? locations.join(", ") : undefined,
```

The full `terms` array (including `Bali`) is also attached to the public `Practitioner` object and sent into client directory/profile components.

### Public surfaces that currently show or index specifics

| Surface | File | What leaks today |
|---|---|---|
| Directory + homepage featured cards | `src/components/practitioners/practitioner-card.tsx` | Uppercase `practitioner.location` (`Bali`, `Bali, Italy`, …). Featured preview: `src/components/home/registry-preview.tsx`. |
| Profile “Based” | `src/components/practitioners/practitioner-profile.tsx` | Linked chips to `/practitioners/locations/{slug}`. |
| Admin preview | `src/components/admin/practitioner-preview.tsx` | Same profile component via `mapPractitionerRow` — preview currently matches public, including Bali. |
| Directory filter | `src/components/practitioners/practitioner-directory.tsx` | Facet options built from `termOptions(..., "location")`. Bali is a visible filter. |
| Location discovery | `src/app/practitioners/locations/[slug]/page.tsx` | `/practitioners/locations/bali` is a public indexable page titled “Bali”. |
| Sitemap + discovery index | `src/app/sitemap.ts`, `list_active_practitioner_taxonomy_terms()` | Every active location slug, including `bali`. |
| Discovery metadata | `src/lib/practitioner-metadata.ts` | Title/canonical for `/practitioners/locations/bali`. |
| JSON-LD | `getPractitionerJsonLd()` | Does **not** currently emit location — keep it that way. |

### Search and filters today

`search_published_practitioner_ids` in `supabase/migrations/20260901170223_add_practitioner_search.sql`:

- Text query matches `name`, `descriptor`, `summary`, `about`, credentials, training, **and every linked term name** (including `Bali`).
- `p_location_slugs` matches `practitioner_terms.type = 'location'` slugs exactly. `?locations=bali` already returns the right people.
- Client-side fallback `matchesDirectoryFilters()` / `matchesQuery()` in `src/lib/practitioners.ts` and `src/components/practitioners/practitioner-directory.tsx` behave the same.

So **internal search usefulness already exists**. The defect is display and public chrome, not retrieval.

### Admin CMS today

| Surface | File | Behaviour |
|---|---|---|
| Taxonomy manager | `src/lib/admin/taxonomy-cms.ts`, `src/components/admin/taxonomy-manager.tsx` | Location is one of six term types. Create / archive / restore. No parent or visibility. |
| Practitioner editor | `src/components/admin/practitioner-editor.tsx` | Multi-select location terms. Publish blocked without an active location (`validatePractitionerFields` in `src/lib/admin/practitioner-cms.ts`). |
| Admin list | `src/components/admin/practitioner-manager.tsx` | Filter by any taxonomy term id, including Bali. |

Admin reads terms with the service role, so unpublished/inactive terms remain available internally.

### RLS / API exposure

Anon/authenticated may `SELECT` active location terms that are linked to a published practitioner (`practitioner_terms_public_read`). They may also call:

- `search_published_practitioner_ids` (security invoker)
- `get_active_practitioner_taxonomy_term` / `list_active_practitioner_taxonomy_terms` (security definer; return any active `location` slug, even with zero published links)

Hiding Bali in React does **not** hide it from those RPCs or from the public `Practitioner.terms` payload. Phase A must remap the payload; Phase B can optionally tighten RPC/RLS.

### Out of scope (do not fold into #66)

- Homepage venue/experience teasers in `src/components/home/guide-index.tsx` and `recognised-venues.tsx` (Ubud, Canggu, “time in Bali”). Different product surface.
- Become-a-practitioner “Based in Bali” EOI answers (`baliRelationship`, `locationDetail`). Private submission to Solas, not a public profile label.
- Rewriting founding-cohort `about` / `summary` / `descriptor` / modality names that mention Bali or Balinese practice. Editorial leak; called out in §9.

---

## 2. Recommended approach

**Keep one internal location taxonomy. Derive a small public-region layer for every public label.**

Jitesh’s split is the right product model: Solas stores the specific place; the public site only ever prints a broad region (or travel intent). That is what practitioners asked for. The safer-while-building question is implementation, not whether to split.

### Chosen model

1. **Internal locations stay as they are.** `Bali`, `Italy`, `Kenya`, etc. remain `practitioner_terms` of type `location`. Admin keeps assigning them. Publish still requires one active internal location. Bali stays on the record so search and admin filters keep working.
2. **Public regions are a closed vocabulary**, not free text and not a geo CMS. Start with Jitesh’s list, plus one gap fill:
   - `Southeast Asia`
   - `Europe`
   - `Asia` (reserved; unused by the founding cohort)
   - `Africa` (**proposed** — Kenya has no home in the brief)
   - `International` (already stored; already public-safe)
   - `Willing to travel` (intent, not geography)
3. **Each internal location maps to exactly one geographic public region**, except `International`, which maps to itself.
4. **`Willing to travel` is derived**, not stored in Phase A: add it when a practitioner’s internal locations resolve to **two or more distinct geographic regions** (counting SEA / Europe / Asia / Africa, **not** counting `International`). That reproduces `Bali / Italy → Southeast Asia · Europe · Willing to travel` without a new admin field.
5. **Fail closed.** An unmapped internal location is omitted from public display and flagged in admin. Never print the raw specific as a fallback.
6. **Public chrome uses regions only.** Cards, profile “Based”, directory filter options, discovery pages, sitemap, and the public `Practitioner` payload. Specific slugs stay valid as **hidden** filter values and as text-search hits.

### Why this over the alternatives

- Unblocks the joining blocker without a production data reshape.
- Preserves Bali as a search key (term-name match in the existing RPC).
- Avoids a geo CMS: one static map, ~10 rows.
- Leaves a clean Phase B path: persist the same map in Supabase so admin can edit it without a deploy.
- Matches the brief’s examples without inventing per-profile public copy.

### Public vs internal, in one sentence

**Visitors see regions. Solas stores and searches specifics. Typing “Bali” still finds people; the card does not say Bali.**

---

## 3. Alternatives considered

### A. Display-only hide on cards/profiles (keep Bali in the public filter)

Map names only in `practitioner.location` and the profile “Based” row. Leave the directory Location facet, `/practitioners/locations/bali`, and the sitemap as they are.

- **Faster:** a few render files.
- **Weaker on the blocker:** Solas still publishes a “Bali” index and filter. That is still a public label, just one click away.
- **Reject as the end state.** Acceptable only as an incomplete intermediate if Phase A were split further; not recommended.

### B. Replace `Bali` with `Southeast Asia` on the same term

Rename the term (or relink everyone to a new `southeast-asia` term and archive `bali`).

- **Breaks** “search/filters for Bali return the right practitioners”.
- Forces a production term rewrite Connor has not approved.
- Loses country-level admin usefulness (`Italy` vs `Europe`).
- **Reject.**

### C. Dual stored taxonomies from day one (`location` + `public_region` links)

Admin assigns both layers on every profile. Regions are first-class term links, not derived.

- **Most explicit**, and closest to “admin dual fields”.
- **Easy to drift:** `Bali` saved, public region forgotten, or the two layers contradict.
- Needs a migration, new term type or second link set, seed/backfill, and publish-rule changes — all Connor-gated — before the public leak stops.
- **Defer to Phase B only if derivation proves too blunt** (for example Jitesh wants `Willing to travel` as a manual override). Not the first ship.

### D. Full geo CMS (continents, countries, cities, aliases)

- Explicitly out of bounds. Do not do this for MVP.

---

## 4. Data model

### Phase A (no database) — application map

New module, suggested path `src/lib/location-regions.ts`. Owned by application code, reviewed like any other taxonomy constant.

```ts
export type PublicRegionSlug =
  | "southeast-asia"
  | "europe"
  | "asia"
  | "africa"
  | "international"
  | "willing-to-travel";

export type PublicRegion = {
  slug: PublicRegionSlug;
  name: string;
  kind: "geographic" | "intent";
};

export const publicRegions: readonly PublicRegion[] = [
  { slug: "southeast-asia", name: "Southeast Asia", kind: "geographic" },
  { slug: "europe", name: "Europe", kind: "geographic" },
  { slug: "asia", name: "Asia", kind: "geographic" },
  { slug: "africa", name: "Africa", kind: "geographic" },
  { slug: "international", name: "International", kind: "geographic" },
  { slug: "willing-to-travel", name: "Willing to travel", kind: "intent" },
];

/** Each internal location slug → one geographic public region. */
export const internalLocationToRegion: Readonly<Record<string, Exclude<PublicRegionSlug, "willing-to-travel">>> = {
  bali: "southeast-asia",
  indonesia: "southeast-asia",
  singapore: "southeast-asia",
  switzerland: "europe",
  netherlands: "europe",
  italy: "europe",
  portugal: "europe",
  uk: "europe",
  kenya: "africa",
  international: "international",
};
```

Derivation (pseudocode):

1. Map each linked active internal location slug through `internalLocationToRegion`.
2. Drop unmapped slugs; collect them for an admin warning.
3. Unique geographic regions, stable sort = `publicRegions` order.
4. If two or more `kind === "geographic"` regions **other than** `international` are present, append `willing-to-travel`.
5. Public display string uses ` · ` (brief), e.g. `Southeast Asia · Europe · Willing to travel`.

**Founding-cohort results under this rule:**

| Internal | Public |
|---|---|
| `Bali` | `Southeast Asia` |
| `Bali` + `Indonesia` (if ever used) | `Southeast Asia` |
| `Bali` + `Italy` | `Southeast Asia · Europe · Willing to travel` |
| `Bali` + `Netherlands` | `Southeast Asia · Europe · Willing to travel` |
| `Bali` + `International` | `Southeast Asia · International` |
| `Bali` + `Switzerland` + `International` | `Southeast Asia · Europe · International · Willing to travel` |
| `Indonesia` + `Singapore` + `Portugal` + `Kenya` + `UK` | `Southeast Asia · Europe · Africa · Willing to travel` |

`Asia` stays in the vocabulary with no current members.

### Phase B (Connor-gated) — persist the same map

Minimum schema that is still not a geo CMS. Pick **one**:

**B1 — preferred if we persist:** add nullable `public_region_slug text` on `practitioner_terms`, checked against the closed region list, required when `type = 'location'` and `is_active`. `International` maps to `international`. `Willing to travel` stays derived unless Jitesh asks for a manual override.

**B2:** add a six-row `public.public_regions` table and `practitioner_terms.public_region_id` FK. Same behaviour, more tables.

**B3 — only if derivation is rejected:** add `willing_to_travel boolean` on `practitioners` (default false) and keep region mapping as B1.

Do **not** add `parent_id` trees, city tables, or a new `type` value unless B1 is proven insufficient.

Do **not** add a second set of `practitioner_term_links` for regions unless we abandon derivation.

### Admin UX

**Phase A**

- Editor location picker **unchanged** (still Bali, Italy, …).
- Under the picker, show a read-only “Public regions” line from the mapper, plus a warning if any selected location is unmapped.
- Preview (`practitioner-preview.tsx`) must go through the same public mapper so “Preview” matches production.
- Taxonomy manager stays a flat location list. Optional helper text: “Public site shows the mapped region, not this name.”

**Phase B**

- Taxonomy create/edit for `location` gains a required “Public region” select.
- Still no second practitioner-level region picker unless we choose B3.

### Copy / design notes

- Region names and “Willing to travel” should get a `solas-copywriter` pass before Phase A ships. Confirm “Southeast Asia” vs “South East Asia”, and whether `Africa` is acceptable.
- Filter label is currently “Location”. Recommend “Region” on the public facet after copy review; admin keeps “Location”.
- `solas-designer` owns chip wrapping on cards/profile if `Southeast Asia · Europe · Willing to travel` overflows the current uppercase eyebrow.

---

## 5. Migration / backfill plan

### Phase A — no production data change

- No migration.
- No `seed.sql` rewrite required for the leak to stop (map lives in app code).
- Local/e2e fixtures keep `Bali` links; tests assert public copy is `Southeast Asia`.
- **Connor approval not required** for Phase A code, unless he wants the mapping reviewed as if it were schema.

### Phase B — Connor must approve before work starts

If B1 is approved:

1. Migration adds `public_region_slug` (or FK) with a check constraint.
2. Backfill **terms only**, not practitioner rows:

   | slug | public_region_slug |
   |---|---|
   | `bali`, `indonesia`, `singapore` | `southeast-asia` |
   | `switzerland`, `netherlands`, `italy`, `portugal`, `uk` | `europe` |
   | `kenya` | `africa` |
   | `international` | `international` |

3. Update `supabase/seed.sql` so new local resets match production.
4. Tighten `list_active_practitioner_taxonomy_terms` / `get_active_practitioner_taxonomy_term` so public discovery only returns region slugs (or a new `public_region` type). Keep `search_published_practitioner_ids` able to match internal names.
5. No need to rewrite `practitioner_term_links` if regions stay derived.

**Production data reshape = the term backfill in step 2.** That is the line Connor reviews. Practitioner profile rows do not need to change.

### What we will not do

- Mass-edit `about` / `summary` in SQL.
- Delete or rename the `bali` term.
- Relink 18 practitioners off Bali as a substitute for a display layer.

---

## 6. UI surfaces to change

Implementation order after approval. Phase A is FE + mapping helpers only.

### Public (must change to close the leak)

| Surface | Change |
|---|---|
| `src/lib/practitioners.ts` `mapPractitionerRow` | `location` becomes derived public regions. Public `terms` used by cards/filters must expose region stand-ins, not `Bali`. Keep raw internal terms available server-side for filter expansion and admin. |
| `src/components/practitioners/practitioner-card.tsx` | Renders `practitioner.location` — should just work once mapping is in the mapper. Verify eyebrow wrapping. |
| `src/components/home/registry-preview.tsx` | Same cards. |
| `src/components/practitioners/practitioner-profile.tsx` | “Based” chips link to `/practitioners/locations/southeast-asia` (etc.), never `/practitioners/locations/bali`. |
| `src/components/practitioners/practitioner-directory.tsx` | Location facet options = public regions present in the result set (or the full closed list). Active-filter summary must not say “Explore Bali”. |
| `src/app/practitioners/page.tsx` | Treat region slugs as valid `locations` query values; expand to internal slugs before RPC. |
| `src/app/practitioners/locations/[slug]/page.tsx` | Public pages only for region slugs. `/practitioners/locations/bali`: **do not keep as a public indexable page**. Recommended: `404` (or `410`) so we do not advertise a Bali list. Optional later: silent redirect to `southeast-asia` if SEO equity matters — decide with Connor; default is 404. |
| `src/app/sitemap.ts` | Drop specific location URLs; include region slugs that have published members (and empty-state policy consistent with areas). |
| `src/lib/practitioner-metadata.ts` | Discovery copy: “region” not “location” once copy is approved. |
| `src/components/practitioners/practitioner-discovery-page.tsx` | Eyebrow/intro for regions. |

### Admin (Phase A, small)

| Surface | Change |
|---|---|
| `src/components/admin/practitioner-editor.tsx` | Read-only derived public regions + unmapped warning. Location picker unchanged. |
| `src/components/admin/practitioner-preview.tsx` | Must use the public mapper so preview does not still say Bali. |

### Tests that will fail and must be rewritten (not production data)

- `src/lib/practitioners.test.ts` — expects `location: "Bali"`.
- `src/lib/practitioner-metadata.test.ts` — uses `{ name: "Bali", slug: "bali" }`.
- `tests/e2e/practitioners.spec.ts` — profile link “Bali”, `?locations=bali` summary, sitemap contains `/practitioners/locations/bali`, discovery visit to `/bali`.
- Directory filter e2e currently uses **International** (already public-safe); add a Bali case that asserts the **card** shows `Southeast Asia` while search for `Bali` still returns the profile.

### Explicitly unchanged in Phase A

- Admin taxonomy CRUD schema.
- Publish “one active location” rule.
- EOI / enquiry location fields.
- Homepage venue teasers.
- JSON-LD (continue omitting location).

---

## 7. Search behaviour

| Action | Public visitor | Admin / Solas |
|---|---|---|
| See card / profile / featured | Regions only | Editor shows internal tags; preview shows regions |
| Location / region filter UI | Region options only. `Southeast Asia` expands to `bali \| indonesia \| singapore` before `p_location_slugs` | Existing term filter, including Bali |
| Type `Bali` in directory search | **Still returns** practitioners whose linked location name or profile text contains `bali` | Same |
| `?locations=bali` shared URL | Still matches via RPC (hidden specific). Do not render a “Bali” chip or “Explore Bali” link. Prefer rewriting the visible summary to `Southeast Asia` when the slug is a known specific | Fine to keep |
| `?locations=southeast-asia` | New public URL. Expands to internal slugs | n/a |
| `/practitioners/locations/bali` | Not a public listing (404). Stops sitemap + inbound label | n/a |
| `/practitioners/locations/southeast-asia` | Public discovery of mapped practitioners | n/a |

Filter matching stays **OR within location, AND across facets**, as today.

Do not stop term-name search from matching Bali. That is the “keep specifics searchable” requirement without putting Bali on the card.

**Payload rule:** public client components must not receive `terms` entries with internal location names. If the directory client still sees `name: "Bali"` in props, the leak is not closed.

**RLS rule for Phase A:** leave table policies as they are so the invoker search RPC keeps seeing location term names. Call this an accepted residual API leak in §9. Closing it needs a security-definer search rewrite (Connor-gated, Phase B+).

---

## 8. Test plan

Acceptance is “no public Bali label” + “Bali still finds the right people”.

### Unit

- Mapper: each founding-cohort fixture row → expected public string (table in §4).
- Unmapped slug omitted; warning list returned.
- Dedup: `Bali` + `Indonesia` → single `Southeast Asia`.
- Travel rule: one geo + `International` → no `Willing to travel`; two geos → append it.
- `parseDirectoryFilters` / search prep: `southeast-asia` expands to `['bali','indonesia','singapore']`; unknown slugs still produce the existing invalid-filter behaviour.
- `mapPractitionerRow` public projection contains no location term named `Bali`.
- JSON-LD still has no location / address.

### Database (Phase A: no new SQL tests unless we touch RPCs)

- Existing pgTAP: publish still requires an internal location; Bali links still valid.
- Phase B only: advisors + backfill test that every active location term has a region and no practitioner lost a location link.

### Browser / e2e

Rewrite `tests/e2e/practitioners.spec.ts` around the e2e trio (Kartika, Sandra, Indri — all internally Bali):

1. Directory cards show `Southeast Asia`, never `Bali`.
2. Kartika profile “Based” is `Southeast Asia` linking to `/practitioners/locations/southeast-asia`.
3. Search `Bali` still returns those three (or the subset whose terms/text match).
4. Filter `Southeast Asia` returns them; filter UI has no `Bali` option.
5. `/practitioners/locations/bali` is 404; sitemap omits it; sitemap includes `southeast-asia` if we index regions.
6. Featured homepage cards use the same region eyebrow.
7. Admin preview for Kartika shows `Southeast Asia`, not `Bali`.
8. 390px: long region string does not overflow the card eyebrow.
9. Regression: area discovery, format/language filters, unpublished exclusion unchanged.

### Manual / editorial (do not block Phase A)

- Spot-check published `about` text for “Bali-based” (known in seed for several profiles). Decide with Jitesh whether that is a separate copy pass.

---

## 9. Risks / open questions

### For Connor

1. **Approve Phase A with no migration?** Recommended. This is the safer-while-building path.
2. **`/practitioners/locations/bali` → 404 or redirect?** Recommend 404 so we do not keep a public Bali collection URL. Existing sitemap/search console entries will drop.
3. **Residual anon API leak.** Term names remain readable via RLS and taxonomy RPCs until a security-definer search rewrite. Is that acceptable for MVP if the UI and sitemap are clean?
4. **Phase B schema.** Prefer B1 (`public_region_slug` on location terms) over a new table. Confirm before any migration is written.
5. **Production backfill** is terms-only (10 rows). Still needs explicit approval.

### For Jitesh

1. **Is the split the right approach?** Recommendation: **yes.** Safer alternative while building is Phase A (derived regions in code), not “don’t split” and not “rename Bali away”.
2. **Add `Africa` for Kenya**, or map Kenya to `International`? Recommend `Africa`.
3. **Keep unused `Asia`** in the public list?
4. **Travel rule:** two+ geographic regions ⇒ `Willing to travel`; `International` alone does not. Confirm, especially for `Bali + International` (12 of 20 profiles).
5. **Editorial Bali in bios and modalities** (e.g. “Bali-based”, “Melukat / Balinese water purification”, Ida Resi Alit’s profile). Phase A will not rewrite these. Is a later copy pass in scope?
6. Public filter label: **Region** vs **Location**?
7. Homepage venue teasers still say Ubud / Bali — confirm they stay (recommended: yes, different surface).

### Product / legal residual risk

Even after Phase A, a visitor who types “Bali” will see matching practitioners. That is user-initiated search, not Solas pinning “Bali” on the profile. If practitioners need *search* to stop matching as well, that contradicts the brief and should be an explicit product change.

---

## 10. Suggested phased rollout

### Phase A — close the public leak (recommended first implementation PR)

**Touches:** application code and tests only. **Does not touch:** migrations, seed production reshape, RLS.

1. Add `src/lib/location-regions.ts` + unit tests for the founding-cohort table.
2. Project public regions in `mapPractitionerRow` / a dedicated `toPublicPractitioner()` used by every public loader.
3. Expand region slugs → internal slugs in directory search/filter.
4. Restrict discovery + sitemap to region slugs; 404 specifics.
5. Admin: derived-region readout + preview uses public mapper.
6. Update unit/e2e tests listed in §6.
7. `solas-copywriter` on region labels; `solas-designer` on eyebrow overflow if needed.
8. `solas-qa` on directory, profile, featured, search `Bali`, filter `Southeast Asia`, sitemap.

**Exit:** no public card, profile, filter option, discovery page, or sitemap entry prints `Bali` (or Italy, Kenya, …). Search `Bali` still works. Admin still edits Bali.

### Phase B — persist mapping (Connor-approved migration)

1. B1 column (or agreed alternative) + term backfill + seed alignment.
2. Admin taxonomy: required public-region select.
3. Optional: public taxonomy RPCs return regions only; search RPC remains able to match internal names (likely security definer).
4. Move the app map to read from DB, keep the same function signatures.

**Exit:** adding “Lisbon” later is an admin term + region, not a deploy.

### Phase C — editorial / hardening (separate, explicitly scoped)

1. Jitesh-approved bio/modality copy pass for remaining “Bali-based” prose.
2. Optional RLS tightening once search is security definer.
3. Manual `Willing to travel` override only if Phase A derivation is wrong in production.

### What is FE-only vs database

| Work | Layer | Phase |
|---|---|---|
| Region map + derivation | FE / app | A |
| Card, profile, featured, filter, discovery, sitemap, metadata | FE | A |
| Filter slug expansion before existing RPC | FE | A |
| Admin derived-region readout + preview | FE | A |
| Tests | FE + e2e | A |
| `public_region_slug` (or table) + check constraint | DB | B — Connor |
| Backfill 10 location terms | Production data | B — Connor |
| Seed term updates | DB seed | B — Connor |
| Taxonomy RPC / RLS changes | DB | B — Connor |
| Bio rewrites | Content | C — Jitesh |
| New term type / second link table / geo tree | DB | **Not planned** |

---

## Implementation notes for the next PR (do not start until approved)

Suggested first files, when Connor/Jitesh sign off Phase A:

- Create: `src/lib/location-regions.ts`, `src/lib/location-regions.test.ts`
- Modify: `src/lib/practitioners.ts`, `src/components/practitioners/practitioner-directory.tsx`, `src/components/practitioners/practitioner-profile.tsx`, `src/app/practitioners/locations/[slug]/page.tsx`, `src/app/practitioners/page.tsx`, `src/app/sitemap.ts`, `src/lib/practitioner-metadata.ts`, `src/components/admin/practitioner-editor.tsx`, `src/components/admin/practitioner-preview.tsx`
- Test: `src/lib/practitioners.test.ts`, `src/lib/practitioner-metadata.test.ts`, `tests/e2e/practitioners.spec.ts`

Do not open a migration PR from this plan.
