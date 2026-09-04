"use client";

import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>The admin page could not load</AlertTitle>
          <AlertDescription>
            Try again. If the problem continues, check the Supabase connection.
          </AlertDescription>
        </Alert>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
