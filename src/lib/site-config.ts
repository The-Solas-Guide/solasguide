import type { Metadata } from "next";

const fallbackAppUrl = "http://localhost:3000";
const publicApexHostname = "solasguide.com";
const publicCanonicalHostname = "www.solasguide.com";

export const siteTitle = "The Solas Guide | Curated wellness experiences";
export const siteDescription =
  "The Solas Guide is a trusted guide to exceptional wellness practitioners across Southeast Asia.";

/** Resolve the configured public origin and keep the production host canonical. */
export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return new URL(fallbackAppUrl);

  try {
    const url = new URL(configured);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return new URL(fallbackAppUrl);
    }

    if (url.hostname === publicApexHostname) {
      url.hostname = publicCanonicalHostname;
    }
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return new URL(fallbackAppUrl);
  }
}

/** Build an absolute public URL without allowing query state into metadata URLs. */
export function getAbsoluteUrl(path: string) {
  const url = new URL(path, getAppUrl());
  url.search = "";
  url.hash = "";
  return url.toString();
}

export const homepageTitle = "The Solas Guide | Trusted wellness practitioners and programmes";
export const homepageDescription =
  "An independent editorial guide to exceptional wellness practitioners across Southeast Asia. We also design, staff and deliver wellness programmes for retreats, venues, travel advisors and professional groups.";

export const homepageMetadata: Metadata = {
  title: { absolute: homepageTitle },
  description: homepageDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homepageTitle,
    description: homepageDescription,
    url: "/",
    images: [
      {
        url: "/brand/solas-facebook.png",
        width: 1200,
        height: 630,
        alt: "The Solas Guide logo",
      },
    ],
  },
  twitter: {
    title: homepageTitle,
    description: homepageDescription,
    images: ["/brand/solas-facebook.png"],
  },
};
