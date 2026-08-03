"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import { FormChoiceCard } from "@/components/forms/form-choice-card";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type JourneyStep = "brief" | "modalities" | "timing" | "location" | "group" | "budget" | "review" | "contact";
type Choice = { value: string; label: string; description?: string };

const questionSteps: { key: Exclude<JourneyStep, "review" | "contact">; label: string }[] = [
  { key: "brief", label: "Your brief" },
  { key: "modalities", label: "Practices" },
  { key: "timing", label: "Timing" },
  { key: "location", label: "Location" },
  { key: "group", label: "Your group" },
  { key: "budget", label: "Investment" },
];

const intentChoices: Choice[] = [
  { value: "practitioner", label: "Find a practitioner", description: "Explore a practice or person who may suit what you need." },
  { value: "place", label: "Find a place or venue", description: "Find a setting for a retreat, gathering, or restorative stay." },
  { value: "experience", label: "Add an experience", description: "A workshop, event, or gathering." },
  { value: "broader", label: "Shape a broader stay", description: "Start with the feeling." },
  { value: "exploring", label: "I’m still exploring" },
];

const timingChoices: Choice[] = [
  { value: "dates-known", label: "I know my dates" },
  { value: "month", label: "Within the next month" },
  { value: "season", label: "In the next few months" },
  { value: "later", label: "Later this year" },
  { value: "planning", label: "I’m still planning" },
];

const locationChoices: Choice[] = [
  { value: "ubud", label: "Ubud" },
  { value: "canggu", label: "Canggu or Seminyak" },
  { value: "south", label: "South Bali" },
  { value: "east-north", label: "East or North Bali" },
  { value: "moving", label: "Moving between areas" },
  { value: "undecided", label: "I haven’t decided yet" },
];

const groupChoices: Choice[] = [
  { value: "solo", label: "Just me", description: "A one-to-one experience or personal recommendation." },
  { value: "pair", label: "Me and a partner or friend" },
  { value: "small-group", label: "A small group", description: "A few people travelling or gathering together." },
  { value: "retreat", label: "A retreat or larger group", description: "A planned stay, retreat, or group experience." },
  { value: "team", label: "A team or organisation" },
  { value: "unsure", label: "I’m not sure yet" },
];

const budgetChoices: Choice[] = [
  { value: "personal", label: "A personal budget", description: "I have a sense of what I’d like to invest for myself." },
  { value: "group", label: "A group or retreat budget", description: "I’m planning for several people or a larger experience." },
  { value: "flexible", label: "I’m open to the right option", description: "The fit matters more than setting a fixed range today." },
  { value: "unsure", label: "I’m not sure yet" },
  { value: "discuss", label: "I’d prefer to discuss this" },
];

const modalityGroups: { title: string; choices: Choice[] }[] = [
  { title: "Grounding & presence", choices: ["Yoga", "Breathwork", "Meditation", "Sound & Music Healing"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label })) },
  { title: "Mind & nervous system", choices: ["Somatic & Trauma Healing", "Hypnotherapy", "Psychology & Counselling", "Coaching & Facilitation"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label })) },
  { title: "Body & movement", choices: ["Bodywork & Physical Therapy", "Movement & Dance", "Women’s Health", "Cold Exposure & Ice Bath"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label })) },
  { title: "Tradition & ceremony", choices: ["Traditional Balinese Healing", "Energy Healing & Reiki", "Cacao & Ceremony", "Spiritual & Esoteric Practices"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label })) },
];

const unsureModalityChoice: Choice = { value: "unsure", label: "I’m not sure yet" };

const stepCopy: Record<JourneyStep, { eyebrow: string; title: string }> = {
  brief: { eyebrow: "Your brief", title: "What would be most useful for your Bali stay?" },
  modalities: { eyebrow: "Your preferences", title: "Which practices interest you?" },
  timing: { eyebrow: "Your timing", title: "When are you planning to be in Bali?" },
  location: { eyebrow: "The setting", title: "Where will you be based?" },
  group: { eyebrow: "The people involved", title: "Who is this experience for?" },
  budget: { eyebrow: "One final question", title: "What level of investment are you considering?" },
  review: { eyebrow: "What happens next", title: "Your brief will be reviewed personally by The Solas Guide." },
  contact: { eyebrow: "A few details", title: "Where should we send the next step?" },
};

function ChoiceGrid({ choices, value, onChange, columns = "md:grid-cols-2", compact = false }: { choices: Choice[]; value: string; onChange: (value: string) => void; columns?: string; compact?: boolean }) {
  return <div className={cn("grid gap-3", compact && "gap-1.5", columns)} role="group">{choices.map((choice) => <FormChoiceCard key={choice.value} label={choice.label} description={choice.description} compact={compact} selected={value === choice.value} onClick={() => onChange(choice.value)} />)}</div>;
}

export function CustomerEnquiryForm() {
  const [step, setStep] = useState<JourneyStep>("brief");
  const [intent, setIntent] = useState("");
  const [brief, setBrief] = useState("");
  const [modalities, setModalities] = useState<string[]>([]);
  const [timing, setTiming] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [group, setGroup] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPreference, setContactPreference] = useState("email");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = questionSteps.findIndex((item) => item.key === step);
  const totalSteps = questionSteps.length + 2;
  const progressIndex = step === "review" ? questionSteps.length : step === "contact" ? questionSteps.length + 1 : Math.max(0, stepIndex);
  const currentCopy = stepCopy[step];
  const requiresGroupSize = ["small-group", "retreat", "team"].includes(group);

  function toggleModality(value: string) {
    setModalities((current) => {
      if (value === unsureModalityChoice.value) return current.includes(value) ? [] : [value];
      return current.includes(value) ? current.filter((item) => item !== value) : [...current.filter((item) => item !== unsureModalityChoice.value), value];
    });
  }

  function canContinue() {
    if (step === "brief") return Boolean(intent);
    if (step === "modalities") return modalities.length > 0;
    if (step === "timing") return Boolean(timing && (timing !== "dates-known" || (startDate && endDate)));
    if (step === "location") return Boolean(location);
    if (step === "group") return Boolean(group && (!requiresGroupSize || Number(groupSize) > 0));
    if (step === "budget") return Boolean(budget);
    return false;
  }

  function continueJourney() {
    setError("");
    if (!canContinue()) {
      setError(step === "brief" ? "Choose a direction to continue." : step === "modalities" ? "Select at least one practice, or choose “I’m not sure yet.”" : "Choose an option to continue.");
      return;
    }
    const nextIndex = stepIndex + 1;
    setStep(nextIndex < questionSteps.length ? questionSteps[nextIndex].key : "review");
  }

  function goBack() {
    setError("");
    if (step === "review") return setStep("budget");
    if (step === "contact") return setStep("review");
    if (stepIndex > 0) setStep(questionSteps[stepIndex - 1].key);
  }

  return <main className="min-h-screen bg-muted/40 px-3 py-3 md:px-5 md:py-8">
    <div className="mx-auto w-full max-w-[1240px]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-1 pb-5 md:px-0">
        <Link href="/" className="font-display text-2xl tracking-tight">The Solas Guide</Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Back to the guide</Link>
      </div>

      <section className="flex flex-col border-b border-border md:h-[min(920px,calc(100vh-128px))] md:min-h-[680px]">
        <div className="px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-center justify-between gap-5">
            <h1 className="font-display text-3xl leading-none md:text-4xl">Tell us about your stay</h1>
          </div>
          <div className="mt-5" role="progressbar" aria-label="Enquiry progress" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={progressIndex + 1}>
            <div className="h-1 bg-muted"><div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${((progressIndex + 1) / totalSteps) * 100}%` }} /></div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><span>Step {progressIndex + 1} of {totalSteps}</span><span>{currentCopy.eyebrow}</span></div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 border-t border-border md:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]">
          <aside className="relative min-h-64 overflow-hidden bg-foreground text-background md:min-h-0">
            <Image src="/images/solas-imagery/why-solas-planning.png" alt="A quiet planning table in a Balinese interior" fill className="object-cover opacity-50" sizes="(max-width: 768px) 100vw, 40vw" />
            <div className="absolute inset-0 bg-foreground/45" />
            <div className="relative flex min-h-64 flex-col p-6 md:min-h-0 md:p-8"><div><p className="text-[10px] uppercase tracking-[0.2em] text-background/65">Your Bali stay</p><h2 className="mt-5 max-w-xs font-display text-3xl leading-[1.02] md:text-4xl">Start with the feeling you want to create.</h2></div></div>
          </aside>

          <div className="scrollbar-none flex min-h-0 flex-col overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-2xl"><h2 className="max-w-xl font-display text-xl leading-[1.1] md:text-2xl">{currentCopy.title}</h2></div>

            {error && <FormFeedback tone="error" title="A little more detail is needed" description={error} className="mt-8" />}

            {step === "brief" && <div className="mt-7 space-y-7"><div><p className="mb-3 text-xs font-medium uppercase tracking-[0.14em]">Choose a direction</p><ChoiceGrid choices={intentChoices} value={intent} onChange={setIntent} /></div><div><Label htmlFor="brief" className="text-xs font-medium uppercase tracking-[0.14em]">What are you hoping for? <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="A sentence or two about what you want from your time in Bali." className="mt-3 min-h-24 bg-card" /></div></div>}

            {step === "modalities" && <div className="mt-6"><div className="grid gap-4 sm:grid-cols-2">{modalityGroups.map((group) => <fieldset key={group.title}><legend className="border-b border-border pb-2 text-xs font-medium uppercase tracking-[0.14em]">{group.title}</legend><div className="mt-2 grid gap-1.5">{group.choices.map((choice) => <FormChoiceCard key={choice.value} label={choice.label} compact selected={modalities.includes(choice.value)} onClick={() => toggleModality(choice.value)} />)}</div></fieldset>)}</div><div className="mt-4"><FormChoiceCard label={unsureModalityChoice.label} compact selected={modalities.includes(unsureModalityChoice.value)} onClick={() => toggleModality(unsureModalityChoice.value)} /></div></div>}

            {step === "timing" && <div className="mt-6"><ChoiceGrid choices={timingChoices} value={timing} onChange={setTiming} compact />{timing === "dates-known" && <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="start-date">Arrival</Label><Input id="start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 h-11 bg-card" /></div><div><Label htmlFor="end-date">Departure</Label><Input id="end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2 h-11 bg-card" /></div></div>}</div>}

            {step === "location" && <div className="mt-9"><ChoiceGrid choices={locationChoices} value={location} onChange={setLocation} columns="sm:grid-cols-2" /><div className="mt-7"><Label htmlFor="location-detail">Anything specific you already know? <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="location-detail" value={locationDetail} onChange={(event) => setLocationDetail(event.target.value)} placeholder="A hotel, retreat, village, or area" className="mt-2 h-11 bg-card" /></div></div>}

            {step === "group" && <div className="mt-9"><ChoiceGrid choices={groupChoices} value={group} onChange={setGroup} />{requiresGroupSize && <div className="mt-7 max-w-xs"><Label htmlFor="group-size">Approximate group size</Label><Input id="group-size" type="number" min="1" inputMode="numeric" value={groupSize} onChange={(event) => setGroupSize(event.target.value)} placeholder="e.g. 8" className="mt-2 h-11 bg-card" /></div>}</div>}

            {step === "budget" && <div className="mt-9"><ChoiceGrid choices={budgetChoices} value={budget} onChange={setBudget} /></div>}

            {step === "review" && <div className="mt-7 border border-border bg-card p-6 md:p-8"><p className="font-display text-2xl">A considered, human review</p><div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground"><p>Submitting your details does not generate an automatic match or guarantee an introduction.</p><p>The Solas Guide will consider your timing, location, interests, group, and practical context before following up personally about a suitable next step.</p></div></div>}

            {step === "contact" && <div className="mt-9 space-y-6"><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="name">Your name</Label><Input id="name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 bg-card" /></div><div><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 bg-card" /></div></div><div><Label htmlFor="phone">Phone or WhatsApp <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-11 bg-card" /></div><fieldset><legend className="text-sm font-medium">How should we follow up?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{[{ value: "email", label: "Email", icon: Mail }, { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { value: "phone", label: "Phone", icon: Users }].map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={contactPreference === value} onClick={() => setContactPreference(value)} className={cn("flex min-h-16 items-center gap-3 border px-4 text-left text-sm transition-colors", contactPreference === value ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-foreground/40")}><Icon className="size-4" /><span>{label}</span></button>)}</div></fieldset><label className="flex items-start gap-3 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" /> <span>I agree that The Solas Guide may use these details to respond to my enquiry. Please do not include medical records or sensitive personal information.</span></label><p className="border-l-2 border-accent pl-4 text-xs leading-6 text-muted-foreground">Submission will be enabled when Supabase storage and confirmation emails are connected. No details entered on this preview are sent or saved.</p></div>}

            <div className="mt-auto flex flex-col-reverse items-start justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-center">{step !== "brief" ? <button type="button" onClick={goBack} className="inline-flex h-10 items-center gap-2 px-0 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Back</button> : <span className="text-xs text-muted-foreground">Takes about two minutes</span>}{step === "contact" ? <Button type="button" disabled>Submission coming next <ArrowRight /></Button> : <Button type="button" onClick={step === "review" ? () => setStep("contact") : continueJourney}>{step === "review" ? "Continue to your details" : step === "budget" ? "Review the next step" : "Continue"}<ArrowRight /></Button>}</div>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
