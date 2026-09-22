"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/actions/auth";
import { LogoLink } from "@/components/logo";
import { Button, Container, Field, Section, cx, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creating your account…" : "Create Account"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, action] = useActionState(register, null);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <LogoLink showTagline={false} height={38} priority />
            <h1 className="font-display mt-8 text-3xl font-bold uppercase tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage your services, invoices and support in one place.
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

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                htmlFor="reg-name"
                required
                hint={fieldError("name")}
                className="sm:col-span-2"
              >
                <input
                  id="reg-name"
                  name="name"
                  required
                  autoComplete="name"
                  className={cx(inputClass, fieldError("name") && "border-signal-500")}
                />
              </Field>

              <Field label="Email address" htmlFor="reg-email" required hint={fieldError("email")}>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={cx(inputClass, fieldError("email") && "border-signal-500")}
                  placeholder="you@company.co.zw"
                />
              </Field>

              <Field label="Phone number" htmlFor="reg-phone" required hint={fieldError("phone")}>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className={cx(inputClass, fieldError("phone") && "border-signal-500")}
                  placeholder="+263 …"
                />
              </Field>

              <Field label="Company" htmlFor="reg-company">
                <input
                  id="reg-company"
                  name="company"
                  autoComplete="organization"
                  className={inputClass}
                />
              </Field>

              <Field label="Address" htmlFor="reg-address">
                <input
                  id="reg-address"
                  name="address"
                  autoComplete="street-address"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Password"
                htmlFor="reg-password"
                hint={fieldError("password") ?? "At least 8 characters."}
                required
              >
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={cx(inputClass, fieldError("password") && "border-signal-500")}
                />
              </Field>

              <Field
                label="Confirm password"
                htmlFor="reg-confirm"
                required
                hint={fieldError("confirm")}
              >
                <input
                  id="reg-confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={cx(inputClass, fieldError("confirm") && "border-signal-500")}
                />
              </Field>

              <label className="flex items-start gap-2.5 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 size-4 rounded accent-signal-600"
                />
                <span className="text-muted">
                  I agree to the{" "}
                  <Link
                    href="/legal/terms"
                    className="font-semibold text-signal-600 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/privacy"
                    className="font-semibold text-signal-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <div className="mt-7">
              <SubmitButton />
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-signal-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  );
}
