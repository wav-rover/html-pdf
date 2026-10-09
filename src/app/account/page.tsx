import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { signOutAction } from "@/server/actions";
import { AuthShell, SubmitButton } from "@/components/auth/ui";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/server/roles";

// Protected by middleware.ts; we re-check here so the page is safe on its own.
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AuthShell title="Mon compte">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Nom</dt>
          <dd className="font-medium">{session.user.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium">{session.user.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Rôle</dt>
          <dd className="font-medium">{session.user.role ?? "USER"}</dd>
        </div>
      </dl>
      <div className="mt-6 grid gap-2">
        {isAdmin(session.user) && (
          <Button asChild variant="outline" className="h-10">
            <Link href="/admin">Espace admin</Link>
          </Button>
        )}
        <form action={signOutAction}>
          <SubmitButton>Se déconnecter</SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
