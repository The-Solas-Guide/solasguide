import { redirect } from "next/navigation";
import Image from "next/image";
import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";
import {
  getAuthenticatedUser,
  isAdminUser,
} from "@/lib/admin/authorization";
import { getSafeAdminReturnPath } from "@/lib/admin/return-path";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;
  const nextPath = getSafeAdminReturnPath(next);
  const user = await getAuthenticatedUser();

  if (user) {
    redirect((await isAdminUser(user.id)) ? nextPath : "/admin/unauthorized");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-8 md:px-10">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6">
          <Image
            src="/brand/solas-logo-4-pebble.png"
            alt="The Solas Guide"
            width={1600}
            height={606}
            priority
            className="h-auto w-[156px]"
          />
          <div className="max-w-sm">
            <h1 className="admin-title">Sign in</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Request a six-digit code for an approved administrator email.
            </p>
          </div>
        </div>
        <AdminSignInForm
          nextPath={nextPath}
          sessionExpired={reason === "expired"}
        />
      </div>
    </main>
  );
}
