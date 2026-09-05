import Link from "next/link";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";

const publicPages = [
  { href: "/", title: "Home", note: "Editorial introduction to the service." },
  { href: "/find-a-match", title: "Find a Match", note: "Buyer enquiry journey." },
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
    <AdminPage width="form">
      <AdminPageHeader
        title="Pages & Content"
        description="Website page editing is not part of this release. The live public pages remain below."
      />
      <ul className="divide-y divide-border/80">
        {publicPages.map((page) => (
          <li
            key={page.href}
            className="flex min-h-16 flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <div className="min-w-0">
              <p className="font-medium">{page.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{page.note}</p>
            </div>
            <Link
              href={page.href}
              className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
            >
              View public page
            </Link>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
