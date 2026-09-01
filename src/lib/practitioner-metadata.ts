import type { Metadata } from "next";
import type { Practitioner } from "@/lib/practitioners";

const fallbackAppUrl = "http://localhost:3000";
const directoryDescription =
  "Explore the founding practitioners included in The Solas Guide and review the information listed for each practitioner.";

export type DiscoveryMetadataKind = "area" | "location";

export type DiscoveryMetadataTerm = {
  name: string;
  slug: string;
};

export type ProfilePageJsonLd = {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  name: string;
  url: string;
  mainEntity: {
    "@type": "Person";
    name: string;
    url: string;
    description?: string;
    image?: string;
    jobTitle?: string;
    knowsAbout?: readonly string[];
    sameAs?: readonly string[];
  };
};

/** Resolve the configured public origin, keeping local development usable. */
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
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return new URL(fallbackAppUrl);
  }
}

/** Build an absolute public URL without allowing route query state into canonicals. */
export function getAbsoluteUrl(path: string) {
  const url = new URL(path, getAppUrl());
  url.search = "";
  url.hash = "";
  return url.toString();
}

/** Keep only HTTPS links supplied by published profiles. */
export function safeExternalUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname &&
      !url.username &&
      !url.password
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function getPractitionerDescription(practitioner: Practitioner) {
  return (
    practitioner.summary?.trim() ||
    practitioner.about?.trim() ||
    practitioner.descriptor?.trim() ||
    "Explore this practitioner profile in The Solas Guide."
  );
}

function socialMetadata(
  title: string,
  description: string,
  url: string,
  type: "website" | "profile",
  image?: string,
  imageAlt?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const openGraphImage = image
    ? [{ url: image, alt: imageAlt ?? title }]
    : undefined;

  return {
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: "The Solas Guide",
      ...(openGraphImage ? { images: openGraphImage } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function getDirectoryMetadata(): Metadata {
  const url = getAbsoluteUrl("/practitioners");
  const social = socialMetadata("The Guide", directoryDescription, url, "website");

  return {
    title: "The Guide",
    description: directoryDescription,
    alternates: { canonical: url },
    ...social,
    robots: { index: true, follow: true },
  };
}

export function getPractitionerMetadata(practitioner: Practitioner): Metadata {
  const url = getAbsoluteUrl(`/practitioners/${encodeURIComponent(practitioner.slug)}`);
  const description = getPractitionerDescription(practitioner);
  const image = safeExternalUrl(practitioner.image);
  const social = socialMetadata(
    practitioner.name,
    description,
    url,
    "profile",
    image,
    practitioner.imageAlt,
  );

  return {
    title: practitioner.name,
    description,
    alternates: { canonical: url },
    ...social,
    robots: { index: true, follow: true },
  };
}

export function getDiscoveryMetadata(
  kind: DiscoveryMetadataKind,
  term: DiscoveryMetadataTerm,
): Metadata {
  const segment = kind === "area" ? "areas" : "locations";
  const description =
    kind === "area"
      ? "Explore practitioners whose published profiles include this area of support."
      : "Explore practitioners whose published profiles include this location.";
  const url = getAbsoluteUrl(
    `/practitioners/${segment}/${encodeURIComponent(term.slug)}`,
  );
  const social = socialMetadata(term.name, description, url, "website");

  return {
    title: term.name,
    description,
    alternates: { canonical: url },
    ...social,
    robots: { index: true, follow: true },
  };
}

export function getUnavailableMetadata(): Metadata {
  return {
    title: "Practitioner profile",
    description: "Explore practitioner profiles in The Solas Guide.",
    robots: { index: false, follow: false },
  };
}

export function getPractitionerJsonLd(
  practitioner: Practitioner,
): ProfilePageJsonLd {
  const url = getAbsoluteUrl(`/practitioners/${encodeURIComponent(practitioner.slug)}`);
  const image = safeExternalUrl(practitioner.image);
  const sameAs = [practitioner.websiteUrl, practitioner.instagramUrl]
    .map(safeExternalUrl)
    .filter((value): value is string => Boolean(value));
  const knowsAbout = [
    ...(practitioner.areasOfSupport ?? []),
    ...(practitioner.approaches ?? []),
    ...practitioner.modalities,
  ]
    .map((value) => value.trim())
    .filter((value, index, values) => value && values.indexOf(value) === index);
  const mainEntity: ProfilePageJsonLd["mainEntity"] = {
    "@type": "Person",
    name: practitioner.name,
    url,
    description: getPractitionerDescription(practitioner),
    ...(image ? { image } : {}),
    ...(practitioner.descriptor?.trim()
      ? { jobTitle: practitioner.descriptor.trim() }
      : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: practitioner.name,
    url,
    mainEntity,
  };
}
