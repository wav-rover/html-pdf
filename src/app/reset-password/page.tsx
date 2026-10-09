import { resetPasswordAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";

  if (!token) {
    return (
      <AuthShell title="Mot de passe oublié">
        <Alert kind="error">Lien incomplet. Demandez un nouveau lien.</Alert>
        <FooterLinks>
          <p>
            <TextLink href="/forgot-password">Demander un nouveau lien</TextLink>
          </p>
        </FooterLinks>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nouveau mot de passe">
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <Field
          label="Nouveau mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Mettre à jour</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          <TextLink href="/login">Retour à la connexion</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
