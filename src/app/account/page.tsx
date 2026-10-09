import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { signOutAction } from "@/server/actions";
import { SubmitButton } from "@/components/auth/ui";

// Protected by middleware.ts; we re-check here so the page is safe on its own.
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Your account</h1>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium">{session.user.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{session.user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium">{session.user.role ?? "USER"}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <form action={signOutAction}>
            <SubmitButton>Sign out</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
