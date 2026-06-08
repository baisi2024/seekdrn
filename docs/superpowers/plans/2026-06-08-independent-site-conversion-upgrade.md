# SeekDrone Independent Site Conversion Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the independent SeekDrone site into a conversion-oriented B2B enterprise website that improves product selection, procurement confidence, lead capture, and multilingual UX.

**Architecture:** Keep the existing Next.js `/[locale]/...` routing and server-component data loading model. Add focused public-facing conversion components, upgrade existing public pages, and keep client components limited to interaction and form submission. Use a light B2B enterprise visual system as the primary style, with product-selection and proof/compliance templates applied by page purpose.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, next-intl, Supabase server reads through `supabaseAdmin`, existing shadcn/ui primitives, Vitest, ESLint, `npm run typecheck`, `npm run lint`, `npm run check:arch`.

---

## Confirmed Product and UX Direction

### Visual system

Use **SeekDrone B2B Enterprise Design System**:

- Primary theme: light enterprise website, not dark AI-tech.
- Base colors: warm white / light gray background, dark graphite text, one restrained deep green or deep blue accent, small engineering orange only for procurement/compliance emphasis.
- Imagery: real product, field, deployment, and case images whenever available. Do not use fake CSS drone silhouettes as final visual assets.
- Layout: large product/field visuals, clear mission entry points, proof-first case cards, practical procurement CTAs.
- Dark/defense styling: only as local accents for compliance, capability, or proof sections if needed. Do not make the whole site black.

### Page template strategy

Use one unified brand system with three content templates:

1. **Brand / Industry Template** for homepage and general entry pages.
2. **Product / Selection Template** for product listing and product detail pages.
3. **Proof / Compliance Template** for solutions, case studies, compliance, and procurement trust.

### Conversion strategy

Main conversion goals:

- Request quote
- Schedule demo
- Download datasheet or procurement pack
- Ask for compliance/procurement support
- Explore partnership/channel inquiry

Core events to track:

- `cta_click`
- `form_submit_start`
- `form_submit_success`
- `product_detail_view`
- `solution_detail_view`
- `case_detail_view`
- `datasheet_download`
- `filter_apply`
- `search_submit`
- `language_switch`

---

## File Structure

### Existing pages to modify

- `src/app/[locale]/page.tsx`
  - Recompose homepage into industry flagship conversion flow.
- `src/app/[locale]/products/page.tsx`
  - Add mission/application selection and stronger empty-state conversion.
- `src/app/[locale]/products/[model]/page.tsx`
  - Add procurement decision bar, procurement pack CTA, stronger related proof.
- `src/app/[locale]/solutions/[slug]/page.tsx`
  - Add mission workflow, recommended products, related cases, solution CTA.
- `src/app/[locale]/case-studies/page.tsx`
  - Add proof-first case list layout and filters if data supports it.
- `src/app/[locale]/case-studies/[slug]/page.tsx`
  - Move outcomes/results near top, add products used and similar-project CTA.
- `src/app/[locale]/compliance/page.tsx`
  - Add procurement support and compliance inquiry CTA.
- `src/app/[locale]/compliance/[slug]/page.tsx`
  - Add bottom compliance support CTA.

### Existing public components to modify

- `src/components/public/hero.tsx`
  - Convert from generic hero into light B2B enterprise hero.
- `src/components/public/product-card.tsx`
  - Upgrade to Product Decision Card.
- `src/components/public/case-card.tsx`
  - Upgrade to result-first case proof card.
- `src/components/public/demo-form.tsx`
  - Upgrade to multi-intent lead form.
- `src/components/public/cta-section.tsx`
  - Normalize CTA intent labels and design.
- `src/components/public/trust-bar.tsx`
  - Use proof strip style with real business signals.
- `src/components/public/dynamic-navbar-client.tsx`
  - Add mission-aware navigation and consistent design variables.
- `src/components/public/dynamic-footer.tsx`
  - Remove hardcoded English/gray styles, add conversion and trust links.
- `src/components/public/downloads-section.tsx`
  - Support procurement pack framing.
- `src/components/public/specs-section.tsx`
  - Favor grouped specs and hero specs over long row tables.
- `src/components/public/related-cases-section.tsx`
  - Use result-first related proof layout.

### New focused components to create

Create only if implementation cannot stay clean in existing files:

- `src/components/public/mission-selector.tsx`
  - Server-safe visual component with client interaction only if needed.
- `src/components/public/product-decision-card.tsx`
  - If replacing `product-card.tsx` directly becomes too risky, create this and migrate usage.
- `src/components/public/procurement-pack-cta.tsx`
  - Reusable datasheet/procurement support CTA.
- `src/components/public/procurement-decision-bar.tsx`
  - Product detail suitability and next-step strip.
- `src/components/public/mission-workflow.tsx`
  - Solution workflow display.
- `src/components/public/compliance-support-block.tsx`
  - Reusable compliance/procurement support block.
- `src/components/public/case-result-card.tsx`
  - If replacing `case-card.tsx` directly becomes too risky, create this and migrate usage.

### Tracking and translations

- `src/lib/gtm.ts`
  - Add unified event helpers if missing.
- `messages/{locale}/home.json`
- `messages/{locale}/products.json`
- `messages/{locale}/solutions.json`
- `messages/{locale}/case-studies.json`
- `messages/{locale}/compliance.json`
- `messages/{locale}/common.json`
- `messages/{locale}/footer.json`

Every new visible string must be present for all supported locales currently in `messages`.

---

## Task 1: Establish Design Tokens and Public Section Rules

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/components/public/hero.tsx`
- Modify: `src/components/public/cta-section.tsx`
- Modify: `src/components/public/trust-bar.tsx`

- [ ] **Step 1: Audit hardcoded public color usage**

Use Grep to locate hardcoded Tailwind public-site colors in `src/components/public` and `src/app/[locale]`:

```text
Pattern: bg-gray|text-gray|border-gray|bg-blue|text-blue|border-blue
Paths: src/components/public, src/app/[locale]
```

Expected: list of files using generic gray/blue utilities that must be converted to design-system tokens or carefully chosen semantic classes.

- [ ] **Step 2: Replace generic public-section styling with semantic theme classes**

Update changed sections to use existing semantic classes where possible:

```tsx
className="bg-background text-foreground"
className="text-muted-foreground"
className="border-border"
className="bg-muted"
className="text-primary"
```

For enterprise-specific surfaces, use restrained custom combinations directly in component classes only when they are part of the visual system:

```tsx
className="bg-[#f7f8f5] text-[#172025]"
className="border-[#dce3e6]"
className="text-[#285b4f]"
```

Do not reintroduce full-page black backgrounds or neon accents.

- [ ] **Step 3: Update hero structure**

Ensure `Hero` supports:

```text
- One clear B2B headline
- One short paragraph under 25 words
- Primary CTA: Request quote or Explore products
- Secondary CTA: View products or Download datasheet
- Real visual slot from existing hero config when available
- No decorative scroll cues
- No fake dashboard or fake CSS product UI
```

- [ ] **Step 4: Verify page still renders**

Run:

```bash
npm run typecheck
```

Expected: TypeScript passes or reports only pre-existing unrelated errors. Fix any new type errors introduced by this task.

---

## Task 2: Build Mission Selector for Product Discovery

**Files:**
- Create: `src/components/public/mission-selector.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `messages/{locale}/products.json`
- Modify: `messages/{locale}/home.json`

- [ ] **Step 1: Create a server-safe MissionSelector component**

Create `src/components/public/mission-selector.tsx`:

```tsx
import Link from 'next/link'

interface MissionOption {
  key: string
  title: string
  description: string
  href: string
}

interface MissionSelectorProps {
  title: string
  subtitle: string
  options: MissionOption[]
}

export function MissionSelector({ title, subtitle, options }: MissionSelectorProps) {
  return (
    <section className="bg-[#f7f8f5] py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#172025] lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#64727a] lg:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <Link
              key={option.key}
              href={option.href}
              className="group rounded-2xl border border-[#dce3e6] bg-white p-6 transition-colors hover:border-[#285b4f]"
            >
              <h3 className="text-lg font-semibold text-[#172025]">{option.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#64727a]">{option.description}</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-[#285b4f]">
                View recommended systems
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add mission selector translations**

Add translation keys to every `messages/{locale}/home.json` or `products.json`:

```json
{
  "missionSelector": {
    "title": "Choose by mission, not by model",
    "subtitle": "Start with your operational need and move directly to suitable platforms, cases, and procurement materials.",
    "viewRecommended": "View recommended systems",
    "missions": {
      "publicSafety": {
        "title": "Respond to public safety incidents",
        "description": "Rapid deployment systems for emergency response, patrol, and situational awareness."
      },
      "infrastructureInspection": {
        "title": "Inspect critical infrastructure",
        "description": "Platforms for power lines, pipelines, industrial sites, and long linear assets."
      },
      "mappingSurvey": {
        "title": "Map large terrain safely",
        "description": "Aerial data capture for surveying, environmental work, and remote-area mapping."
      },
      "perimeterSecurity": {
        "title": "Secure critical perimeters",
        "description": "Mission-ready systems for border, facility, and restricted-area monitoring."
      },
      "counterUas": {
        "title": "Detect unauthorized drones",
        "description": "Counter-UAS workflows for detection, response coordination, and site protection."
      },
      "disasterResponse": {
        "title": "Deploy after disasters",
        "description": "Portable aerial systems for search, assessment, logistics support, and emergency command."
      }
    }
  }
}
```

Use translated equivalents for non-English locales. Do not leave English strings in non-English files.

- [ ] **Step 3: Place MissionSelector on homepage**

In `src/app/[locale]/page.tsx`, insert the selector after `TrustBar` and before product sections.

Use links such as:

```tsx
href: `/${locale}/products?tags=public-safety`
href: `/${locale}/products?tags=inspection`
href: `/${locale}/solutions/public-safety`
```

Use existing tag/solution slugs if present. If exact slugs are unknown, prefer product query strings and keep links valid.

- [ ] **Step 4: Place MissionSelector on products page**

In `src/app/[locale]/products/page.tsx`, insert a compact selector between the page intro and `ProductSearch`.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 3: Upgrade Product Cards into Product Decision Cards

**Files:**
- Modify: `src/components/public/product-card.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `messages/{locale}/products.json`

- [ ] **Step 1: Read current product card**

Read `src/components/public/product-card.tsx` and identify available fields:

```text
model
slug
images
translations.name
translations.description
specs
spec_groups
tag_objects
category
```

- [ ] **Step 2: Update layout to decision-card format**

The final card must show:

```text
- Product image if available
- Model or product name
- One-line positioning text
- Up to 3 key specs
- Up to 3 mission/category tags
- View details CTA
- Download datasheet CTA when document data is available, otherwise omit
```

Use this structure:

```tsx
<article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-primary/40">
  <div className="aspect-[4/3] bg-muted">
    {/* product image */}
  </div>
  <div className="flex flex-1 flex-col p-5">
    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{model}</div>
    <h3 className="mt-2 text-lg font-semibold text-foreground">{name}</h3>
    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
    <dl className="mt-5 grid grid-cols-3 gap-2">
      {/* 3 key specs */}
    </dl>
    <div className="mt-5 flex flex-wrap gap-2">
      {/* tags */}
    </div>
    <div className="mt-auto flex items-center justify-between pt-6">
      {/* CTAs */}
    </div>
  </div>
</article>
```

- [ ] **Step 3: Keep server/client boundary clean**

Do not add `use client` unless required. The product card can stay a server component if it only renders links.

- [ ] **Step 4: Replace hardcoded empty English in product sections**

Remove hardcoded strings like:

```text
Featured products coming soon.
```

Replace with translation keys.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 4: Add Procurement Pack CTA

**Files:**
- Create: `src/components/public/procurement-pack-cta.tsx`
- Modify: `src/components/public/downloads-section.tsx`
- Modify: `src/app/[locale]/products/[model]/page.tsx`
- Modify: `messages/{locale}/products.json`
- Modify: `messages/{locale}/common.json`

- [ ] **Step 1: Create ProcurementPackCTA**

Create:

```tsx
import Link from 'next/link'

interface ProcurementPackCTAProps {
  locale: string
  title: string
  description: string
  items: string[]
  productSlug?: string
}

export function ProcurementPackCTA({ locale, title, description, items, productSlug }: ProcurementPackCTAProps) {
  const href = productSlug
    ? `/${locale}#demo-form?intent=procurement-pack&product=${productSlug}`
    : `/${locale}#demo-form?intent=procurement-pack`

  return (
    <section className="rounded-3xl border border-[#dce3e6] bg-[#f7f8f5] p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#172025] lg:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#64727a] lg:text-base">{description}</p>
        </div>
        <div className="rounded-2xl border border-[#dce3e6] bg-white p-5">
          <ul className="space-y-3 text-sm text-[#172025]">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#285b4f]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-6 inline-flex rounded-full bg-[#285b4f] px-5 py-3 text-sm font-semibold text-white"
          >
            Request procurement pack
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add translations**

Add keys:

```json
{
  "procurementPack": {
    "title": "Request a procurement-ready information pack",
    "description": "Get the materials your technical and procurement teams need to evaluate this platform.",
    "cta": "Request procurement pack",
    "items": {
      "datasheet": "Product datasheet",
      "compliance": "Compliance overview",
      "deployment": "Deployment checklist",
      "caseStudy": "Relevant case study"
    }
  }
}
```

- [ ] **Step 3: Insert into product detail page**

Add the CTA after downloads/specs and before related cases in `src/app/[locale]/products/[model]/page.tsx`.

- [ ] **Step 4: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 5: Add Product Detail Procurement Decision Bar

**Files:**
- Create: `src/components/public/procurement-decision-bar.tsx`
- Modify: `src/app/[locale]/products/[model]/page.tsx`
- Modify: `messages/{locale}/products.json`

- [ ] **Step 1: Create ProcurementDecisionBar**

Create a component with this API:

```tsx
interface ProcurementDecisionBarProps {
  locale: string
  productSlug: string
  bestFor: string[]
  nextSteps: {
    quote: string
    datasheet?: string
  }
}
```

Render:

```text
Is this platform suitable for your project?
Best for: up to 3 bullets
Next step: Request quote / Download datasheet
```

- [ ] **Step 2: Derive bestFor from existing product data**

In product detail page, derive `bestFor` from:

```text
product.tag_objects
product.category.translations
first three application specs if available
```

If insufficient data exists, show a translated generic list based on page context.

- [ ] **Step 3: Insert below product hero or key specs**

Place the bar early enough that procurement users see it before long specifications.

- [ ] **Step 4: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 6: Upgrade Demo Form into Multi-Intent Lead Form

**Files:**
- Modify: `src/components/public/demo-form.tsx`
- Modify: `src/app/api/demo-request/route.ts` if the API validates or stores only old fields
- Modify: `src/lib/gtm.ts`
- Modify: `messages/{locale}/common.json`

- [ ] **Step 1: Add intent to form schema**

Extend existing form data:

```ts
intent: z.enum([
  'quote',
  'demo',
  'datasheet',
  'compliance',
  'partnership',
])
```

Keep existing required fields:

```text
fullName
company
email
country
applicationInterest
```

- [ ] **Step 2: Add intent selector UI before contact fields**

Render intent choices as accessible buttons or radio cards:

```text
Request a quote
Schedule a demo
Download technical materials
Discuss compliance
Explore partnership
```

Use labels above inputs. Do not use placeholder-as-label.

- [ ] **Step 3: Update submission payload**

Submit:

```ts
{
  fullName,
  company,
  email,
  country,
  applicationInterest,
  intent,
}
```

- [ ] **Step 4: Update GTM tracking**

Add or reuse helpers in `src/lib/gtm.ts`:

```ts
trackFormSubmitStart({ formType: 'lead', intent, country, applicationInterest })
trackFormSubmitSuccess({ formType: 'lead', intent, complianceStatus })
```

- [ ] **Step 5: Replace hardcoded form copy**

Remove hardcoded English strings:

```text
Request a Demo
Fill out the form below and our team will get back to you within 24 hours.
Demo request submitted successfully!
```

Use `messages/{locale}/common.json` keys.

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm run check:arch
```

Expected: client component does not import `supabaseAdmin`; architecture check passes.

---

## Task 7: Upgrade Solutions Pages into Mission Workflow Pages

**Files:**
- Create: `src/components/public/mission-workflow.tsx`
- Modify: `src/app/[locale]/solutions/[slug]/page.tsx`
- Modify: `src/components/public/solutions-grid.tsx`
- Modify: `messages/{locale}/solutions.json`

- [ ] **Step 1: Create MissionWorkflow**

Create a component that accepts:

```tsx
interface MissionWorkflowProps {
  title: string
  steps: Array<{
    title: string
    description: string
  }>
}
```

Render as a horizontal workflow on desktop and vertical stack on mobile.

- [ ] **Step 2: Convert existing workflow HTML into workflow display**

If `solution.translations.workflow` is currently rich HTML, keep rendering it but wrap it in the new layout area. Do not invent workflow steps if structured data does not exist.

- [ ] **Step 3: Add recommended products section**

Use available product relationships if present. If no relationship exists, query published products by matching tags/category only if existing schema supports it. Do not add database fields in this task.

- [ ] **Step 4: Add related cases section**

Query case studies by industry or solution slug if existing data supports it. Otherwise show a CTA to case studies page.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm run check:arch
```

Expected: solution page remains a server component with `supabaseAdmin` only on server.

---

## Task 8: Upgrade Case Cards and Case Pages into Proof-First Layout

**Files:**
- Modify: `src/components/public/case-card.tsx`
- Modify: `src/app/[locale]/case-studies/page.tsx`
- Modify: `src/app/[locale]/case-studies/[slug]/page.tsx`
- Modify: `messages/{locale}/case-studies.json`

- [ ] **Step 1: Update CaseCard to result-first format**

Render:

```text
Primary metric value if available
Metric label
Case title
Industry / country
Short challenge or description
Read case CTA
```

If no metrics exist, fall back to image/video and title. Do not invent fake metrics.

- [ ] **Step 2: Add case list intro focused on proof**

Update `case-studies/page.tsx` intro to say the page shows deployment outcomes and field evidence, using translations.

- [ ] **Step 3: Move key results near top on case detail**

In `case-studies/[slug]/page.tsx`, render metrics directly below hero content.

- [ ] **Step 4: Add similar-project CTA**

At bottom of case detail, add CTA:

```text
Planning a similar project?
Talk to our team about platform selection, deployment requirements, and procurement materials.
```

Use translations and link to `/${locale}#demo-form?intent=quote`.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 9: Add Compliance and Procurement Support Blocks

**Files:**
- Create: `src/components/public/compliance-support-block.tsx`
- Modify: `src/app/[locale]/compliance/page.tsx`
- Modify: `src/app/[locale]/compliance/[slug]/page.tsx`
- Modify: `messages/{locale}/compliance.json`

- [ ] **Step 1: Create ComplianceSupportBlock**

Create reusable block with:

```text
Title
Short procurement-risk description
Four support points:
- Export documentation
- Regional availability
- Technical compliance materials
- Enterprise procurement workflow
CTA: Talk to compliance team
```

- [ ] **Step 2: Add block to compliance index page**

Place after policy cards or before final CTA.

- [ ] **Step 3: Add compact block to compliance detail pages**

Place at bottom of detail pages.

- [ ] **Step 4: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 10: Upgrade Navigation and Footer for B2B Conversion

**Files:**
- Modify: `src/components/public/dynamic-navbar-client.tsx`
- Modify: `src/components/public/nav-dropdown.tsx`
- Modify: `src/components/public/dynamic-footer.tsx`
- Modify: `messages/{locale}/common.json`
- Modify: `messages/{locale}/footer.json`

- [ ] **Step 1: Audit current nav labels and dropdown structure**

Read navbar components and identify existing data-driven nav behavior. Preserve existing dynamic navigation features unless they block conversion UX.

- [ ] **Step 2: Add mission-aware mega menu structure if current nav supports dropdown content**

Recommended structure:

```text
Products
  By Platform
  By Mission
  Resources
```

Do not break existing admin-configured navigation. If nav is fully data-driven, add mission links as a safe static supplement only where appropriate.

- [ ] **Step 3: Normalize navbar CTA**

Use one primary CTA label consistently:

```text
Request quote
```

Secondary paths can be:

```text
Products
Case studies
Compliance
```

- [ ] **Step 4: Upgrade footer**

Footer should include:

```text
Products
Solutions
Case studies
Compliance
Datasheets / Procurement pack
Contact / Request quote
```

Remove hardcoded English and hardcoded gray styles.

- [ ] **Step 5: Verify desktop nav single-line**

Check visually or with browser preview. Desktop nav must not wrap into two rows.

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm run check:arch
```

Expected: no new errors.

---

## Task 11: Add Unified GTM Event Helpers

**Files:**
- Modify: `src/lib/gtm.ts`
- Modify: CTA/link components where events are emitted
- Modify: `src/components/public/datasheet-download-button.tsx`
- Modify: `src/components/public/demo-form.tsx`

- [ ] **Step 1: Inspect existing GTM helpers**

Read `src/lib/gtm.ts` and list existing event helper names.

- [ ] **Step 2: Add missing event helpers without breaking existing names**

Add helpers for:

```ts
trackCtaClick
trackFormSubmitStart
trackFormSubmitSuccess
trackDatasheetDownload
trackProductDetailView
trackSolutionDetailView
trackCaseDetailView
trackFilterApply
trackSearchSubmit
```

Each helper should push to `window.dataLayer` only when running in the browser.

- [ ] **Step 3: Wire datasheet download event**

Update `datasheet-download-button.tsx` to send:

```ts
{
  page_type: 'product_detail',
  locale,
  product_slug,
  location: 'downloads_section'
}
```

- [ ] **Step 4: Wire form events**

Update `demo-form.tsx` to send intent and form type.

- [ ] **Step 5: Verify**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: no new errors.

---

## Task 12: Multilingual Copy Completion

**Files:**
- Modify: all affected `messages/{locale}/*.json`

- [ ] **Step 1: List all added keys**

Collect new keys from:

```text
home.missionSelector
products.procurementPack
products.decisionBar
common.leadForm
case-studies.similarProjectCta
compliance.supportBlock
footer.procurementLinks
```

- [ ] **Step 2: Ensure every locale has every key**

Locales currently present include:

```text
zh, en, ar, es, fr, id, pt, fa, ru, th, vi
```

Add all keys to all locale files.

- [ ] **Step 3: Avoid mixed-language fallback**

Do not leave English values inside non-English locale files unless the product/brand term is intentionally English.

- [ ] **Step 4: Verify JSON validity**

Run:

```bash
npm run typecheck
```

Expected: JSON imports and next-intl usage do not introduce type or runtime errors.

---

## Task 13: Final Verification and Acceptance

**Files:**
- No new files unless fixing discovered issues.

- [ ] **Step 1: Run architecture check**

```bash
npm run check:arch
```

Expected: no client component imports `supabaseAdmin`.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: pass.

- [ ] **Step 4: Run tests**

```bash
npm run test:run
```

Expected: pass, or document pre-existing failures clearly.

- [ ] **Step 5: Run production build**

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 6: Manual UX acceptance checklist**

Check these pages in at least `en`, `zh`, and one RTL locale such as `ar` or `fa`:

```text
/{locale}
/{locale}/products
/{locale}/products/{model}
/{locale}/solutions/{slug}
/{locale}/case-studies
/{locale}/case-studies/{slug}
/{locale}/compliance
```

Acceptance criteria:

```text
- Site uses light B2B enterprise visual direction, not black AI-tech style.
- Homepage guides users from trust to mission selection to products/cases to lead form.
- Products can be explored by mission, category, tags, and search.
- Product cards support quick comparison.
- Product detail has procurement decision and procurement pack CTA.
- Solution detail links to products/cases or provides a clear consultation path.
- Case pages show outcomes early.
- Compliance pages reduce procurement risk and provide inquiry CTA.
- Form supports quote, demo, datasheet, compliance, and partnership intent.
- All new visible strings are translated.
- RTL layout does not break.
- Desktop nav stays on one line.
- Mobile has clear CTAs and no broken card overflow.
```

---

## Self-Review

### Spec coverage

Covered:

- Full-site conversion funnel.
- UI/UX visual direction correction from dark AI-tech to light B2B enterprise.
- Homepage, product list, product detail, solution detail, case pages, compliance pages, navigation, footer, form, GTM, translations.
- Component innovation: MissionSelector, Product Decision Card, Procurement Pack CTA, Multi-Intent Lead Form, Case Result Card, Procurement Decision Bar, Mission Workflow, Compliance Support Block.

### Placeholder scan

No implementation task uses `TBD`, `TODO`, or unspecified “do something appropriate” steps. Tasks define concrete component APIs, page locations, commands, and expected outcomes.

### Type and boundary consistency

- New interactive behavior is limited to client components such as `demo-form.tsx`.
- Server pages may continue using `supabaseAdmin`.
- Public visual components remain server-safe unless interaction requires `use client`.
- Verification includes `npm run check:arch`.
