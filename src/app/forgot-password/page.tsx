"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/app/actions/auth";
import { CheckIcon, MailIcon } from "@/components/icons";
import { LogoLink } from "@/components/logo";
import {
  Button,
  ButtonLink,
  Container,
  Field,
  Section,
  inputClass,
} from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
      <MailIcon className="size-4" />
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <LogoLink showTagline={false} height={38} priority />
            <h1 className="font-display mt-8 text-3xl font-bold uppercase tracking-tight">
              Reset Your Password
            </h1>
            <p className="mt-2 text-sm text-muted">
              We&apos;ll email you a link to set a new one.
            </p>
          </div>

          {state?.ok ? (
            <div className="mt-8 rounded-2xl border border-line bg-background p-8 text-center shadow-card">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckIcon className="size-7" />
              </span>
              <h2 className="font-display mt-5 text-xl font-bold uppercase">
                Check your inbox
              </h2>
              <p className="mt-3 text-sm text-muted">{state.message}</p>
              <ButtonLink href="/login" className="mt-6 w-full" size="lg">
                Back to sign in
              </ButtonLink>
            </div>
          ) : (
            <form
              action={action}
              className="mt-8 rounded-2xl border border-line bg-background p-6 shadow-card sm:p-8"
            >
              {state?.ok === false && (
                <p
                  role="alert"
                  className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
                >
                  {state.error}
                </p>
              )}

              <Field label="Email address" htmlFor="fp-email" required>
                <input
                  id="fp-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@company.co.zw"
                />
              </Field>

              <SubmitButton />

              <p className="mt-6 text-center text-sm text-muted">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-signal-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
