const VOICE_PRINCIPLES = [
  { title: "Quiet authority", text: "Confidence comes from restraint, context, and evidence—not volume or status language." },
  { title: "Specific over spiritual", text: "Use names, years, places, practices, teachers, and qualifications wherever they are known." },
  { title: "Warm, not familiar", text: "Invite exploration without assuming intimacy, vulnerability, or a desired outcome." },
  { title: "Editorial, not promotional", text: "Help someone understand and decide. Do not manufacture desire, urgency, or certainty." },
];

const TONE_CONTEXTS = [
  ["Practitioner profiles", "Factual, respectful, precise"],
  ["Venues", "Sensory, spatial, grounded"],
  ["Events & workshops", "Clear, timely, informative"],
  ["Enquiry forms", "Calm, reassuring, concise"],
  ["Applications", "Direct, professional, transparent"],
  ["System messages", "Plain, helpful, blame-free"],
];

const VOCABULARY = [
  ["Practitioner", "Healer, guru"],
  ["Practice", "Transformation journey"],
  ["Experience", "Life-changing experience"],
  ["Specific", "Exclusive, elite"],
  ["Introduce", "Perfect match"],
  ["Explore", "Unlock your potential"],
  ["May support", "Will heal or cure"],
  ["The Solas Guide", "A shortened brand name"],
];

const CTA_GROUPS = [
  ["Discovery", "Explore practitioners"],
  ["Comparison", "View the profile"],
  ["Enquiry", "Start an enquiry"],
  ["Application", "Begin your application"],
  ["Information", "Read about the practice"],
  ["Progress", "Continue your enquiry"],
];

const CONTENT_TEMPLATES = [
  { title: "Practitioner profile", structure: "Name and place → practice → experience and lineage → scope → practical details" },
  { title: "Venue introduction", structure: "Setting → material and atmosphere → intended use → capacity and practical context" },
  { title: "Event description", structure: "What it is → who leads it → date and place → what to expect → suitability" },
  { title: "Category introduction", structure: "Plain-language definition → relevant distinctions → what to consider → next step" },
  { title: "Application invitation", structure: "Purpose → review standard → information requested → what happens next" },
  { title: "Confirmation message", structure: "What was received → who reviews it → expected next step → timing if known" },
];

const WRITING_CHECKLIST = [
  "Use The Solas Guide in full—never shorten the brand name.",
  "Support factual claims with supplied or reviewed information.",
  "Use concrete language and describe the actual next step.",
  "Avoid medical, therapeutic, or transformational promises.",
  "Distinguish editorial review from practitioner-supplied information.",
  "Preserve local names and terminology without exoticising them.",
  "Never describe something as verified when it is provisional.",
  "Remove urgency, superlatives, clichés, and unnecessary adjectives.",
];

export function CopywritingGuide() {
  return (
    <div className="flex flex-col gap-16">
      <div>
        <GuideLabel>Voice principles</GuideLabel>
        <div className="mt-5 grid border border-border md:grid-cols-2">
          {VOICE_PRINCIPLES.map((item, index) => (
            <article key={item.title} className="border-b border-border p-7 last:border-b-0 md:min-h-48 md:border-r md:[&:nth-child(2n)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Principle {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-7 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <GuideLabel>Tone by context</GuideLabel>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">The voice stays consistent. Its emphasis changes according to what the reader needs in that moment.</p>
        </div>
        <div className="border-t border-border">
          {TONE_CONTEXTS.map(([surface, tone]) => <div key={surface} className="grid gap-2 border-b border-border py-4 sm:grid-cols-2"><p className="text-sm font-medium">{surface}</p><p className="text-sm text-muted-foreground">{tone}</p></div>)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card p-7 md:p-9">
          <GuideLabel>Evidence and claims</GuideLabel>
          <ul className="mt-7 grid gap-4 text-sm leading-relaxed text-muted-foreground">
            <li>Separate reviewed facts from practitioner-supplied statements.</li>
            <li>Attribute traditions, teachers, and lineages with care.</li>
            <li>Use exact years, locations, and qualifications when known.</li>
            <li>Explain what reviewed or verified means before using it.</li>
            <li>Never imply medical outcomes, guaranteed suitability, or endorsement without evidence.</li>
          </ul>
        </div>
        <div className="border border-border p-7 md:p-9">
          <GuideLabel>Writing mechanics</GuideLabel>
          <ul className="mt-7 grid gap-4 text-sm leading-relaxed text-muted-foreground">
            <li>Use short sentences, restrained paragraphs, and active voice.</li>
            <li>Write headings and buttons in sentence case.</li>
            <li>Choose concrete nouns and verbs over decorative adjectives.</li>
            <li>Define unfamiliar practices rather than assuming knowledge.</li>
            <li>Avoid exclamation marks, invented urgency, and rhetorical questions.</li>
          </ul>
        </div>
      </div>

      <div>
        <GuideLabel>Working vocabulary</GuideLabel>
        <div className="mt-5 overflow-hidden border border-border">
          <div className="grid grid-cols-2 bg-muted/50 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><p className="p-4">Prefer</p><p className="border-l border-border p-4">Avoid</p></div>
          {VOCABULARY.map(([preferred, avoid]) => <div key={preferred} className="grid grid-cols-2 border-t border-border text-sm"><p className="p-4 font-medium">{preferred}</p><p className="border-l border-border p-4 text-muted-foreground">{avoid}</p></div>)}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr]">
        <div>
          <GuideLabel>Calls to action</GuideLabel>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Name the next step. Do not inflate it. Avoid phrases such as “transform your life today” or “unlock your potential.”</p>
        </div>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {CTA_GROUPS.map(([intent, example]) => <div key={intent} className="bg-background p-5"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{intent}</p><p className="mt-3 text-sm font-medium">{example} →</p></div>)}
        </div>
      </div>

      <div>
        <GuideLabel>Content templates</GuideLabel>
        <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {CONTENT_TEMPLATES.map((template) => <article key={template.title} className="bg-background p-6"><h3 className="font-display text-xl">{template.title}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{template.structure}</p></article>)}
        </div>
      </div>

      <div>
        <GuideLabel>Before and after</GuideLabel>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <ExampleCard label="Write this" copy="Made has practised Usada Bali for twenty-two years, taught by his grandfather in Payangan." note="Specific, attributed, and checkable." />
          <ExampleCard label="Not this" copy="Discover your journey to inner transformation with Bali’s most amazing healers." note="Promotional urgency, unsupported claims, and generic wellness language." rejected />
          <ExampleCard label="Write this" copy="Your enquiry has been received. The Solas Guide will review the details and reply with a clear next step." note="Explains what happened and what follows." />
          <ExampleCard label="Not this" copy="Amazing! You’re one step closer to changing your life forever!" note="Over-familiar, performative, and promises an outcome." rejected />
        </div>
      </div>

      <div className="grid gap-8 border border-border bg-foreground p-7 text-background md:grid-cols-[0.7fr_1.3fr] md:p-10">
        <div><GuideLabel className="text-background/60">Publishing checklist</GuideLabel><h3 className="mt-6 font-display text-3xl">Before the words go live</h3></div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {WRITING_CHECKLIST.map((item, index) => <li key={item} className="flex gap-3 border-t border-background/20 pt-3 text-sm leading-relaxed text-background/75"><span className="text-[10px] text-background/45">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}
        </ol>
      </div>
    </div>
  );
}

function GuideLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground ${className}`}>{children}</p>;
}

function ExampleCard({ label, copy, note, rejected = false }: { label: string; copy: string; note: string; rejected?: boolean }) {
  return <article className="border border-border p-7"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p><p className={`mt-6 font-display text-2xl leading-snug ${rejected ? "text-muted-foreground line-through decoration-destructive/60" : ""}`}>{copy}</p><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{note}</p></article>;
}
import type { ReactNode } from "react";
