"use client";

import Link from "next/link";
import { use, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword } from "@/app/actions/auth";
import { CheckIcon } from "@/components/icons";
import { LogoLink } from "@/components/logo";
import {
  Button,
  ButtonLink,
  Container,
  Field,
  Section,
  cx,
  inputClass,
} from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
      {pending ? "Saving…" : "Set new password"}
    </Button>
  );
}

export default function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const params = use(props.searchParams);
  const token = typeof params.token === "string" ? params.token : "";
  const [state, action] = useActionState(resetPassword, null);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <LogoLink showTagline={false} height={38} priority />
            <h1 className="font-display mt-8 text-3xl font-bold uppercase tracking-tight">
              Choose a New Password
            </h1>
          </div>

          {state?.ok ? (
            <div className="mt-8 rounded-2xl border border-line bg-background p-8 text-center shadow-card">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckIcon className="size-7" />
              </span>
              <h2 className="font-display mt-5 text-xl font-bold uppercase">
                Password changed
              </h2>
              <p className="mt-3 text-sm text-muted">{state.message}</p>
              <ButtonLink href="/login" className="mt-6 w-full" size="lg">
                Sign in
              </ButtonLink>
            </div>
          ) : !token ? (
            <div className="mt-8 rounded-2xl border border-line bg-background p-8 text-center shadow-card">
              <p className="text-sm text-muted">
                This page needs a reset link from your email.
              </p>
              <ButtonLink href="/forgot-password" className="mt-6 w-full" size="lg">
                Request a reset link
              </ButtonLink>
            </div>
          ) : (
            <form
              action={action}
              className="mt-8 rounded-2xl border border-line bg-background p-6 shadow-card sm:p-8"
            >
              <input type="hidden" name="token" value={token} />

              {state?.ok === false && (
                <p
                  role="alert"
                  className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
                >
                  {state.error}
                </p>
              )}

              <div className="space-y-5">
                <Field
                  label="New password"
                  htmlFor="rp-password"
                  required
                  hint={fieldError("password") ?? "At least 8 characters."}
                >
                  <input
                    id="rp-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={cx(
                      inputClass,
                      fieldError("password") && "border-signal-500",
                    )}
                  />
                </Field>

                <Field
                  label="Confirm password"
                  htmlFor="rp-confirm"
                  required
                  hint={fieldError("confirm")}
                >
                  <input
                    id="rp-confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={cx(
                      inputClass,
                      fieldError("confirm") && "border-signal-500",
                    )}
                  />
                </Field>
              </div>

              <SubmitButton />
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
