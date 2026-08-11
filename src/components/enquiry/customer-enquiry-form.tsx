"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Pencil } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FormChoiceCard } from "@/components/forms/form-choice-card";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
  customerQuestionnaireOptions,
  customerQuestionnaireQuestions,
  isValidWhatsappNumber,
} from "@/lib/enquiries/customer-questionnaire";
import { cn } from "@/lib/utils";

type JourneyStep = "q1" | "q2" | "q3" | "q4" | "q5" | "contact" | "review";
type Choice = { value: string; label: string };
type Draft = {
  submissionToken: string;
  q1: string;
  q2: string;
  q3: string[];
  q4: string;
  q5: string;
};

const steps: { key: JourneyStep; eyebrow: string; title: string }[] = [
  ...customerQuestionnaireQuestions.map((question, index) => ({
    key: question.key,
    eyebrow: `Question ${index + 1}`,
    title: question.title,
  })),
  { key: "contact", eyebrow: "Your details", title: "How can we contact you?" },
  { key: "review", eyebrow: "Review", title: "Check your enquiry before sending it." },
];
const DRAFT_KEY = "solas-customer-enquiry-draft-v3";
const LEGACY_DRAFT_KEY = "solas-customer-enquiry-draft-v2";
const TAB_ID_KEY = "solas-customer-enquiry-tab-id";
const TAB_NAME_PREFIX = "solas-customer-enquiry:";
const CHANGED_SUBMISSION_ERROR = "This enquiry was already saved with different details. Please start a new enquiry.";

function createSubmissionToken() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function emptyDraft(): Draft {
  return {
    submissionToken: createSubmissionToken(),
    q1: "",
    q2: "",
    q3: [],
    q4: "",
    q5: "",
  };
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Partial<Draft>;
  return typeof draft.submissionToken === "string" &&
    typeof draft.q1 === "string" &&
    typeof draft.q2 === "string" &&
    Array.isArray(draft.q3) &&
    draft.q3.every((item) => typeof item === "string") &&
    typeof draft.q4 === "string" &&
    typeof draft.q5 === "string";
}

function initialDraft(): Draft {
  if (typeof window === "undefined") {
    return {
      submissionToken: "00000000-0000-4000-8000-000000000000",
      q1: "",
      q2: "",
      q3: [],
      q4: "",
      q5: "",
    };
  }
  try {
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    const storedTabId = sessionStorage.getItem(TAB_ID_KEY);
    const windowTabId = window.name.startsWith(TAB_NAME_PREFIX)
      ? window.name.slice(TAB_NAME_PREFIX.length)
      : null;
    const tabId = storedTabId && storedTabId === windowTabId
      ? storedTabId
      : createSubmissionToken();
    sessionStorage.setItem(TAB_ID_KEY, tabId);
    window.name = `${TAB_NAME_PREFIX}${tabId}`;
    if (storedTabId && storedTabId !== windowTabId) {
      sessionStorage.removeItem(DRAFT_KEY);
      return emptyDraft();
    }
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") as unknown;
    if (isDraft(saved)) return saved;
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* Start fresh when a browser draft cannot be read. */
  }
  return emptyDraft();
}

function ChoiceGrid({
  choices,
  selected,
  onToggle,
  selectionType,
  name,
  label,
}: {
  choices: readonly Choice[];
  selected: string[];
  onToggle: (value: string) => void;
  selectionType: "radio" | "checkbox";
  name: string;
  label: string;
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role={selectionType === "radio" ? "radiogroup" : "group"}
      aria-label={label}
    >
      {choices.map((choice) => (
        <FormChoiceCard
          key={choice.value}
          label={choice.label}
          value={choice.value}
          name={name}
          selectionType={selectionType}
          selected={selected.includes(choice.value)}
          onClick={() => onToggle(choice.value)}
        />
      ))}
    </div>
  );
}

function labelFor(value: string, choices: readonly Choice[]) {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}

function labels(values: string[], choices: readonly Choice[]) {
  return values.map((value) => labelFor(value, choices)).join(", ") || "Nothing selected";
}

export function CustomerEnquiryForm() {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [step, setStep] = useState<JourneyStep>("q1");
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenConflict, setTokenConflict] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const draftStorageActive = useRef(true);

  useEffect(() => {
    if (!draftStorageActive.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* The form remains usable when browser storage is unavailable. */
    }
  }, [draft]);
  useEffect(() => {
    if (hydrated) headingRef.current?.focus({ preventScroll: true });
  }, [hydrated, step, submitted]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  if (!hydrated) return <main className="min-h-screen bg-muted/40" aria-busy="true" />;

  const index = steps.findIndex((item) => item.key === step);
  const copy = steps[index];
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function toggleQuestion(value: string) {
    const current = draft.q3;
    setError("");
    set("q3", current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function selectQuestion(key: "q1" | "q2" | "q4", value: string) {
    setError("");
    set(key, value);
  }

  function validateCurrent() {
    if (step === "q1" && !draft.q1) return "Choose what brings you to The Solas Guide today.";
    if (step === "q2" && !draft.q2) return "Choose who you are looking for.";
    if (step === "q3" && draft.q3.length < 1) return "Choose at least one area.";
    if (step === "q4" && !draft.q4) return "Choose when you hope to connect.";
    if (step === "contact") {
      if (!name.trim()) return "Enter your name.";
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
      if (!isValidWhatsappNumber(whatsapp.trim())) return "Add a valid WhatsApp number.";
    }
    return "";
  }

  function continueJourney() {
    if (!started.current) {
      track("enquiry_started");
      started.current = true;
    }
    const message = validateCurrent();
    if (message) return setError(message);
    setError("");
    track("enquiry_step_completed", { step_id: step, step_number: index + 1 });
    if (returnToReview) {
      setReturnToReview(false);
      setStep("review");
      return;
    }
    setStep(steps[index + 1].key);
  }

  function goBack() {
    setError("");
    if (index > 0) setStep(steps[index - 1].key);
  }

  function startNewEnquiry() {
    draftStorageActive.current = true;
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* Storage may be unavailable. */
    }
    setDraft(emptyDraft());
    setStep("q1");
    setName("");
    setEmail("");
    setWhatsapp("");
    setConsent(false);
    setError("");
    setTokenConflict(false);
    setReturnToReview(false);
    setWebsite("");
    setStartedAt(Date.now());
    started.current = false;
  }

  async function submit() {
    if (!consent) {
      setError("Confirm that we may use these details to respond to your enquiry.");
      return;
    }
    setSubmitting(true);
    setError("");
    setTokenConflict(false);
    try {
      const response = await fetch("/api/enquiries/customer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionToken: draft.submissionToken,
          startedAt,
          website,
          fullName: name,
          email,
          phone: whatsapp,
          contactPreference: "whatsapp",
          consentConfirmed: consent,
          answers: {
            formVersion: CUSTOMER_QUESTIONNAIRE_FORM_VERSION,
            q1: draft.q1,
            q2: draft.q2,
            q3: draft.q3,
            q4: draft.q4,
            q5: draft.q5,
          },
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        if (response.status === 409 && result.error === CHANGED_SUBMISSION_ERROR) setTokenConflict(true);
        throw new Error(result.error || "We could not send your enquiry.");
      }
      try {
        draftStorageActive.current = false;
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* Storage may be unavailable. */
      }
      track("enquiry_submitted");
      setSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not send your enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center overflow-x-hidden bg-muted/40 px-5 py-16">
        <section className="mx-auto w-full max-w-2xl rounded-md border border-border bg-card p-8 md:p-12" role="status">
          <Check className="size-8 text-accent" aria-hidden="true" />
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">Enquiry received</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-4xl leading-tight outline-none md:text-5xl">Thank you. We will take it from here.</h1>
          <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
            We will review what you shared personally and respond within two business days. If there is a relevant direction, we will explain it and help facilitate the right introductions.
          </p>
          <Button asChild className="mt-8 w-full sm:w-auto">
            <Link href="/">Return to The Solas Guide</Link>
          </Button>
        </section>
      </main>
    );
  }

  const reviewRows = [
    { label: "What brings you here", value: labelFor(draft.q1, customerQuestionnaireOptions.q1), edit: "q1" as JourneyStep },
    { label: "Who you are looking for", value: labelFor(draft.q2, customerQuestionnaireOptions.q2), edit: "q2" as JourneyStep },
    { label: "What you hope this helps with", value: labels(draft.q3, customerQuestionnaireOptions.q3), edit: "q3" as JourneyStep },
    { label: "When you hope to connect", value: labelFor(draft.q4, customerQuestionnaireOptions.q4), edit: "q4" as JourneyStep },
    { label: "Anything else", value: draft.q5 || "Nothing added", edit: "q5" as JourneyStep },
    { label: "Contact details", value: `${name} — ${email} — WhatsApp: ${whatsapp}`, edit: "contact" as JourneyStep },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-muted/40 px-3 py-3 md:px-5 md:py-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-1 pb-5">
          <Link href="/" className="font-display text-xl tracking-tight sm:text-2xl">
            The Solas Guide
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" /> Back to the guide
          </Link>
        </div>

        <section className="mt-3 flex min-h-[700px] flex-col md:mt-0 md:h-[min(920px,calc(100vh-128px))]">
          <div className="mb-3 bg-transparent">
            <div
              role="progressbar"
              aria-label="Enquiry progress"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={index + 1}
            >
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Step {index + 1} of {steps.length}</span>
                <span className="text-right">{copy.eyebrow}</span>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 border border-border bg-background md:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]">
            <aside
              className={cn(
                "relative min-h-56 overflow-hidden bg-foreground text-background sm:min-h-64",
                step !== "q1" && "hidden md:block",
              )}
            >
              <Image
                src="/images/solas-imagery/why-solas-planning.png"
                alt="A quiet planning table in a Balinese interior"
                fill
                loading="eager"
                className="object-cover opacity-50"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-foreground/45" />
              <div className="relative flex min-h-56 flex-col justify-end p-5 sm:min-h-64 sm:p-6 md:min-h-full md:justify-start md:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/65">Your next step</p>
                <p className="mt-4 max-w-xs font-display text-2xl leading-tight text-balance sm:mt-5 sm:text-3xl md:text-4xl">
                  Start with what matters to you.
                </p>
              </div>
            </aside>

            <div className="scrollbar-none flex min-h-0 flex-col overflow-y-auto p-5 sm:p-6 md:p-8 lg:p-10">
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="max-w-xl font-display text-xl leading-tight text-balance outline-none md:text-3xl"
              >
                {copy.title}
              </h1>
              {error && (
                <div ref={errorRef} tabIndex={-1} className="outline-none">
                  <FormFeedback
                    tone="error"
                    title="A little more detail is needed"
                    description={error}
                    className="mt-6"
                  />
                  {tokenConflict && (
                    <Button type="button" variant="outline" onClick={startNewEnquiry} className="mt-3 w-full sm:w-auto">
                      Start a new enquiry
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-7">
                {step === "q1" && (
                  <ChoiceGrid
                    choices={customerQuestionnaireOptions.q1}
                    selected={draft.q1 ? [draft.q1] : []}
                    onToggle={(value) => selectQuestion("q1", value)}
                    selectionType="radio"
                    name="q1"
                    label={customerQuestionnaireQuestions[0].title}
                  />
                )}
                {step === "q2" && (
                  <ChoiceGrid
                    choices={customerQuestionnaireOptions.q2}
                    selected={draft.q2 ? [draft.q2] : []}
                    onToggle={(value) => selectQuestion("q2", value)}
                    selectionType="radio"
                    name="q2"
                    label={customerQuestionnaireQuestions[1].title}
                  />
                )}
                {step === "q3" && (
                  <>
                    <p className="mb-4 text-sm text-muted-foreground">Select all that apply.</p>
                    <ChoiceGrid
                      choices={customerQuestionnaireOptions.q3}
                      selected={draft.q3}
                      onToggle={toggleQuestion}
                      selectionType="checkbox"
                      name="q3"
                      label={customerQuestionnaireQuestions[2].title}
                    />
                  </>
                )}
                {step === "q4" && (
                  <ChoiceGrid
                    choices={customerQuestionnaireOptions.q4}
                    selected={draft.q4 ? [draft.q4] : []}
                    onToggle={(value) => selectQuestion("q4", value)}
                    selectionType="radio"
                    name="q4"
                    label={customerQuestionnaireQuestions[3].title}
                  />
                )}
                {step === "q5" && (
                  <div>
                    <Label htmlFor="q5">
                      Anything else <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="q5"
                      maxLength={3_000}
                      value={draft.q5}
                      onChange={(event) => set("q5", event.target.value)}
                      placeholder="Share anything else that would help us understand your enquiry."
                      className="mt-3 min-h-40 bg-card"
                    />
                  </div>
                )}
                {step === "contact" && (
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        required
                        aria-required="true"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2 bg-card"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        aria-required="true"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2 bg-card"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        autoComplete="tel"
                        required
                        aria-required="true"
                        value={whatsapp}
                        onChange={(event) => setWhatsapp(event.target.value)}
                        className="mt-2 bg-card"
                      />
                    </div>
                  </div>
                )}
                {step === "review" && (
                  <div className="divide-y divide-border rounded-md border border-border bg-card">
                    {reviewRows.map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-5 p-4 md:p-5">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{row.label}</p>
                          <p className="mt-2 text-sm leading-6">{row.value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReturnToReview(true);
                            setStep(row.edit);
                          }}
                          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Pencil className="size-3" aria-hidden="true" /> Edit
                        </button>
                      </div>
                    ))}
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                      />
                    </div>
                    <label className="flex items-start gap-3 p-5 text-xs leading-relaxed text-muted-foreground">
                      <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                      />
                      <span>I agree that The Solas Guide may use these details to respond to my enquiry.</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:gap-5 sm:pt-7">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" /> Back
                  </button>
                ) : (
                  <span className="inline-flex min-h-11 items-center text-xs text-muted-foreground">
                    Takes about two minutes
                  </span>
                )}
                {step === "review" ? (
                  <Button type="button" onClick={submit} disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? "Sending…" : "Send enquiry"}
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button type="button" onClick={continueJourney} className="w-full sm:w-auto">
                    {step === "contact" ? "Review your enquiry" : "Continue"}
                    <ArrowRight />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
