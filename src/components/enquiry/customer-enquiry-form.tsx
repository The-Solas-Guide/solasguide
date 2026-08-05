"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail, MessageCircle, Pencil, Users } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FormChoiceCard } from "@/components/forms/form-choice-card";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type JourneyStep = "outcomes" | "need" | "extras" | "timing" | "location" | "group" | "modalities" | "budget" | "notes" | "contact" | "review";
type Choice = { value: string; label: string; description?: string };
type Draft = {
  submissionToken: string; outcomes: string[]; primaryNeed: string; extras: string[]; timing: string;
  startDate: string; endDate: string; location: string; locationDetail: string; group: string;
  groupSize: string; organizationName: string; modalities: string[]; budget: string; notes: string;
};

const steps: { key: JourneyStep; eyebrow: string; title: string }[] = [
  { key: "outcomes", eyebrow: "What matters", title: "What would you like from your time in Bali?" },
  { key: "need", eyebrow: "Where to begin", title: "What would you most like help finding?" },
  { key: "extras", eyebrow: "The wider plan", title: "Would anything else be useful?" },
  { key: "timing", eyebrow: "Your timing", title: "When are you planning to be in Bali?" },
  { key: "location", eyebrow: "The setting", title: "Where will you be based?" },
  { key: "group", eyebrow: "Who is coming", title: "Who are you planning for?" },
  { key: "modalities", eyebrow: "Your interests", title: "Are there any practices you are drawn to?" },
  { key: "budget", eyebrow: "Practical context", title: "How are you thinking about your total wellness budget?" },
  { key: "notes", eyebrow: "Anything else", title: "What else would help us understand your plans?" },
  { key: "contact", eyebrow: "Your details", title: "How should we follow up?" },
  { key: "review", eyebrow: "Review", title: "Check your enquiry before sending it." },
];

const outcomeChoices: Choice[] = [
  { value: "rest-reset", label: "Rest and reset", description: "Slow down, recover, and create space." },
  { value: "physical-wellbeing", label: "Support my physical wellbeing", description: "Movement, bodywork, or restorative care." },
  { value: "personal-support", label: "Find personal support", description: "Thoughtful one-to-one guidance for what you need now." },
  { value: "local-practices", label: "Explore local practices", description: "Learn with relevant people and traditions in Bali." },
  { value: "connection", label: "Connect and celebrate", description: "Create something meaningful with other people." },
  { value: "retreat-team", label: "Shape a retreat or team experience", description: "Bring the right people, place, and programme together." },
  { value: "exploring", label: "I am still exploring" },
];
const needChoices: Choice[] = [
  { value: "practitioner", label: "A practitioner", description: "A credible person or practice suited to your context." },
  { value: "venue", label: "A venue or place", description: "A considered setting for a stay, retreat, or gathering." },
  { value: "experience", label: "An experience", description: "Something personal, restorative, or shared." },
  { value: "event", label: "An event", description: "A workshop, gathering, or guided programme." },
];
const timingChoices: Choice[] = [
  { value: "dates-known", label: "I know my dates" }, { value: "month", label: "Within the next month" },
  { value: "season", label: "In the next few months" }, { value: "later", label: "Later this year" },
  { value: "planning", label: "I am still planning" },
];
const locationChoices: Choice[] = [
  { value: "ubud", label: "Ubud" }, { value: "canggu", label: "Canggu or Seminyak" },
  { value: "south", label: "South Bali" }, { value: "east-north", label: "East or North Bali" },
  { value: "moving", label: "Moving between areas" }, { value: "undecided", label: "I have not decided yet" },
];
const groupChoices: Choice[] = [
  { value: "solo", label: "Just me" }, { value: "pair", label: "Me and a partner or friend" },
  { value: "small-group", label: "A small group" }, { value: "retreat", label: "A retreat or larger group" },
  { value: "business", label: "A business or organisation" }, { value: "unsure", label: "I am not sure yet" },
];
const budgetChoices: Choice[] = [
  { value: "considered", label: "I have a considered budget", description: "I want relevant options within a clear overall spend." },
  { value: "flexible", label: "I can be flexible for the right fit", description: "The people and experience matter more than a fixed figure today." },
  { value: "substantial", label: "I am planning something substantial", description: "This may involve a group, venue, or broader programme." },
  { value: "unsure", label: "I am not sure yet" }, { value: "discuss", label: "I would prefer to discuss it" },
];
const modalityChoices: Choice[] = ["Yoga", "Breathwork", "Meditation", "Sound practice", "Bodywork", "Movement", "Balinese practices", "Retreat facilitation"].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label }));
const DRAFT_KEY = "solas-customer-enquiry-draft-v2";
const DRAFT_TTL = 24 * 60 * 60 * 1000;

function emptyDraft(): Draft {
  return { submissionToken: crypto.randomUUID(), outcomes: [], primaryNeed: "", extras: [], timing: "", startDate: "", endDate: "", location: "", locationDetail: "", group: "", groupSize: "", organizationName: "", modalities: [], budget: "", notes: "" };
}
function initialDraft(): Draft {
  if (typeof window === "undefined") return { ...emptyDraft(), submissionToken: "00000000-0000-4000-8000-000000000000" };
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") as { expiresAt?: number; draft?: Draft } | null;
    if (saved?.draft && saved.expiresAt && saved.expiresAt > Date.now()) return saved.draft;
    localStorage.removeItem(DRAFT_KEY);
  } catch { /* Start fresh when a browser draft cannot be read. */ }
  return emptyDraft();
}
function track(eventName: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.("event", eventName, params);
}
function ChoiceGrid({ choices, selected, onToggle }: { choices: Choice[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2" role="group">{choices.map((choice) => <FormChoiceCard key={choice.value} label={choice.label} description={choice.description} selected={selected.includes(choice.value)} onClick={() => onToggle(choice.value)} />)}</div>;
}
function labels(values: string[], choices: Choice[]) {
  return values.map((value) => choices.find((choice) => choice.value === value)?.label ?? value).join(", ") || "None selected";
}

export function CustomerEnquiryForm() {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const [step, setStep] = useState<JourneyStep>("outcomes");
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [contactPreference, setContactPreference] = useState<"email" | "whatsapp" | "phone">("email");
  const [consent, setConsent] = useState(false); const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false); const [submitted, setSubmitted] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null); const errorRef = useRef<HTMLDivElement>(null); const started = useRef(false);
  const draftStorageActive = useRef(true);

  useEffect(() => {
    if (!draftStorageActive.current) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ expiresAt: Date.now() + DRAFT_TTL, draft })); }
    catch { /* The form remains usable when browser storage is unavailable. */ }
  }, [draft]);
  useEffect(() => { headingRef.current?.focus(); }, [step]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    const expiryTimer = window.setTimeout(() => {
      draftStorageActive.current = false;
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
    }, DRAFT_TTL);
    return () => window.clearTimeout(expiryTimer);
  }, []);

  if (!hydrated) return <main className="min-h-screen bg-muted/40" aria-busy="true" />;

  const index = steps.findIndex((item) => item.key === step); const copy = steps[index];
  const requiresGroupSize = ["small-group", "retreat", "business"].includes(draft.group);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggle = (key: "outcomes" | "extras" | "modalities", value: string, limit?: number) => {
    const current = draft[key];
    if (current.includes(value)) return set(key, current.filter((item) => item !== value));
    if (limit && current.length >= limit) return setError(`Choose up to ${limit} options.`);
    setError(""); set(key, [...current, value]);
  };
  const select = (key: "primaryNeed" | "timing" | "location" | "group" | "budget", value: string) => {
    setError("");
    if (key === "primaryNeed") set("extras", draft.extras.filter((item) => item !== value));
    if (key === "group" && !["small-group", "retreat", "business"].includes(value)) set("groupSize", "");
    if (key === "group" && value !== "business") set("organizationName", "");
    set(key, value);
  };

  function validateCurrent() {
    if (step === "outcomes" && draft.outcomes.length < 1) return "Choose at least one outcome.";
    if (step === "need" && !draft.primaryNeed) return "Choose where you would most like us to begin.";
    if (step === "timing" && !draft.timing) return "Choose a timing option.";
    if (step === "timing" && draft.timing === "dates-known" && (!draft.startDate || !draft.endDate)) return "Add your arrival and departure dates.";
    if (step === "timing" && draft.timing === "dates-known" && draft.endDate < draft.startDate) return "Your departure must be after your arrival.";
    if (step === "location" && !draft.location) return "Choose where you expect to be based.";
    if (step === "group" && !draft.group) return "Tell us who you are planning for.";
    if (step === "group" && requiresGroupSize && Number(draft.groupSize) < 1) return "Add an approximate group size.";
    if (step === "group" && draft.group === "business" && !draft.organizationName.trim()) return "Add the business or organisation name.";
    if (step === "budget" && !draft.budget) return "Choose the closest budget option.";
    if (step === "contact" && (!name.trim() || !/^\S+@\S+\.\S+$/.test(email))) return "Add your name and a valid email address.";
    if (step === "contact" && contactPreference !== "email" && !phone.trim()) return "Add a phone number for phone or WhatsApp follow-up.";
    return "";
  }
  function continueJourney() {
    if (!started.current) { track("enquiry_started"); started.current = true; }
    const message = validateCurrent(); if (message) return setError(message);
    setError(""); track("enquiry_step_completed", { step_id: step, step_number: index + 1 });
    if (returnToReview) { setReturnToReview(false); setStep("review"); return; }
    setStep(steps[index + 1].key);
  }
  function goBack() { setError(""); if (index > 0) setStep(steps[index - 1].key); }

  async function submit() {
    if (!consent) { setError("Confirm that we may use these details to respond to your enquiry."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/enquiries/customer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionToken: draft.submissionToken, startedAt, website, fullName: name, email, phone, contactPreference, consentConfirmed: consent, answers: { formVersion: 2, ...draft, submissionToken: undefined } }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not send your enquiry.");
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
      track("enquiry_submitted"); setSubmitted(true);
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "We could not send your enquiry. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) return <main className="flex min-h-screen items-center bg-muted/40 px-5 py-16"><section className="mx-auto w-full max-w-2xl border border-border bg-card p-8 md:p-12" role="status"><Check className="size-8 text-accent" /><p className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">Enquiry received</p><h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Thank you. We will take it from here.</h1><p className="mt-6 max-w-xl leading-7 text-muted-foreground">We will review what you shared and respond within two business days. If there is a relevant direction, we will explain the recommendations and help facilitate the right introductions.</p><Button asChild className="mt-8"><Link href="/">Return to The Solas Guide</Link></Button></section></main>;

  const reviewRows = [
    { label: "Desired outcomes", value: labels(draft.outcomes, outcomeChoices), edit: "outcomes" as JourneyStep },
    { label: "Primary need", value: labels([draft.primaryNeed], needChoices), edit: "need" as JourneyStep },
    { label: "Optional extras", value: labels(draft.extras, needChoices), edit: "extras" as JourneyStep },
    { label: "Timing", value: draft.timing === "dates-known" ? `${draft.startDate} to ${draft.endDate}` : labels([draft.timing], timingChoices), edit: "timing" as JourneyStep },
    { label: "Location", value: `${labels([draft.location], locationChoices)}${draft.locationDetail ? ` — ${draft.locationDetail}` : ""}`, edit: "location" as JourneyStep },
    { label: "Who is coming", value: `${labels([draft.group], groupChoices)}${draft.groupSize ? ` — approximately ${draft.groupSize}` : ""}${draft.organizationName ? ` — ${draft.organizationName}` : ""}`, edit: "group" as JourneyStep },
    { label: "Practices", value: labels(draft.modalities, modalityChoices), edit: "modalities" as JourneyStep },
    { label: "Budget", value: labels([draft.budget], budgetChoices), edit: "budget" as JourneyStep },
    { label: "Additional context", value: draft.notes || "Nothing added", edit: "notes" as JourneyStep },
    { label: "Follow-up", value: `${contactPreference === "email" ? "Email" : contactPreference === "phone" ? "Phone" : "WhatsApp"} — ${email}${phone ? ` — ${phone}` : ""}`, edit: "contact" as JourneyStep },
  ];

  return <main className="min-h-screen bg-muted/40 px-3 py-3 md:px-5 md:py-8"><div className="mx-auto w-full max-w-[1240px]"><div className="flex items-center justify-between gap-4 border-b border-border px-1 pb-5"><Link href="/" className="font-display text-2xl tracking-tight">The Solas Guide</Link><Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to the guide</Link></div>
    <section className="flex min-h-[700px] flex-col border-b border-border md:h-[min(920px,calc(100vh-128px))]"><div className="px-6 py-5 md:px-8 md:py-6"><h1 className="font-display text-3xl md:text-4xl">Tell us about your stay</h1><div className="mt-5" role="progressbar" aria-label="Enquiry progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}><div className="h-1 bg-muted"><div className="h-full bg-accent transition-[width]" style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div><div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><span>Step {index + 1} of {steps.length}</span><span>{copy.eyebrow}</span></div></div></div>
      <div className="grid min-h-0 flex-1 border-t border-border md:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]"><aside className={cn("relative min-h-64 overflow-hidden bg-foreground text-background", step !== "outcomes" && "hidden md:block")}><Image src="/images/solas-imagery/why-solas-planning.png" alt="A quiet planning table in a Balinese interior" fill loading="eager" className="object-cover opacity-50" sizes="(max-width: 768px) 100vw, 40vw" /><div className="absolute inset-0 bg-foreground/45" /><div className="relative flex min-h-64 p-6 md:min-h-full md:p-8"><div><p className="text-[10px] uppercase tracking-[0.2em] text-background/65">Your Bali stay</p><p className="mt-5 max-w-xs font-display text-3xl leading-tight md:text-4xl">Start with what you want from the experience.</p></div></div></aside>
        <div className="scrollbar-none flex min-h-0 flex-col overflow-y-auto p-6 md:p-8 lg:p-10"><h2 ref={headingRef} tabIndex={-1} className="max-w-xl font-display text-2xl leading-tight outline-none md:text-3xl">{copy.title}</h2>{error && <div ref={errorRef} tabIndex={-1} className="outline-none"><FormFeedback tone="error" title="A little more detail is needed" description={error} className="mt-6" /></div>}
          <div className="mt-7">
            {step === "outcomes" && <><p className="mb-4 text-sm text-muted-foreground">Choose up to three.</p><ChoiceGrid choices={outcomeChoices} selected={draft.outcomes} onToggle={(value) => toggle("outcomes", value, 3)} /></>}
            {step === "need" && <ChoiceGrid choices={needChoices} selected={[draft.primaryNeed]} onToggle={(value) => select("primaryNeed", value)} />}
            {step === "extras" && <><p className="mb-4 text-sm text-muted-foreground">Optional. Choose any other areas you would like us to consider.</p><ChoiceGrid choices={needChoices.filter((choice) => choice.value !== draft.primaryNeed)} selected={draft.extras} onToggle={(value) => toggle("extras", value)} /></>}
            {step === "timing" && <><ChoiceGrid choices={timingChoices} selected={[draft.timing]} onToggle={(value) => { if (value !== "dates-known") { set("startDate", ""); set("endDate", ""); } select("timing", value); }} />{draft.timing === "dates-known" && <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="start-date">Arrival</Label><Input id="start-date" type="date" value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} className="mt-2 bg-card" /></div><div><Label htmlFor="end-date">Departure</Label><Input id="end-date" type="date" min={draft.startDate} value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} className="mt-2 bg-card" /></div></div>}</>}
            {step === "location" && <><ChoiceGrid choices={locationChoices} selected={[draft.location]} onToggle={(value) => select("location", value)} /><div className="mt-6"><Label htmlFor="location-detail">Specific place or area <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="location-detail" value={draft.locationDetail} onChange={(e) => set("locationDetail", e.target.value)} className="mt-2 bg-card" /></div></>}
            {step === "group" && <><ChoiceGrid choices={groupChoices} selected={[draft.group]} onToggle={(value) => select("group", value)} />{requiresGroupSize && <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="group-size">Approximate group size</Label><Input id="group-size" type="number" min="1" value={draft.groupSize} onChange={(e) => set("groupSize", e.target.value)} className="mt-2 bg-card" /></div>{draft.group === "business" && <div><Label htmlFor="organisation">Business or organisation</Label><Input id="organisation" value={draft.organizationName} onChange={(e) => set("organizationName", e.target.value)} className="mt-2 bg-card" /></div>}</div>}</>}
            {step === "modalities" && <><p className="mb-4 text-sm text-muted-foreground">Optional. Leave this open if you would prefer us to suggest a direction.</p><ChoiceGrid choices={modalityChoices} selected={draft.modalities} onToggle={(value) => toggle("modalities", value)} /></>}
            {step === "budget" && <><p className="mb-4 text-sm text-muted-foreground">This refers to the people, places, and experiences you may want us to consider—not your full travel budget.</p><ChoiceGrid choices={budgetChoices} selected={[draft.budget]} onToggle={(value) => select("budget", value)} /></>}
            {step === "notes" && <div><Label htmlFor="notes">Additional context <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="notes" maxLength={3000} value={draft.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tell us anything that would help us understand what you want from the experience." className="mt-3 min-h-40 bg-card" /><p className="mt-2 text-xs text-muted-foreground">Please do not include medical records or sensitive personal information.</p></div>}
            {step === "contact" && <div className="space-y-6"><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="name">Your name</Label><Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 bg-card" /></div><div><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 bg-card" /></div></div><fieldset><legend className="text-sm font-medium">Preferred follow-up</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{([{ value: "email", label: "Email", icon: Mail }, { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { value: "phone", label: "Phone", icon: Users }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={contactPreference === value} onClick={() => { if (value === "email") setPhone(""); setContactPreference(value); }} className={cn("flex min-h-16 items-center gap-3 border px-4 text-left text-sm", contactPreference === value ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card")}><Icon className="size-4" />{label}</button>)}</div></fieldset>{contactPreference !== "email" && <div><Label htmlFor="phone">Phone or WhatsApp number</Label><Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 bg-card" /></div>}</div>}
            {step === "review" && <div className="divide-y divide-border border border-border bg-card">{reviewRows.map((row) => <div key={row.label} className="flex items-start justify-between gap-5 p-4 md:p-5"><div><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{row.label}</p><p className="mt-2 text-sm leading-6">{row.value}</p></div><button type="button" onClick={() => { setReturnToReview(true); setStep(row.edit); }} className="inline-flex shrink-0 items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"><Pencil className="size-3" /> Edit</button></div>)}<div className="absolute -left-[9999px]" aria-hidden="true"><Label htmlFor="website">Website</Label><Input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div><label className="flex items-start gap-3 p-5 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" /><span>I agree that The Solas Guide may use these details to respond to my enquiry.</span></label></div>}
          </div>
          <div className="mt-auto flex flex-col-reverse items-start justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-center">{index > 0 ? <button type="button" onClick={goBack} className="inline-flex h-10 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back</button> : <span className="text-xs text-muted-foreground">Takes about three minutes</span>}{step === "review" ? <Button type="button" onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Send enquiry"}<ArrowRight /></Button> : <Button type="button" onClick={continueJourney}>{step === "contact" ? "Review your enquiry" : "Continue"}<ArrowRight /></Button>}</div>
        </div></div>
    </section></div></main>;
}
