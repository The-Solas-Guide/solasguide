import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlertIcon } from "lucide-react";
import { signOutAdmin } from "@/lib/admin/auth-actions";
import {
  getAuthenticatedUser,
  isAdminUser,
} from "@/lib/admin/authorization";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function UnauthorizedPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/admin/sign-in");
  if (await isAdminUser(user.id)) redirect("/admin");

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Alert>
          <ShieldAlertIcon />
          <AlertTitle>Administrator access required</AlertTitle>
          <AlertDescription>
            This account is not approved for the Solas Admin CMS.
          </AlertDescription>
        </Alert>
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
