import Link from "next/link";
import {
  AdminMetricRow,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-page";
import { getOperationalRecords } from "@/lib/admin/operational-actions";
import { getAdminPractitioners } from "@/lib/admin/practitioner-actions";
import {
  getFeaturedReadiness,
  getPractitionerLifecycle,
  getTaxonomyLifecycle,
} from "@/lib/admin/practitioner-cms";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

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

  const recentSubmissions = [
    ...(enquiries.ok ? enquiries.data ?? [] : []).map((record) => ({ ...record, area: "customer-enquiries", label: "Customer enquiry" })),
    ...(interest.ok ? interest.data ?? [] : []).map((record) => ({ ...record, area: "practitioner-interest", label: "Practitioner interest" })),
  ].filter((record) => record.status === "new" && !record.archived_at)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .slice(0, 4);

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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start">
        <AdminPanel
          title="Needs attention"
          description="Start with private submissions, then return to public records when the queue is clear."
        >
          <div className="grid divide-y">
            {[
              {
                href: "/admin/customer-enquiries?status=new&filter.archive=active",
                label: "Customer enquiries",
                value: enquiries.ok ? newEnquiries : "Unknown",
                note: "New buyer submissions",
              },
              {
                href: "/admin/practitioner-interest?status=new&filter.archive=active",
                label: "Practitioner interest",
                value: interest.ok ? newInterest : "Unknown",
                note: "New practitioner submissions",
              },
            ].map((queue) => (
              <Link
                key={queue.href}
                href={queue.href}
                className="group flex min-h-20 items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block font-medium">{queue.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {queue.note}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-2xl font-semibold tabular-nums tracking-tight">
                    {queue.value}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">
                    Review queue →
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {recentSubmissions.length > 0 ? (
            <div className="border-t pt-4">
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Latest new submissions</h3>
              <ul className="divide-y">
                {recentSubmissions.map((record) => (
                  <li key={`${record.area}-${record.id}`}>
                    <Link href={`/admin/${record.area}/${record.id}`} className="flex min-h-14 items-center justify-between gap-4 py-2 text-sm hover:text-primary">
                      <span className="min-w-0 truncate font-medium">{record.full_name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{record.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </AdminPanel>
        <AdminPanel
          title="Publication readiness"
          description="A quick view of the public catalogue before you open a record."
        >
          <div className="grid gap-3">
            {[
              {
                label: "Featured order",
                value: practitioners.ok
                  ? `${featuredReadiness.count} / ${featuredReadiness.required}`
                  : "Unknown",
                href: "/admin/practitioners",
              },
              {
                label: "Active taxonomy",
                value: taxonomy.ok ? activeTerms : "Unknown",
                href: "/admin/taxonomy?status=active",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-border/80 bg-background px-4 py-3 hover:border-foreground/30"
              >
                <span className="block text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="mt-1 block text-2xl font-semibold tabular-nums tracking-tight">
                  {item.value}
                </span>
                {item.label === "Featured order" ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {practitioners.ok
                      ? featuredReadiness.ready
                        ? "Launch requirement met."
                        : `${featuredReadiness.required - featuredReadiness.count} more featured records needed.`
                      : "Practitioner readiness could not be checked."}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </AdminPanel>
      </div>

    </AdminPage>
  );
}
