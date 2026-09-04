import { redirect } from "next/navigation";
import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
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
    <main className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <BrandWordmark caption="Admin CMS" className="p-0" priority />
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-4xl">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage The Solas Guide.
          </p>
        </div>
        <AdminSignInForm
          nextPath={nextPath}
          sessionExpired={reason === "expired"}
        />
      </div>
    </main>
  );
}
