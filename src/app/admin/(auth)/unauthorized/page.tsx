import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAdmin } from "@/lib/admin/auth-actions";
import {
  getAuthenticatedUser,
  isAdminUser,
} from "@/lib/admin/authorization";
import { Button } from "@/components/ui/button";

export default async function UnauthorizedPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/admin/sign-in");
  if (await isAdminUser(user.id)) redirect("/admin");

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="admin-title">Access not available</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This account is not approved for the Solas administrator desk.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={signOutAdmin}>
            <Button type="submit">Sign out</Button>
          </form>
          <Button asChild variant="outline">
            <Link href="/">Return to website</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
