import Link from "next/link";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-page";

const publicPages = [
  { href: "/", title: "Home", note: "Editorial introduction to the service." },
  {
    href: "/find-a-match",
    title: "Find a Match",
    note: "Buyer enquiry journey.",
  },
  {
    href: "/become-a-practitioner",
    title: "Become a Practitioner",
    note: "Practitioner interest journey.",
  },
  { href: "/privacy", title: "Privacy", note: "Approved privacy copy." },
  { href: "/terms", title: "Website terms", note: "Approved terms copy." },
] as const;

export default function ContentAdminPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Pages & Content"
        description="Website page editing is not part of this release. The live public pages remain below."
      />
      <AdminPanel
        title="Public page inventory"
        description={`${publicPages.length} website pages available to view.`}
      >
        <ul className="grid gap-3">
          {publicPages.map((page) => (
            <li
              key={page.href}
              className="flex min-h-20 flex-col justify-between gap-3 rounded-lg border border-border/80 bg-background px-4 py-3 sm:flex-row sm:items-center sm:gap-8"
            >
              <div className="min-w-0">
                <p className="font-medium">{page.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {page.note}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Public
                </span>
                <Link
                  href={page.href}
                  className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
                >
                  View page →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </AdminPage>
  );
}
