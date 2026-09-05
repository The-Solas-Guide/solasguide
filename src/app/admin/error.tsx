"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col gap-5">
        <div>
          <h1 className="admin-title">This page could not load</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Try again. If the problem continues, contact your website administrator.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>The admin page could not load</AlertTitle>
          <AlertDescription>
            The page is temporarily unavailable.
          </AlertDescription>
        </Alert>
        <Button type="button" onClick={reset} className="self-start">
          Try again
        </Button>
      </div>
    </main>
  );
}
