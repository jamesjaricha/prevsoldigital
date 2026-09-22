"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/app/actions/auth";
import { LockIcon } from "@/components/icons";
import { LogoLink } from "@/components/logo";
import { Button, Container, Field, Section, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(signIn, null);

  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <LogoLink showTagline={false} height={38} priority />
            <h1 className="font-display mt-8 text-3xl font-bold uppercase tracking-tight">
              Client Login
            </h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to manage your services, invoices and support tickets.
            </p>
          </div>

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

            <div className="space-y-5">
              <Field label="Email address" htmlFor="login-email" required>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@company.co.zw"
                />
              </Field>

              <Field label="Password" htmlFor="login-password" required>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </Field>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-signal-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <SubmitButton />
            </div>

            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-signal-600 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <LockIcon className="size-3.5" />
            Your connection to this portal is encrypted.
          </p>
        </div>
      </Container>
    </Section>
  );
}
