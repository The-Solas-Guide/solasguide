import Image from "next/image";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { DesignSystemToolbar } from "@/components/theme-switcher";
import {
  AuthorityCard,
  BrandMark,
  BrandWordmark,
  CategoryCard,
  CategoryCompactCard,
  CategoryImageTile,
  CategoryLinkRow,
  Breadcrumbs,
  CuratorsNote,
  CopywritingGuide,
  DiscoveryControls,
  DisclosurePanel,
  EditorialIntro,
  EmptyState,
  EnquiryCta,
  EnquiryDialogExample,
  FactPanel,
  FaqList,
  FilterPillGroup,
  FormChoiceCard,
  FormFeedback,
  FormProgress,
  JourneyEntryCards,
  LandingPageHeader,
  LoadingCardGrid,
  MobileFilterSheetExample,
  Pagination,
  PractitionerListItem,
  PractitionerTeaserCard,
  SiteFooter,
  SiteHeader,
} from "@/components/component-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const PALETTE_TOKENS = [
  { name: "Background", className: "bg-background border border-border" },
  { name: "Foreground / Ink", className: "bg-foreground" },
  { name: "Card", className: "bg-card border border-border" },
  { name: "Muted", className: "bg-muted" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Accent", className: "bg-accent" },
  { name: "Accent 2", className: "bg-accent-2" },
  { name: "Border", className: "bg-border" },
];

const MODALITIES = [
  "Yoga",
  "Breathwork",
  "Reiki",
  "Hypnotherapy",
  "Somatic Healing",
  "Balinese Traditional Healing",
  "Sound Healing",
  "Meditation",
  "Ayurveda",
];

const IMAGERY_OPTIONS = [
  {
    src: "/images/solas-imagery/exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png",
    label: "Architecture / jungle",
    note: "A full-bleed hero direction: built form, canopy, and quiet human scale.",
  },
  {
    src: "/images/solas-imagery/exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png",
    label: "River / landscape",
    note: "Place-led imagery that establishes atmosphere before introducing a practitioner.",
  },
  {
    src: "/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png",
    label: "Material / detail",
    note: "A quieter supporting image for texture, transitions, and editorial pacing.",
  },
  {
    src: "/images/solas-imagery/exec-1a024f1b-c6c7-425a-b1b7-9585f6e9f3a4.png",
    label: "Practitioner / candid",
    note: "Human credibility without the posed wellness portrait convention.",
  },
  {
    src: "/images/solas-imagery/exec-8569d3fe-e8c5-4810-98b5-228930e042e1.png",
    label: "Venue / lived-in space",
    note: "A venue profile image that shows the relationship between place and practice.",
  },
];

function SectionHeading({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {index}
      </p>
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        {note}
      </p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="flex flex-col">
      {/* Intro */}
      <section className="relative flex min-h-[78svh] w-full items-end overflow-hidden bg-foreground px-6 py-16 text-white md:min-h-[88svh] md:px-12 md:py-20 lg:px-[8vw]">
        <Image
          src="/images/solas-imagery/exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"
          alt="Architecture set within a tropical landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,10,0.08)_15%,rgba(8,13,10,0.72)_100%)]" />
        <div className="relative z-10 max-w-5xl">
          <h1 className="font-display max-w-4xl text-5xl leading-[0.98] text-white md:text-7xl lg:text-8xl">
            The Solas Guide - Design System
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            A clear visual language for a trusted guide to practitioners,
            places, and restorative experiences.
          </p>
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
        <DesignSystemToolbar />
        <div className="min-w-0">

      <section id="principles" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="01 — Principles" title="The Brand Idea" note="Three principles shape a visual identity that feels trusted, distinctive, and grounded in the world The Solas Guide inhabits." />
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {[{ n: "01", title: "Quiet authority", text: "Confidence through restraint, structure, and evidence—not luxury signals or promotional volume." }, { n: "02", title: "Specific over spiritual", text: "Names, years, places, teachers, and credentials replace vague promises of transformation." }, { n: "03", title: "Editorial hospitality", text: "Warm enough to invite exploration; rigorous enough to stand on its own." }].map((item) => <article key={item.n} className="bg-background p-7 md:p-9"><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Principle {item.n}</p><h3 className="mt-8 font-display text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p></article>)}
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="comparison" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="02 — Palette options" title="Palette Options" note="Three visual registers explore different expressions of the same calm, editorial foundation." />
        <div className="grid gap-4 lg:grid-cols-3">
          {[{ id: "aman", name: "Aman", note: "Quiet minimal", bg: "#f7f4ee", ink: "#1c1a17", accent: "#2e4238" }, { id: "bambu", name: "Bambu", note: "Earth & material", bg: "#f1ebe0", ink: "#221c14", accent: "#a8562f" }, { id: "chanel", name: "Chanel", note: "Editorial contrast", bg: "#ffffff", ink: "#0a0a0a", accent: "#8c6f3f" }].map((theme) => <article key={theme.id} className="border p-6" style={{ background: theme.bg, color: theme.ink, borderColor: `${theme.ink}22` }}><div className="mb-16 flex justify-between text-[10px] uppercase tracking-[0.18em]"><span>{theme.name}</span><span style={{ color: theme.accent }}>{theme.note}</span></div><h3 className="font-display text-3xl leading-tight">The standard was earned.</h3><p className="mt-4 text-sm leading-relaxed opacity-65">An independent register of practitioners and places.</p><button type="button" className="mt-8 px-4 py-2 text-xs" style={{ background: theme.ink, color: theme.bg }}>View the register</button><div className="mt-8 flex h-2"><span className="flex-1" style={{ background: theme.ink }} /><span className="flex-1" style={{ background: theme.accent }} /><span className="flex-1" style={{ background: `${theme.ink}22` }} /></div></article>)}
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6">
        <Separator />
      </div>

      {/* 01 — Colour */}
      <section id="colour" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="03 — Colour"
          title="The palette"
          note="Semantic tokens, not hex values. Every component consumes these variables, so a single switch re-tones the entire system."
        />
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
          {PALETTE_TOKENS.map((token) => (
            <div key={token.name} className="flex flex-col bg-background">
              <div className={`h-28 ${token.className}`} />
              <p className="px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                {token.name}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Accessible contrast pairs</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-foreground p-5 text-background"><p className="text-sm">Ink / background</p><p className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-65">Primary reading</p></div>
            <div className="bg-background p-5 text-foreground ring-1 ring-border"><p className="text-sm">Background / ink</p><p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Reversed reading</p></div>
            <div className="bg-accent p-5 text-accent-foreground"><p className="text-sm">Accent pair</p><p className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-70">Actions and focus</p></div>
            <div className="bg-destructive/10 p-5 text-destructive ring-1 ring-destructive/30"><p className="text-sm">Destructive pair</p><p className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-70">Errors only</p></div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6">
        <Separator />
      </div>

      {/* 02 — Typography */}
      <section id="typography" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="04 — Typography"
          title="Type scale"
          note="A transitional serif for display, a quiet grotesque for body and labels. Letterspaced uppercase is used sparingly — for navigation, labels, and credentials."
        />
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Display / Fraunces
            </p>
            <p className="font-display text-5xl leading-[1.05] md:text-7xl">
              The standard was earned, not claimed.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Heading
            </p>
            <p className="font-display text-3xl md:text-4xl">
              Fourteen years of active practice
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Label / Navigation
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.25em]">
              The Register · Venues · Events · Plan a Retreat
            </p>
          </div>
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Body / Inter
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Each profile is written by the Solas Guide editorial team from a
              structured interview. Practitioners verify facts only. Credential
              numbers are published openly, because authority that cannot be
              checked is not authority.
            </p>
          </div>
          <div className="border-l-2 border-accent pl-8">
            <p className="font-display text-2xl leading-snug italic md:text-3xl">
              “The site needs to feel like it has existed for twenty years.”
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              From the design brief
            </p>
          </div>
          <AuthorityCard eyebrow="Interview extract · 04" title="“The work begins with listening.”" description="Made Wirawan · Payangan" variant="quote" className="max-w-2xl" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6">
        <Separator />
      </div>

      <section id="identity" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="05 — Identity" title="Logo and marks" note="A provisional asset family for consistent use while the final identity is developed. These examples establish format and behaviour, not a finished logo design." />

        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Primary wordmark</p>
          <div className="grid border border-border md:grid-cols-2">
            <BrandWordmark className="min-h-64" caption="Primary · dark on light" />
            <BrandWordmark className="min-h-64" reversed caption="Reversed · light on dark" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Compact and digital marks</p>
            <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
              <div className="flex min-h-52 flex-col items-center justify-center gap-5 bg-card p-6 text-center"><BrandMark format="social" size="lg" /><div><p className="text-xs font-medium">Social avatar</p><p className="mt-1 text-[10px] text-muted-foreground">Facebook and profile use</p></div></div>
              <div className="flex min-h-52 flex-col items-center justify-center gap-5 bg-card p-6 text-center"><BrandMark format="square" size="lg" className="rounded-none" /><div><p className="text-xs font-medium">App / saved link</p><p className="mt-1 text-[10px] text-muted-foreground">Square digital mark</p></div></div>
              <div className="flex min-h-52 flex-col items-center justify-center gap-5 bg-card p-6 text-center"><div className="flex items-end gap-3"><BrandMark format="favicon" size="md" /><BrandMark format="favicon" size="sm" /></div><div><p className="text-xs font-medium">Favicons</p><p className="mt-1 text-[10px] text-muted-foreground">32px and 16px</p></div></div>
            </div>
          </div>
          <div className="border border-border p-7"><p className="text-xs font-medium uppercase tracking-[0.18em]">Usage guidance</p><ul className="mt-6 grid gap-4 text-sm leading-relaxed text-muted-foreground"><li>Primary and reversed versions</li><li>Compact mark remains legible at 16px</li><li>Clear space equals the cap height</li><li>Single-colour reproduction only</li><li>No wellness symbols or decorative crests</li><li>Placeholder marks must be replaced as one coordinated asset set</li></ul></div>
        </div>
        <AuthorityCard eyebrow="The Solas Guide standard" title="Independently reviewed" description="Provisional verification language and marker placement. Use sparingly and only where the editorial standard has genuinely been applied." className="max-w-xl" />
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      {/* 03 — Pacing */}
      <section id="layout" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="06 — Layout"
          title="Pacing and composition"
          note="The reference register slows the reader down deliberately. Sections breathe; content follows a measured grid and imagery is given room to lead."
        />
        <div className="grid grid-cols-4 gap-2 md:grid-cols-12">{Array.from({ length: 12 }).map((_, index) => <div key={index} className={cnGrid(index)}><span className="text-[9px] text-muted-foreground">{index + 1}</span></div>)}</div>
        <div className="flex flex-col gap-px border border-border bg-border">
          <div className="flex h-16 items-center justify-center bg-muted/50">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Section padding — 80px
            </p>
          </div>
          <div className="bg-card px-8 py-24 md:px-16">
            <p className="font-display max-w-md text-2xl leading-snug md:text-3xl">
              Content sits inside generous margins, never edge to edge.
            </p>
          </div>
          <div className="flex h-16 items-center justify-center bg-muted/50">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Section padding — 80px
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6">
        <Separator />
      </div>

      <section id="buttons" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="07 — Buttons"
          title="Actions"
          note="One quiet primary action, an outline for secondary actions, and text treatments for lower-emphasis navigation."
        />

        <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Primary", note: "One principal action", button: <Button>Plan a Retreat</Button> },
            { label: "Secondary", note: "Related alternative", button: <Button variant="secondary">Save for later</Button> },
            { label: "Outline", note: "Lower commitment", button: <Button variant="outline">View Profile</Button> },
            { label: "Ghost", note: "Quiet navigation", button: <Button variant="ghost">Read the Standard</Button> },
            { label: "Text link", note: "Inline continuation", button: <Button variant="link">Enquire discreetly</Button> },
          ].map((item) => <div key={item.label} className="flex min-h-44 flex-col justify-between bg-background p-5"><div><p className="text-xs font-medium">{item.label}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.note}</p></div><div className="mt-8">{item.button}</div></div>)}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Sizes</p><div className="flex min-h-28 flex-wrap items-center gap-4 border border-border p-5"><Button size="sm">Small</Button><Button>Default</Button><Button size="lg" className="h-12 px-7">Large</Button></div></div>
          <div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Icons and progress</p><div className="flex min-h-28 flex-wrap items-center gap-4 border border-border p-5"><Button>Continue<ArrowRight data-icon="inline-end" /></Button><Button variant="outline"><ArrowRight className="rotate-180" data-icon="inline-start" />Back</Button><Button disabled><LoaderCircle className="animate-spin" data-icon="inline-start" />Loading</Button></div></div>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="flex min-h-36 items-center justify-center border border-border bg-background p-6"><Button>On light</Button></div>
          <div className="flex min-h-36 items-center justify-center bg-foreground p-6"><Button variant="outline" className="border-background/40 bg-transparent text-background hover:bg-background hover:text-foreground">On dark</Button></div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="lists" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="08 — Lists" title="Editorial lists" note="Structured rows support comparison and scanning while retaining a calm editorial rhythm." />

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Practitioner list — compact editorial alternative
          </p>
          <div className="border-b border-border">
            <PractitionerListItem index="01" name="Elena Marchetti" location="London · Bali" modality="Somatic therapy" descriptor="A body-led practice grounded in clinical training and long-term client work." experience="14 years active practice" imageSrc="/images/solas-imagery/practitioner-elena.png" imageAlt="Elena Marchetti in a natural-light timber practice room" />
            <PractitionerListItem index="02" name="Made Wirawan" location="Ubud · Bali" modality="Balinese traditional healing" descriptor="Practises Usada Bali in a family lineage taught by his grandfather in Payangan." experience="22 years active practice" imageSrc="/images/solas-imagery/practitioner-made.png" imageAlt="Made Wirawan seated in an open-air pavilion surrounded by greenery" />
            <PractitionerListItem index="03" name="Sofia Lindqvist" location="Stockholm · Bali" modality="Breathwork" descriptor="Facilitates small, focused sessions with an emphasis on integration and safety." experience="9 years active practice" imageSrc="/images/solas-imagery/practitioner-sofia.png" imageAlt="Sofia Lindqvist walking beside a shaded retreat building" />
            <PractitionerListItem index="04" name="Amara Hart" location="Sydney · Bali" modality="Couples facilitation" descriptor="Creates space for conversation, repair, and more honest connection." experience="11 years active practice" imageSrc="/images/solas-imagery/practitioner-couples.png" imageAlt="Amara Hart seated beside an open window overlooking tropical greenery" />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="filters" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="09 — Search & filters" title="Discovery controls" note="Search and filter controls help people narrow a curated set without making the experience feel like an unrestricted marketplace." />

        <DiscoveryControls modalities={MODALITIES} locations={["Bali", "London", "Stockholm", "Sydney"]} resultCount={18} />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="border border-border p-6"><p className="text-xs font-medium uppercase tracking-[0.15em]">No results</p><p className="mt-4 font-display text-2xl">No exact matches</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Remove one filter or share what you are looking for with The Solas Guide.</p><Button variant="outline" className="mt-6">Clear filters</Button></div>
          <div className="border border-border p-6"><p className="text-xs font-medium uppercase tracking-[0.15em]">Mobile behaviour</p><p className="mt-4 font-display text-2xl">Filters move into a sheet</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Search remains visible. Secondary controls collapse behind one clear filter action and return a selected-filter summary.</p></div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="cards" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="10 — Cards" title="Cards and navigation" note="Reusable card families introduce practitioners and practices with enough context to support a clear next step." />

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Practitioner teaser — curated, not publicly browsable
          </p>
          <div className="-mx-6 grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(17rem,1fr)] gap-6 overflow-x-auto px-6 pb-4 lg:mx-0 lg:px-0">
            <PractitionerTeaserCard name="Elena Marchetti" location="London · Bali" modality="Somatic therapy" descriptor="A body-led practice grounded in clinical training and long-term client work." experience="14 years active practice" imageSrc="/images/solas-imagery/practitioner-elena.png" imageAlt="Elena Marchetti in a natural-light timber practice room" />
            <PractitionerTeaserCard name="Made Wirawan" location="Ubud · Bali" modality="Balinese traditional healing" descriptor="Practises Usada Bali in a family lineage taught by his grandfather in Payangan." experience="22 years active practice" imageSrc="/images/solas-imagery/practitioner-made.png" imageAlt="Made Wirawan seated in an open-air pavilion surrounded by greenery" />
            <PractitionerTeaserCard name="Sofia Lindqvist" location="Stockholm · Bali" modality="Breathwork" descriptor="Facilitates small, focused sessions with an emphasis on integration and safety." experience="9 years active practice" imageSrc="/images/solas-imagery/practitioner-sofia.png" imageAlt="Sofia Lindqvist walking beside a shaded retreat building" />
            <PractitionerTeaserCard name="Amara Hart" location="Sydney · Bali" modality="Couples facilitation" descriptor="Creates space for conversation, repair, and more honest connection." experience="11 years active practice" imageSrc="/images/solas-imagery/practitioner-couples.png" imageAlt="Amara Hart seated beside an open window overlooking tropical greenery" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Trust and editorial context</p>
          <AuthorityCard eyebrow="Credential verified" title="14 years active practice" description="Accreditation, lineage, and evidence remain visible—not hidden in marketing copy." className="max-w-md" />
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Category card — context before conversion</p>
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryCard index="01" title="Somatic healing" description="Body-led approaches that work with sensation, regulation, and the relationship between physical and emotional experience." imageSrc="/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png" imageAlt="Natural materials and a quiet interior detail" enquiryHref="#decision" />
            <CategoryCard index="02" title="Balinese traditional healing" description="Place-rooted practices shaped by lineage, community, and traditions that require careful context rather than broad wellness labels." imageSrc="/images/solas-imagery/exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png" imageAlt="River landscape in Bali" enquiryHref="#decision" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Category navigation — image tiles</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryImageTile index="01" title="Somatic healing" href="#decision" imageSrc="/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png" imageAlt="Natural materials in a quiet retreat interior" />
            <CategoryImageTile index="02" title="Balinese traditional healing" href="#decision" imageSrc="/images/solas-imagery/exec-1a024f1b-c6c7-425a-b1b7-9585f6e9f3a4.png" imageAlt="Practitioner working in a natural setting" />
            <CategoryImageTile index="03" title="Breathwork" href="#decision" imageSrc="/images/solas-imagery/exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png" imageAlt="River and tropical landscape" className="sm:col-span-2 lg:col-span-1" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Category navigation — compact cards</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryCompactCard index="01" title="Somatic healing" description="Body-led practices and nervous-system support." href="#decision" />
            <CategoryCompactCard index="02" title="Breathwork" description="Facilitated practices grounded in safety and integration." href="#decision" />
            <CategoryCompactCard index="03" title="Meditation" description="Private and small-group contemplative practice." href="#decision" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Category navigation — stacked links</p>
          <div className="border-b border-border">
            <CategoryLinkRow index="01" title="Somatic healing" description="Body-led approaches to sensation, regulation, and emotional experience." href="#decision" />
            <CategoryLinkRow index="02" title="Balinese traditional healing" description="Place-rooted practices shaped by lineage, community, and tradition." href="#decision" />
            <CategoryLinkRow index="03" title="Breathwork" description="Facilitated sessions with an emphasis on preparation and integration." href="#decision" />
            <CategoryLinkRow index="04" title="Meditation" description="Contemplative practices for individuals and small groups." href="#decision" />
          </div>
        </div>

      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="forms" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-14 px-6 py-20 md:py-28">
        <SectionHeading index="11 — Forms" title="Forms and Enquiries" note="A calm, guided conversation that gathers enough context for a useful next step." />

        <FormProgress title="Tell us what you are looking for" steps={["Your needs", "Details", "Review"]} />

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Guided choice cards</p>
          <fieldset><legend className="mb-5 font-display text-2xl">What kind of support are you looking for?</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><FormChoiceCard label="Personal practice" description="One-to-one guidance or an individual experience." selected /><FormChoiceCard label="Group or retreat" description="Support for a private group, team, or retreat." /><FormChoiceCard label="Not sure yet" description="Share the context and let The Solas Guide suggest the next step." /></div></fieldset>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Field system</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="form-name">Full name</Label><Input id="form-name" placeholder="Your name" /><p className="text-xs text-muted-foreground">As you would like us to address you.</p></div>
            <div className="grid gap-2"><Label htmlFor="form-email">Email address</Label><Input id="form-email" type="email" placeholder="you@example.com" /></div>
            <div className="grid gap-2"><Label>Primary interest</Label><Select><SelectTrigger className="w-full"><SelectValue placeholder="Select a practice" /></SelectTrigger><SelectContent><SelectGroup>{MODALITIES.slice(0, 5).map((m) => <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
            <div className="grid gap-2"><Label htmlFor="form-timing">Preferred timing</Label><Input id="form-timing" placeholder="For example, October 2026" /></div>
            <div className="grid gap-2 md:col-span-2"><Label htmlFor="form-context">What would be helpful for us to understand?</Label><Textarea id="form-context" placeholder="Share as much or as little context as feels useful." /><p className="text-xs text-muted-foreground">Avoid sharing sensitive medical information through this form.</p></div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormFeedback tone="error" title="Please enter a valid email address." description="Errors sit beside the field and explain how to continue." />
          <FormFeedback tone="success" title="Thank you. Your enquiry has been received." description="The Solas Guide will review the details and follow up with a clear next step." />
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="states" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="12 — States" title="Interaction and access" note="A cross-component reference for focus, selection, progress, validation, and unavailable actions." />
        <div className="overflow-x-auto border border-border">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[8rem_repeat(5,minmax(7rem,1fr))] border-b border-border bg-muted/50 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"><div className="p-4">Component</div>{["Default", "Hover / focus", "Selected", "Disabled", "Loading / error"].map((state) => <div key={state} className="border-l border-border p-4">{state}</div>)}</div>
            <div className="grid grid-cols-[8rem_repeat(5,minmax(7rem,1fr))] items-center border-b border-border"><p className="p-4 text-xs font-medium">Button</p><div className="border-l border-border p-4"><Button size="sm">Default</Button></div><div className="border-l border-border p-4"><Button size="sm" className="ring-3 ring-ring/50">Focused</Button></div><div className="border-l border-border p-4"><Button size="sm" aria-pressed>Pressed</Button></div><div className="border-l border-border p-4"><Button size="sm" disabled>Disabled</Button></div><div className="border-l border-border p-4"><Button size="sm" disabled><LoaderCircle className="animate-spin" />Loading</Button></div></div>
            <div className="grid grid-cols-[8rem_repeat(5,minmax(7rem,1fr))] items-center border-b border-border"><p className="p-4 text-xs font-medium">Field</p><div className="border-l border-border p-4"><Input placeholder="Name" /></div><div className="border-l border-border p-4"><Input placeholder="Focused" className="border-ring ring-3 ring-ring/50" /></div><div className="border-l border-border p-4"><Input defaultValue="Bali" /></div><div className="border-l border-border p-4"><Input disabled placeholder="Unavailable" /></div><div className="border-l border-border p-4"><Input aria-invalid defaultValue="Invalid value" /></div></div>
            <div className="grid grid-cols-[8rem_repeat(5,minmax(7rem,1fr))] items-center border-b border-border"><p className="p-4 text-xs font-medium">Filter</p><div className="border-l border-border p-4"><FilterPillGroup items={["Yoga"]} /></div><div className="border-l border-border p-4"><span className="rounded-full border border-foreground px-3 py-2 text-xs">Hovered</span></div><div className="border-l border-border p-4"><FilterPillGroup items={["Yoga"]} activeItems={["Yoga"]} /></div><div className="border-l border-border p-4"><span className="rounded-full border border-border px-3 py-2 text-xs opacity-40">Disabled</span></div><div className="border-l border-border p-4"><span className="text-xs text-muted-foreground">No match</span></div></div>
            <div className="grid grid-cols-[8rem_repeat(5,minmax(7rem,1fr))] items-stretch"><p className="p-4 text-xs font-medium">Card</p><div className="border-l border-border p-4"><div className="h-16 border border-border bg-card" /></div><div className="border-l border-border p-4"><div className="h-16 border border-foreground bg-card" /></div><div className="border-l border-border p-4"><div className="h-16 border-2 border-accent bg-accent/5" /></div><div className="border-l border-border p-4"><div className="h-16 border border-border bg-muted opacity-45" /></div><div className="border-l border-border p-4"><div className="h-16 animate-pulse bg-muted" /></div></div>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3"><div className="border border-border p-5"><p className="text-xs font-medium">Keyboard focus</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">A visible ring is required wherever an action can receive keyboard focus.</p></div><div className="border border-border p-5"><p className="text-xs font-medium">Motion and loading</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Keep layout stable while progress is shown. Respect reduced-motion preferences.</p></div><div className="border border-border p-5"><p className="text-xs font-medium">Errors</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Use colour, text, and placement together—never colour alone.</p></div></div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="navigation" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="13 — Navigation" title="Moving through the guide" note="Shared navigation for the four MVP landing-page journeys, detail pages, and multi-step forms." />
        <div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Primary header</p><SiteHeader /></div>
        <div className="grid gap-8 md:grid-cols-2"><div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Breadcrumbs</p><div className="border border-border p-6"><Breadcrumbs items={[{ label: "The Guide", href: "#" }, { label: "Practitioners", href: "#" }, { label: "Elena Marchetti" }]} /></div></div><div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Pagination</p><Pagination current={2} total={4} /></div></div>
        <div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Footer</p><SiteFooter /></div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="page-headers" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="14 — Page headers" title="MVP landing-page openings" note="A shared header system with content tailored to each primary discovery or application journey." />
        <div className="flex flex-col gap-8">
          <div><p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Find a practitioner · Image-led</p><LandingPageHeader eyebrow="The practitioner register" title="Find the right person, carefully." description="Explore independently reviewed practitioners through their experience, lineage, approach, and place—not promotional claims." actionLabel="Explore practitioners" variant="image" imageSrc="/images/solas-imagery/practitioner-elena.png" imageAlt="A practitioner in a naturally lit timber space" /></div>
          <div className="flex flex-col gap-6"><div><p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Find a venue · Split editorial</p><LandingPageHeader eyebrow="Places" title="Spaces with a reason to be here." description="A guide to venues shaped by landscape, material, hospitality, and the practices they hold." actionLabel="Explore venues" variant="split" /></div><div><p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Events & Workshops · Calendar statement</p><LandingPageHeader eyebrow="The programme · 2026" title="Time set aside with purpose." description="Discover workshops, gatherings, and limited programmes with enough context to decide whether they belong in your plans." actionLabel="View events" variant="centered" /></div></div>
          <div><p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Become a practitioner · Application introduction</p><LandingPageHeader eyebrow="Join the register" title="An application, not an open listing." description="The Solas Guide reviews experience, scope, lineage, professional context, and fit before any practitioner is included." actionLabel="Begin your application" variant="application" /></div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="editorial-content" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="15 — Editorial content" title="Context before conversion" note="Reusable editorial blocks for category introductions, venue pages, event pages, and practitioner profiles." />
        <EditorialIntro eyebrow="Why this category" title="Somatic healing"><p>Body-led approaches work with sensation, regulation, and the relationship between physical and emotional experience. The Solas Guide distinguishes clinical training, complementary practice, and personal-development contexts rather than treating them as interchangeable.</p></EditorialIntro>
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]"><CuratorsNote>What matters here is not a promise of transformation, but whether the practitioner can explain their scope, experience, and way of working with clarity.</CuratorsNote><FactPanel title="At a glance" facts={[{ label: "Best for", value: "Private and small-group settings" }, { label: "Look for", value: "Training, scope, and integration" }, { label: "The standard", value: "Specific, verifiable context" }]} /></div>
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]"><div><p className="mb-5 text-xs uppercase tracking-[0.15em] text-muted-foreground">Frequently asked</p><FaqList items={[{ question: "How are practitioners reviewed?", answer: "Applications are reviewed for experience, scope, professional context, clarity, and fit with the editorial standard. Submission does not guarantee inclusion." }, { question: "Does The Solas Guide provide medical advice?", answer: "No. The guide provides editorial context and discovery support. It does not diagnose, prescribe, or replace qualified medical care." }, { question: "Can a venue or practitioner pay to be included?", answer: "Commercial relationships must remain separate from editorial review and should be disclosed wherever relevant." }]} /></div><DisclosurePanel title="Scope and independence">The Solas Guide is an editorial and discovery service. Profiles should explain what is known, what has been reviewed, and what remains the visitor&apos;s responsibility to assess.</DisclosurePanel></div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="enquiry-patterns" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="16 — Enquiry patterns" title="Entry points into multi-step forms" note="Clear invitations route people into the right guided journey without presenting every field at once." />
        <EnquiryCta eyebrow="Not sure where to begin?" title="Share the context. The Solas Guide will help shape the next step." description="A short guided enquiry gathers purpose, location, timing, and preferences before asking for detailed information." actionLabel="Start an enquiry" secondaryLabel="How it works" />
        <JourneyEntryCards items={[{ index: "01", title: "Find support", description: "A guided route toward a practitioner, practice, or relevant recommendation." }, { index: "02", title: "Plan a place or event", description: "Share the group, location, timing, and type of experience you have in mind." }, { index: "03", title: "Apply to the register", description: "A structured practitioner application covering experience, scope, and professional context." }]} />
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      <section id="overlays-feedback" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading index="17 — Overlays & feedback" title="Supporting moments" note="Dialogs and sheets clarify the next action; empty and loading states preserve confidence while content changes." />
        <div className="grid gap-6 md:grid-cols-2"><div className="flex flex-col justify-between gap-10 border border-border p-7"><div><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Enquiry dialog</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">A focused choice before entering a longer form.</p></div><EnquiryDialogExample /></div><div className="flex flex-col justify-between gap-10 border border-border p-7"><div><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Mobile filter sheet</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Secondary discovery controls stay available without crowding a small screen.</p></div><MobileFilterSheetExample /></div></div>
        <div className="grid gap-6 md:grid-cols-2"><EmptyState title="Nothing exact yet" description="Broaden one filter or share what you are looking for with The Solas Guide." actionLabel="Clear filters" /><div className="flex flex-col gap-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Loading results</p><LoadingCardGrid count={2} className="lg:grid-cols-2" /></div></div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6"><Separator /></div>

      {/* 18 — Imagery */}
      <section id="imagery" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="18 — Imagery"
          title="Photography direction"
          note="Architecture in nature, natural light, human presence without performance. Reference world: Bambu Indah, COMO Shambhala, Fivelements."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 border border-border p-8">
            <p className="text-xs font-medium uppercase tracking-[0.15em]">
              Yes
            </p>
            <ul className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
              <li>Natural light only — no studio lighting</li>
              <li>Cream, terracotta, deep green, stone</li>
              <li>Architecture in jungle, river stone, teak</li>
              <li>Understated human presence, no eye contact in heroes</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 border border-border p-8">
            <p className="text-xs font-medium uppercase tracking-[0.15em]">
              No
            </p>
            <ul className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
              <li>No stock wellness photography</li>
              <li>No posed meditation or hands on hearts</li>
              <li>No golden-hour yoga silhouettes</li>
              <li>No logos, signage or branded items in frame</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-l-2 border-accent bg-muted/50 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.15em]">Provisional generated concepts</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">No final photography has been selected. The images below test composition and tone only. New concepts should use The Solas Guide image-direction skill with GPT Image 2 and remain labelled as generated until approved.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {IMAGERY_OPTIONS.map((image, index) => (
            <figure
              key={image.src}
              className={index === 0 ? "md:col-span-2" : undefined}
            >
              <div className={index === 0 ? "aspect-[21/9] overflow-hidden bg-muted" : "aspect-[4/3] overflow-hidden bg-muted"}>
                <img
                  src={image.src}
                  alt={image.label}
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="flex flex-col gap-1 border-x border-b border-border px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.15em]">
                  {image.label}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {image.note}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-6">
        <Separator />
      </div>

      {/* 19 — Voice */}
      <section id="voice" className="ds-section mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-12 px-6 py-20 md:py-28">
        <SectionHeading
          index="19 — Voice"
          title="Copywriting guide"
          note="A practical writing system for clear, specific, and culturally careful editorial copy across The Solas Guide."
        />
        <CopywritingGuide />
      </section>

        </div>
      </div>
    </main>
  );
}

function cnGrid(index: number) {
  return `flex h-20 items-end border border-border bg-muted/40 p-2 ${index > 3 ? "hidden md:flex" : ""}`;
}
