import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

/** Centered card shell shared by all auth pages. */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function Field({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
      />
    </label>
  );
}

export function SubmitButton({ children, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type="submit"
      className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const styles =
    kind === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";
  return <p className={`mb-4 rounded-md border px-3 py-2 text-sm ${styles}`}>{children}</p>;
}

export function FooterLinks({ children }: { children: ReactNode }) {
  return <div className="mt-6 space-y-1 text-center text-sm text-gray-500">{children}</div>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-gray-900 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
