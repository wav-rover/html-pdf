"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { signIn, signOut } from "./auth";

const registerSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z.string().email("Saisissez un email valide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

function err(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Create an account, then sign the user in. */
export async function registerAction(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) err("/register", parsed.error.issues[0]?.message ?? "Saisie invalide");

  const { name, email, password } = parsed.data;

  if (await db.user.findUnique({ where: { email } })) {
    err("/register", "Un compte existe déjà avec cet email");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?reset=1");
    throw error; // re-throw Next's redirect
  }
}

// Keeps only the path of the callback URL so a crafted link can't redirect off-site.
const toLocalPath = (callbackUrl: string) => {
  if (callbackUrl === "") return "/account";
  const { pathname, search } = new URL(callbackUrl, "http://localhost");
  return `${pathname}${search}`;
};

/** Authenticate with email + password. */
export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = toLocalPath(String(formData.get("callbackUrl") ?? ""));

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      const message = encodeURIComponent("Email ou mot de passe incorrect");
      redirect(`/login?error=${message}&callbackUrl=${encodeURIComponent(redirectTo)}`);
    }
    throw error; // re-throw Next's redirect
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/**
 * Issue a password-reset token. No mailer is configured yet, so the reset link
 * is logged to the server console (dev mode). We always report success to avoid
 * revealing which emails exist.
 */
export async function requestPasswordResetAction(formData: FormData): Promise<void> {
  const parsed = z.string().email().safeParse(formData.get("email"));
  if (!parsed.success) err("/forgot-password", "Saisissez un email valide");

  const user = await db.user.findUnique({ where: { email: parsed.data } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await db.verificationToken.create({ data: { identifier: parsed.data, token, expires } });

    const base = process.env.AUTH_URL ?? "http://localhost:3000";
    console.log(`\n[Stackr] Password reset link for ${parsed.data}:\n${base}/reset-password?token=${token}\n`);
  }

  redirect("/forgot-password?sent=1");
}

/** Consume a reset token and set a new password. */
export async function resetPasswordAction(formData: FormData): Promise<void> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const token = String(formData.get("token") ?? "");
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Saisie invalide",
      )}`,
    );
  }

  const { token, password } = parsed.data;
  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    err("/reset-password", "Ce lien est invalide ou a expiré");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({ where: { email: record.identifier }, data: { passwordHash } });
  await db.verificationToken.delete({ where: { token } });

  redirect("/login?reset=1");
}
