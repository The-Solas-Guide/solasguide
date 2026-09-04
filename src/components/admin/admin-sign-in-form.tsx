"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  requestAdminCode,
  verifyAdminCode,
} from "@/lib/admin/auth-actions";
import { initialAdminAuthState } from "@/lib/admin/auth-state";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

const RESEND_SECONDS = 60;

export function AdminSignInForm({
  nextPath,
  sessionExpired = false,
}: {
  nextPath: string;
  sessionExpired?: boolean;
}) {
  const [requestState, requestAction, requestPending] = useActionState(
    requestAdminCode,
    initialAdminAuthState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyAdminCode,
    initialAdminAuthState,
  );
  const [resendSeconds, setResendSeconds] = useState(0);

  const email = verifyState.email || requestState.email;
  const codeRequested = requestState.status === "code-sent";

  useEffect(() => {
    if (requestState.status !== "code-sent") return;
    toast.success("Sign-in code requested.");
    const timer = window.setTimeout(
      () => setResendSeconds(RESEND_SECONDS),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [requestState]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  if (!codeRequested) {
    return (
      <form action={requestAction}>
        <FieldGroup>
          {sessionExpired ? (
            <FieldDescription role="status">
              Your session expired. Request a new code to continue.
            </FieldDescription>
          ) : null}
          <Field data-invalid={requestState.status === "error" || undefined}>
            <FieldLabel htmlFor="admin-email">Email</FieldLabel>
            <Input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              aria-invalid={requestState.status === "error" || undefined}
              required
              autoFocus
            />
            <FieldDescription>
              We will send a six-digit sign-in code.
            </FieldDescription>
            <FieldError>{requestState.message}</FieldError>
          </Field>
          <Field>
            <Button type="submit" disabled={requestPending}>
              {requestPending ? <Spinner data-icon="inline-start" /> : null}
              {requestPending ? "Sending code" : "Send sign-in code"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  const differentEmailHref =
    nextPath === "/admin"
      ? "/admin/sign-in"
      : `/admin/sign-in?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="flex flex-col gap-6">
      <form action={verifyAction}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="nextPath" value={nextPath} />
        <FieldGroup>
          <Field>
            <FieldDescription role="status">
              {requestState.message}
            </FieldDescription>
          </Field>
          <Field data-invalid={verifyState.status === "error" || undefined}>
            <FieldLabel htmlFor="admin-code">Six-digit code</FieldLabel>
            <InputOTP
              id="admin-code"
              name="code"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-invalid={verifyState.status === "error" || undefined}
              required
              autoFocus
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot className="size-11" index={index} key={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldError>{verifyState.message}</FieldError>
          </Field>
          <Field>
            <Button type="submit" disabled={verifyPending}>
              {verifyPending ? <Spinner data-icon="inline-start" /> : null}
              {verifyPending ? "Checking code" : "Continue"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="flex flex-col items-start gap-2 text-sm">
        <form action={requestAction}>
          <input type="hidden" name="email" value={email} />
          <Button
            type="submit"
            variant="link"
            disabled={requestPending || resendSeconds > 0}
          >
            {resendSeconds > 0
              ? `Request another code in ${resendSeconds}s`
              : "Request another code"}
          </Button>
        </form>
        <Button asChild variant="link">
          <a href={differentEmailHref}>Use a different email</a>
        </Button>
      </div>
    </div>
  );
}
