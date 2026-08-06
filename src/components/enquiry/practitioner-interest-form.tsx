"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail, MessageCircle, Pencil, Phone } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FormChoiceCard } from "@/components/forms/form-choice-card";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type JourneyStep = "practice" | "areas" | "experience" | "contact" | "review";
type Choice = { value: string; label: string; description?: string };
type Draft = {
  submissionToken: string;
  baliRelationship: string;
  area: string;
  practiceAreas: string[];
};
type StoredDraft = { expiresAt: number; draft: Draft };

const steps: { key: JourneyStep; eyebrow: string; title: string }[] = [
  { key: "practice", eyebrow: "Your practice", title: "Tell us about your work in Bali." },
  { key: "areas", eyebrow: "Practice areas", title: "Which practices best describe your work?" },
  { key: "experience", eyebrow: "Experience and links", title: "What would help us understand your work?" },
  { key: "contact", eyebrow: "Contact", title: "How should we contact you?" },
  { key: "review", eyebrow: "Review", title: "Check your expression of interest before sending it." },
];
const relationshipChoices: Choice[] = [
  { value: "based-in-bali", label: "Based in Bali", description: "My practice is currently based in Bali." },
  { value: "works-in-bali-regularly", label: "Work in Bali regularly", description: "I live elsewhere but reliably practise or facilitate work in Bali." },
];
const areaChoices: Choice[] = [
  { value: "ubud", label: "Ubud" },
  { value: "canggu-seminyak", label: "Canggu or Seminyak" },
  { value: "south-bali", label: "South Bali" },
  { value: "east-north-bali", label: "East or North Bali" },
  { value: "elsewhere-bali", label: "Elsewhere in Bali" },
];
const practiceChoices: Choice[] = [
  "Yoga", "Breathwork", "Meditation", "Sound practice", "Bodywork", "Movement", "Balinese practices", "Retreat facilitation", "Other",
].map((label) => ({ value: label.toLowerCase().replaceAll(" ", "-"), label }));
const DRAFT_KEY = "solas-practitioner-interest-draft-v1";
const DRAFT_TTL = 24 * 60 * 60 * 1000;

function emptyDraft(): Draft {
  return {
    submissionToken: crypto.randomUUID(),
    baliRelationship: "",
    area: "",
    practiceAreas: [],
  };
}

function initialDraft(): StoredDraft {
  if (typeof window === "undefined") {
    return {
      expiresAt: 0,
      draft: { submissionToken: "00000000-0000-4000-8000-000000000000", baliRelationship: "", area: "", practiceAreas: [] },
    };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") as Partial<StoredDraft> | null;
    if (saved?.draft && saved.expiresAt && saved.expiresAt > Date.now() && Array.isArray(saved.draft.practiceAreas)) {
      return { draft: saved.draft, expiresAt: saved.expiresAt };
    }
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // The form remains usable when browser storage is unavailable.
  }
  return { draft: emptyDraft(), expiresAt: Date.now() + DRAFT_TTL };
}

function track(eventName: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.("event", eventName, params);
}

function labelFor(value: string, choices: Choice[]) {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}

function isHttpsUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function ChoiceGrid({ choices, selected, onToggle }: { choices: Choice[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group">
      {choices.map((choice) => (
        <FormChoiceCard
          key={choice.value}
          label={choice.label}
          description={choice.description}
          selected={selected.includes(choice.value)}
          onClick={() => onToggle(choice.value)}
        />
      ))}
    </div>
  );
}

export function PractitionerInterestForm() {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const [step, setStep] = useState<JourneyStep>("practice");
  const [storedDraft, setStoredDraft] = useState<StoredDraft>(initialDraft);
  const [professionalRole, setProfessionalRole] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [otherPractice, setOtherPractice] = useState("");
  const [experienceSummary, setExperienceSummary] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [additionalLink1, setAdditionalLink1] = useState("");
  const [additionalLink2, setAdditionalLink2] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPreference, setContactPreference] = useState<"email" | "whatsapp" | "phone">("email");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenConflict, setTokenConflict] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const draftStorageActive = useRef(true);
  const draft = storedDraft.draft;

  useEffect(() => {
    if (!draftStorageActive.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(storedDraft));
    } catch {
      // The form remains usable when browser storage is unavailable.
    }
  }, [storedDraft]);
  useEffect(() => { if (hydrated) headingRef.current?.focus(); }, [step, hydrated]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    const remainingLifetime = storedDraft.expiresAt - Date.now();
    if (remainingLifetime <= 0) {
      draftStorageActive.current = false;
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
      return;
    }
    const expiryTimer = window.setTimeout(() => {
      draftStorageActive.current = false;
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
    }, remainingLifetime);
    return () => window.clearTimeout(expiryTimer);
  }, [storedDraft.expiresAt]);

  if (!hydrated) return <main className="min-h-screen bg-muted/40" aria-busy="true" />;

  const index = steps.findIndex((item) => item.key === step);
  const copy = steps[index];
  const setDraftValue = <K extends keyof Draft>(key: K, value: Draft[K]) => setStoredDraft((current) => ({
    ...current,
    draft: { ...current.draft, [key]: value },
  }));
  const additionalLinks = [additionalLink1.trim(), additionalLink2.trim()].filter(Boolean);

  function togglePractice(value: string) {
    if (draft.practiceAreas.includes(value)) {
      setDraftValue("practiceAreas", draft.practiceAreas.filter((item) => item !== value));
      if (value === "other") setOtherPractice("");
      setError("");
      return;
    }
    if (draft.practiceAreas.length >= 5) {
      setError("Choose up to five practice areas.");
      return;
    }
    setError("");
    setDraftValue("practiceAreas", [...draft.practiceAreas, value]);
  }

  function validateCurrent() {
    if (step === "practice" && professionalRole.trim().length < 2) return "Add your professional role or practice.";
    if (step === "practice" && professionalRole.trim().length > 120) return "Shorten your professional role or practice.";
    if (step === "practice" && practiceName.trim() && practiceName.trim().length < 2) return "Add a longer practice or business name.";
    if (step === "practice" && practiceName.trim().length > 200) return "Shorten your practice or business name.";
    if (step === "practice" && !draft.baliRelationship) return "Tell us about your relationship to Bali.";
    if (step === "practice" && !draft.area) return "Choose your primary area in Bali.";
    if (step === "practice" && locationDetail.trim().length > 200) return "Shorten your location detail.";
    if (step === "areas" && (draft.practiceAreas.length < 1 || draft.practiceAreas.length > 5)) return "Choose between one and five practice areas.";
    if (step === "areas" && draft.practiceAreas.includes("other") && otherPractice.trim().length < 2) return "Tell us about your other practice.";
    if (step === "areas" && otherPractice.trim().length > 100) return "Shorten your other practice.";
    if (step === "experience" && experienceSummary.trim().length < 50) return "Share at least 50 characters about your relevant experience.";
    if (step === "experience" && experienceSummary.trim().length > 2_000) return "Shorten your relevant experience.";
    if (step === "experience" && !isHttpsUrl(websiteUrl.trim())) return "Enter a valid HTTPS website or profile link.";
    if (step === "experience" && additionalLinks.some((link) => !isHttpsUrl(link))) return "Enter valid HTTPS additional links.";
    if (step === "experience" && new Set([websiteUrl.trim(), ...additionalLinks].filter(Boolean)).size !== [websiteUrl.trim(), ...additionalLinks].filter(Boolean).length) return "Remove duplicate links.";
    if (step === "contact" && !fullName.trim()) return "Add your full name.";
    if (step === "contact" && !/^\S+@\S+\.\S+$/.test(email.trim())) return "Add a valid email address.";
    if (step === "contact" && contactPreference !== "email" && !phone.trim()) return "Add a phone number for phone or WhatsApp follow-up.";
    return "";
  }

  function continueJourney() {
    if (!started.current) {
      track("practitioner_interest_started");
      started.current = true;
    }
    const message = validateCurrent();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    track("practitioner_interest_step_completed", { step_id: step, step_number: index + 1 });
    if (returnToReview) {
      setReturnToReview(false);
      setStep("review");
      return;
    }
    const nextStep = steps[index + 1].key;
    if (nextStep === "review") track("practitioner_interest_reviewed");
    setStep(nextStep);
  }

  function goBack() {
    setError("");
    if (index > 0) setStep(steps[index - 1].key);
  }

  function startNewExpression() {
    draftStorageActive.current = true;
    setStoredDraft({ draft: emptyDraft(), expiresAt: Date.now() + DRAFT_TTL });
    setProfessionalRole("");
    setPracticeName("");
    setLocationDetail("");
    setOtherPractice("");
    setExperienceSummary("");
    setWebsiteUrl("");
    setAdditionalLink1("");
    setAdditionalLink2("");
    setFullName("");
    setEmail("");
    setPhone("");
    setContactPreference("email");
    setConsent(false);
    setWebsite("");
    setError("");
    setTokenConflict(false);
    setReturnToReview(false);
    setStartedAt(Date.now());
    started.current = false;
    setStep("practice");
  }

  async function submit() {
    if (!consent) {
      setError("Confirm that we may use these details to respond to your expression of interest.");
      return;
    }
    setSubmitting(true);
    setError("");
    setTokenConflict(false);
    try {
      const response = await fetch("/api/enquiries/practitioner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionToken: draft.submissionToken,
          startedAt,
          website,
          fullName,
          email,
          phone,
          contactPreference,
          consentConfirmed: consent,
          practiceName,
          websiteUrl,
          answers: {
            formVersion: 1,
            professionalRole,
            baliRelationship: draft.baliRelationship,
            area: draft.area,
            locationDetail,
            practiceAreas: draft.practiceAreas,
            otherPractice,
            experienceSummary,
            additionalLinks,
          },
        }),
      });
      const result = await response.json() as { ok?: boolean; duplicate?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        if (response.status === 409) setTokenConflict(true);
        throw new Error(result.error || "We could not save your expression of interest.");
      }
      draftStorageActive.current = false;
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Storage may be unavailable. */ }
      track("practitioner_interest_submitted", { is_retry: Boolean(result.duplicate) });
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not save your expression of interest. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center bg-muted/40 px-5 py-16">
        <section className="mx-auto w-full max-w-2xl border border-border bg-card p-8 md:p-12" role="status">
          <Check className="size-8 text-accent" />
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">Expression of interest received</p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Thank you. Your expression of interest has been received.</h1>
          <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
            We have saved the details you shared. If The Solas Guide would like to continue the conversation, we will use your chosen contact details.
          </p>
          <Button asChild className="mt-8"><Link href="/">Return to The Solas Guide</Link></Button>
        </section>
      </main>
    );
  }

  const reviewRows = [
    {
      label: "Your practice",
      value: `${professionalRole}${practiceName ? ` — ${practiceName}` : ""} — ${labelFor(draft.baliRelationship, relationshipChoices)} — ${labelFor(draft.area, areaChoices)}${locationDetail ? ` — ${locationDetail}` : ""}`,
      edit: "practice" as JourneyStep,
    },
    {
      label: "Practice areas",
      value: draft.practiceAreas.map((value) => value === "other" ? otherPractice : labelFor(value, practiceChoices)).join(", "),
      edit: "areas" as JourneyStep,
    },
    {
      label: "Experience and links",
      value: `${experienceSummary}${websiteUrl ? ` — ${websiteUrl}` : ""}${additionalLinks.length ? ` — ${additionalLinks.join(" — ")}` : ""}`,
      edit: "experience" as JourneyStep,
    },
    {
      label: "Contact",
      value: `${fullName} — ${email}${phone ? ` — ${phone}` : ""} — ${contactPreference === "email" ? "Email" : contactPreference === "phone" ? "Phone" : "WhatsApp"}`,
      edit: "contact" as JourneyStep,
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 px-3 py-3 md:px-5 md:py-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex items-center justify-between gap-4 border-b border-border px-1 pb-5">
          <Link href="/" className="font-display text-2xl tracking-tight">The Solas Guide</Link>
          <Link href="/become-a-practitioner" className="inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> About practitioner interest
          </Link>
        </div>
        <section className="flex min-h-[700px] flex-col border-b border-border md:h-[min(920px,calc(100vh-128px))]">
          <div className="py-4">
            <h1 className="font-display text-2xl md:text-3xl">Introduce your practice</h1>
            <div className="mt-3" role="progressbar" aria-label="Expression of interest progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}>
              <div className="h-0.5 bg-muted"><div className="h-full bg-accent transition-[width]" style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
              <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.16em] text-muted-foreground"><span>Step {index + 1} of {steps.length}</span><span>{copy.eyebrow}</span></div>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 border-t border-border md:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]">
            <aside className={cn("relative min-h-64 overflow-hidden bg-foreground text-background", step !== "practice" && "hidden md:block")}>
              <Image src="/images/solas-imagery/why-solas-pavilion.png" alt="A quiet open-air pavilion surrounded by tropical greenery in Bali" fill loading="eager" className="object-cover opacity-55" sizes="(max-width: 768px) 100vw, 40vw" />
              <div className="absolute inset-0 bg-foreground/45" />
              <div className="relative flex min-h-64 p-6 md:min-h-full md:p-8">
                <div><p className="text-[10px] uppercase tracking-[0.2em] text-background/65">Your work in Bali</p><p className="mt-5 max-w-xs font-display text-3xl leading-tight md:text-4xl">Share a clear professional introduction.</p></div>
              </div>
            </aside>
            <div className="scrollbar-none flex min-h-0 flex-col overflow-y-auto p-6 md:p-8 lg:p-10">
              <h2 ref={headingRef} tabIndex={-1} className="max-w-xl font-display text-2xl leading-tight outline-none md:text-3xl">{copy.title}</h2>
              {error && <div ref={errorRef} tabIndex={-1} className="outline-none"><FormFeedback tone="error" title="A little more detail is needed" description={error} className="mt-6" />{tokenConflict && <Button type="button" variant="outline" onClick={startNewExpression} className="mt-3 w-full sm:w-auto">Start a new expression</Button>}</div>}
              <div className="mt-7">
                {step === "practice" && (
                  <div className="space-y-7">
                    <div><Label htmlFor="professional-role">Professional role or practice</Label><Input id="professional-role" maxLength={120} value={professionalRole} onChange={(event) => setProfessionalRole(event.target.value)} className="mt-2 h-11 bg-card" /></div>
                    <div><Label htmlFor="practice-name">Practice or business name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="practice-name" maxLength={200} value={practiceName} onChange={(event) => setPracticeName(event.target.value)} className="mt-2 h-11 bg-card" /></div>
                    <fieldset><legend className="text-sm font-medium">Your relationship to Bali</legend><div className="mt-3"><ChoiceGrid choices={relationshipChoices} selected={[draft.baliRelationship]} onToggle={(value) => { setError(""); setDraftValue("baliRelationship", value); }} /></div></fieldset>
                    <fieldset><legend className="text-sm font-medium">Primary area</legend><div className="mt-3"><ChoiceGrid choices={areaChoices} selected={[draft.area]} onToggle={(value) => { setError(""); setDraftValue("area", value); }} /></div></fieldset>
                    <div><Label htmlFor="location-detail">Location detail <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="location-detail" maxLength={200} value={locationDetail} onChange={(event) => setLocationDetail(event.target.value)} className="mt-2 h-11 bg-card" /></div>
                  </div>
                )}
                {step === "areas" && (
                  <><p className="mb-4 text-sm text-muted-foreground">Choose between one and five.</p><ChoiceGrid choices={practiceChoices} selected={draft.practiceAreas} onToggle={togglePractice} />{draft.practiceAreas.includes("other") && <div className="mt-6"><Label htmlFor="other-practice">Other practice</Label><Input id="other-practice" maxLength={100} value={otherPractice} onChange={(event) => setOtherPractice(event.target.value)} className="mt-2 h-11 bg-card" /></div>}</>
                )}
                {step === "experience" && (
                  <div className="space-y-7">
                    <div><Label htmlFor="experience-summary">Relevant experience</Label><Textarea id="experience-summary" minLength={50} maxLength={2_000} value={experienceSummary} onChange={(event) => setExperienceSummary(event.target.value)} placeholder="Share the experience, training, or approach most relevant to your work in Bali." className="mt-2 min-h-44 bg-card" /><p className="mt-2 text-xs leading-5 text-muted-foreground">Please do not include medical records or sensitive personal information.</p></div>
                    <div><Label htmlFor="website-url">Primary website or profile <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="website-url" type="url" inputMode="url" placeholder="https://" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} className="mt-2 h-11 bg-card" /></div>
                    <div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="additional-link-1">Additional link 1 <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="additional-link-1" type="url" inputMode="url" placeholder="https://" value={additionalLink1} onChange={(event) => setAdditionalLink1(event.target.value)} className="mt-2 h-11 bg-card" /></div><div><Label htmlFor="additional-link-2">Additional link 2 <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="additional-link-2" type="url" inputMode="url" placeholder="https://" value={additionalLink2} onChange={(event) => setAdditionalLink2(event.target.value)} className="mt-2 h-11 bg-card" /></div></div>
                  </div>
                )}
                {step === "contact" && (
                  <div className="space-y-6"><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="full-name">Full name</Label><Input id="full-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 h-11 bg-card" /></div><div><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 bg-card" /></div></div><fieldset><legend className="text-sm font-medium">Preferred contact</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{([{ value: "email", label: "Email", icon: Mail }, { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { value: "phone", label: "Phone", icon: Phone }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={contactPreference === value} onClick={() => { if (value === "email") setPhone(""); setContactPreference(value); }} className={cn("flex min-h-16 items-center gap-3 border px-4 text-left text-sm", contactPreference === value ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card")}><Icon className="size-4" />{label}</button>)}</div></fieldset>{contactPreference !== "email" && <div><Label htmlFor="phone">Phone or WhatsApp number</Label><Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-11 bg-card" /></div>}</div>
                )}
                {step === "review" && (
                  <div className="divide-y divide-border border border-border bg-card">
                    {reviewRows.map((row) => <div key={row.label} className="flex items-start justify-between gap-5 p-4 md:p-5"><div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{row.label}</p><p className="mt-2 break-words text-sm leading-6">{row.value}</p></div><button type="button" aria-label={`Edit ${row.label.toLowerCase()}`} onClick={() => { setError(""); setReturnToReview(true); setStep(row.edit); }} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"><Pencil className="size-3" /> Edit</button></div>)}
                    <div className="absolute -left-[9999px]" aria-hidden="true"><Label htmlFor="website">Website</Label><Input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
                    <label className="flex min-h-11 items-start gap-3 p-5 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-[var(--accent)]" /><span>I agree that The Solas Guide may use these details to respond to my expression of interest.</span></label>
                  </div>
                )}
              </div>
              <div className="mt-auto flex flex-col-reverse items-stretch justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-center">
                {index > 0 ? <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back</button> : <span className="text-xs text-muted-foreground">Takes a few minutes</span>}
                {step === "review" ? <Button type="button" onClick={submit} disabled={submitting} className="w-full sm:w-auto">{submitting ? "Sending…" : "Send expression of interest"}<ArrowRight /></Button> : <Button type="button" onClick={continueJourney} className="w-full sm:w-auto">{returnToReview ? "Return to review" : step === "contact" ? "Review your expression of interest" : "Continue"}<ArrowRight /></Button>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
