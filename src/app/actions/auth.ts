"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  audit,
  consumeToken,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  issueToken,
  nextClientRef,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPasswordReset, sendWelcome } from "@/lib/email";
import type { ActionResult } from "./enquiries";

/**
 * Authentication actions.
 *
 * Deliberate choices worth noting:
 *  - Sign-in failures never say whether the email exists (no account enumeration).
 *  - Password reset always reports success, for the same reason.
 *  - A dummy hash is verified on unknown emails so the response time does not
 *    reveal whether an account exists.
 */

/** Argon2id hash of a random string, used to equalise timing. */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$J8xDT0oCFxV9C1V1H8bYlU1nGkZq6mM0v6Y0mHqJ8pM";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Enter your email address and password." };
  }

  const { email, password } = parsed.data;

  const user = await db.user
    .findUnique({ where: { email } })
    .catch(() => null);

  // Always run a verification so timing does not leak account existence.
  const valid = user
    ? await verifyPassword(user.passwordHash, password)
    : (await verifyPassword(DUMMY_HASH, password), false);

  if (!user || !valid) {
    await audit("auth.signin.failed", { detail: email });
    return { ok: false, error: "Those credentials do not match an account." };
  }

  await createSession(user.id);
  await audit("auth.signin", { userId: user.id });

  redirect("/portal");
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please give your full name.").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    phone: z.string().trim().min(6, "Please give a contact number.").max(40),
    company: z.string().trim().max(160).optional(),
    address: z.string().trim().max(240).optional(),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(200, "That password is too long."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Those passwords do not match.",
    path: ["confirm"],
  });

export async function register(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  const existing = await db.user
    .findUnique({ where: { email: data.email }, select: { id: true } })
    .catch(() => null);

  if (existing) {
    return {
      ok: false,
      error: "An account already exists for that email address. Try signing in.",
    };
  }

  let userId: string;
  let clientRef: string;

  try {
    clientRef = await nextClientRef();
    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash: await hashPassword(data.password),
        name: data.name,
        phone: data.phone,
        company: data.company || null,
        address: data.address || null,
        clientRef,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    console.error("[register] could not create account:", error);
    return { ok: false, error: "Could not create your account just now." };
  }

  await createSession(userId);
  await audit("auth.register", { userId });
  await sendWelcome({ name: data.name, email: data.email, clientRef });

  redirect("/portal");
}

export async function signOut() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit("auth.signout", { userId: user.id });
  redirect("/");
}

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const user = await db.user
    .findUnique({ where: { email: parsed.data.email } })
    .catch(() => null);

  // Only send when the account exists, but always report the same outcome so
  // this endpoint cannot be used to discover which addresses are registered.
  if (user) {
    const token = await issueToken(user.id, "PASSWORD_RESET", 60);
    await sendPasswordReset({ name: user.name, email: user.email, token });
    await audit("auth.reset.requested", { userId: user.id });
  }

  return {
    ok: true,
    message:
      "If an account exists for that address, we have sent a reset link. It expires in one hour.",
  };
}

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Use at least 8 characters.").max(200),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Those passwords do not match.",
    path: ["confirm"],
  });

export async function resetPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const userId = await consumeToken(parsed.data.token, "PASSWORD_RESET");
  if (!userId) {
    return {
      ok: false,
      error: "That reset link is invalid or has expired. Request a new one.",
    };
  }

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  // Invalidate every existing session — a reset should log other devices out.
  await db.session.deleteMany({ where: { userId } });
  await audit("auth.reset.completed", { userId });

  return {
    ok: true,
    message: "Your password has been changed. You can now sign in.",
  };
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    password: z.string().min(8, "Use at least 8 characters.").max(200),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Those passwords do not match.",
    path: ["confirm"],
  });

export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record || !(await verifyPassword(record.passwordHash, parsed.data.current))) {
    return { ok: false, error: "Your current password is not correct." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  // Sign every device out. Someone changing their password because they think
  // they are compromised must not leave the attacker's session alive.
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);

  await audit("auth.password.changed", { userId: user.id });

  return {
    ok: true,
    message: "Your password has been updated and other devices signed out.",
  };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Please give your full name.").max(120),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().max(120).optional(),
});

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
    },
  });

  return { ok: true, message: "Your profile has been updated." };
}
