"use client";

import { track } from "@vercel/analytics";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormFeedback } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { programmeExperienceOptions } from "@/lib/enquiries/programme-enquiry";

const fieldClass = "min-h-12 bg-card";
const buttonClass = "min-h-[58px] w-full gap-5 border-2 bg-accent px-6 text-sm normal-case tracking-normal text-accent-foreground hover:bg-accent/90 sm:w-auto";

export function ProgrammeEnquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const token = useRef<string | null>(null);
  const started = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error || submitted) feedback.current?.focus();
  }, [error, submitted]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || conflict) return;
    const values = new FormData(event.currentTarget);
    token.current ??= crypto.randomUUID();
    const payload = {
      submissionToken: token.current,
      startedAt,
      website: String(values.get("website") || ""),
      fullName: String(values.get("fullName") || ""),
      email: String(values.get("email") || ""),
      organisation: String(values.get("organisation") || ""),
      experience: String(values.get("experience") || ""),
      dates: String(values.get("dates") || ""),
      intention: String(values.get("intention") || ""),
      consentConfirmed: values.get("consentConfirmed") === "on",
    };
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/enquiries/programme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setConflict(response.status === 409);
        throw new Error(result.error || "We could not send your enquiry. Please try again.");
      }
      setSubmitted(true);
      track("enquiry_submitted", { source: "programme" });
    } catch (failure) {
      setError(failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "We could not send your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div ref={feedback} tabIndex={-1} className="p-6 outline-none sm:p-8">
        <FormFeedback
          tone="success"
          title="Thank you. Your enquiry is with us."
          description="We’ll contact you to arrange a conversation about your programme and how we can help."
        />
      </div>
    );
  }

  return (
    <form
      aria-label="Programme enquiry"
      aria-describedby="programme-privacy"
      className="bg-muted/60 p-5 sm:p-8"
      onSubmit={submit}
      onChange={() => {
        if (!started.current) {
          started.current = true;
          track("enquiry_started", { source: "programme" });
        }
      }}
    >
      <fieldset disabled={submitting} className="grid min-w-0 gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="programme-name">Your name</Label>
          <Input id="programme-name" name="fullName" autoComplete="name" required maxLength={200} placeholder="Full name" className={fieldClass} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="programme-email">Email address</Label>
          <Input id="programme-email" name="email" type="email" autoComplete="email" required maxLength={320} placeholder="you@example.com" className={fieldClass} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="programme-organisation">Organisation <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="programme-organisation" name="organisation" autoComplete="organization" maxLength={200} placeholder="Company, retreat or group name" className={fieldClass} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="programme-experience">What are you planning?</Label>
          <select id="programme-experience" name="experience" required defaultValue="" className="min-h-12 w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-base focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:text-sm">
            <option value="" disabled>Select an experience</option>
            {programmeExperienceOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="programme-dates">When are you thinking?</Label>
          <Input id="programme-dates" name="dates" maxLength={200} placeholder="Dates, a month, or still exploring" className={fieldClass} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="programme-intention">What would you like your group to take away?</Label>
          <Textarea id="programme-intention" name="intention" required maxLength={3000} rows={5} placeholder="Tell us your group size and what you want participants to get from the experience." className="bg-card" />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="programme-website">Website</label>
          <input id="programme-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
          <input name="consentConfirmed" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" />
          <span>I agree that The Solas Guide may contact me about this enquiry.</span>
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={submitting || conflict} className={buttonClass}>
            {submitting ? "Sending…" : "Start a conversation"}<ArrowUpRight aria-hidden="true" />
          </Button>
          <p id="programme-privacy" className="mt-4 text-xs leading-relaxed text-muted-foreground">
            We use your details to respond to your enquiry. Read our <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link>.
          </p>
        </div>
      </fieldset>
      {error && (
        <div ref={feedback} tabIndex={-1} className="mt-6 outline-none">
          <FormFeedback tone="error" title="Your enquiry needs attention" description={error} />
          {conflict && (
            <Button type="button" variant="outline" className="mt-4 min-h-12 normal-case tracking-normal" onClick={() => {
              token.current = null;
              setConflict(false);
              setError("");
            }}>Start a new enquiry with these details</Button>
          )}
        </div>
      )}
    </form>
  );
}
