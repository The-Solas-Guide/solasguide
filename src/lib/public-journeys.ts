export const browseTheGuide = {
  label: "Browse the Guide",
  href: "/practitioners",
} as const;

export const needHelpChoosing = {
  label: "Need Help Choosing?",
  href: "/find-a-match",
} as const;

export const makeAnEnquiry = {
  label: "Make an Enquiry",
  href: "/find-a-match?intent=professional",
} as const;

export const askSolas = {
  label: "Ask Solas",
} as const;

export function askSolasHref(practitionerName?: string) {
  if (!practitionerName?.trim()) return needHelpChoosing.href;
  return `${needHelpChoosing.href}?practitioner=${encodeURIComponent(practitionerName.trim())}`;
}

export function enquiryContextNote({
  practitionerName,
  intent,
}: {
  practitionerName?: string;
  intent?: string;
}) {
  const parts: string[] = [];
  if (intent === "professional") {
    parts.push("Professional / tailored enquiry.");
  }
  const name = practitionerName?.trim();
  if (name) {
    parts.push(`Interested in speaking with ${name}.`);
  }
  return parts.join(" ");
}

export function applyEnquiryContext(existing: string, note: string) {
  const current = existing.trim();
  if (!note) return current;
  if (current.includes(note)) return current;
  return current ? `${note} ${current}` : note;
}

export function formatAvailability(values: readonly string[]) {
  return values
    .map((value) => (value === "In-person" ? "In person" : value))
    .join(" · ");
}
