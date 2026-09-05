import Link from "next/link";
import { adminNavigation } from "@/components/admin/admin-navigation";
import { AdminMetricRow, AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import { getOperationalRecords } from "@/lib/admin/operational-actions";
import { getAdminPractitioners } from "@/lib/admin/practitioner-actions";
import {
  getFeaturedReadiness,
  getPractitionerLifecycle,
  getTaxonomyLifecycle,
} from "@/lib/admin/practitioner-cms";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

const destinations: Record<
  string,
  { description: string; href: string }
> = {
  Overview: {
    href: "/admin",
    description: "A quiet register of public records and private submissions.",
  },
  Practitioners: {
    href: "/admin/practitioners",
    description: "Listings, portraits, visibility, and featured order.",
  },
  "Pages & Content": {
    href: "/admin/content",
    description: "The public website pages. Editing is not in this release.",
  },
  Taxonomy: {
    href: "/admin/taxonomy",
    description: "The terms that describe practice, people, and place.",
  },
  "Customer Enquiries": {
    href: "/admin/customer-enquiries",
    description: "Private buyer submissions, workflow, and notes.",
  },
  "Practitioner Interest": {
    href: "/admin/practitioner-interest",
    description: "Private expressions of interest and review.",
  },
};

export default async function AdminOverviewPage() {
  const [practitioners, taxonomy, enquiries, interest] = await Promise.all([
    getAdminPractitioners(),
    getAdminTaxonomy(),
    getOperationalRecords("customer-enquiries"),
    getOperationalRecords("practitioner-interest"),
  ]);

  const practitionerRows = practitioners.data ?? [];
  const published = practitionerRows.filter(
    (record) => getPractitionerLifecycle(record) === "published",
  ).length;
  const featured = practitionerRows.filter(
    (record) => record.featured_position !== null,
  ).length;
  const featuredReadiness = getFeaturedReadiness(featured);
  const newEnquiries = (enquiries.data ?? []).filter(
    (record) => record.status === "new" && !record.archived_at,
  ).length;
  const newInterest = (interest.data ?? []).filter(
    (record) => record.status === "new" && !record.archived_at,
  ).length;
  const activeTerms = (taxonomy.data ?? []).filter(
    (record) => getTaxonomyLifecycle(record) === "active",
  ).length;

  const summaries: Record<string, string> = {
    Practitioners: practitioners.ok
      ? `${published} published · ${featuredReadiness.count} of ${featuredReadiness.required} featured`
      : "Could not load counts",
    Taxonomy: taxonomy.ok ? `${activeTerms} active terms` : "Could not load counts",
    "Customer Enquiries": enquiries.ok
      ? `${newEnquiries} new`
      : "Could not load counts",
    "Practitioner Interest": interest.ok
      ? `${newInterest} new`
      : "Could not load counts",
    "Pages & Content": "Read-only in this release",
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Overview"
        description="Public records, private submissions, and the terms that describe them."
      />
      <AdminMetricRow
        items={[
          {
            label: "Published practitioners",
            value: practitioners.ok ? published : "—",
            hint: "Changes appear on the public site when a published record is saved.",
          },
          {
            label: "Featured order",
            value: practitioners.ok
              ? `${featuredReadiness.count} / ${featuredReadiness.required}`
              : "—",
            hint: "Eight published practitioners are required before launch.",
          },
          {
            label: "New submissions",
            value:
              enquiries.ok && interest.ok ? newEnquiries + newInterest : "—",
            hint: "Buyer enquiries and practitioner interest still marked new.",
          },
        ]}
      />
      <nav aria-label="Administrator areas">
        <ul className="divide-y divide-border/80">
          {adminNavigation
            .filter((item) => item.title !== "Overview")
            .map((item) => {
              const copy = destinations[item.title];
              return (
                <li key={item.href}>
                  <Link
                    href={copy.href}
                    className="flex min-h-16 flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {copy.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {summaries[item.title]}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </AdminPage>
  );
}
