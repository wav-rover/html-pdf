import { requestPasswordResetAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Mot de passe oublié">
      {sp.sent && (
        <Alert kind="success">
          Si un compte existe pour cet email, un lien de réinitialisation a été envoyé. En
          développement, le lien est affiché dans la console du serveur.
        </Alert>
      )}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={requestPasswordResetAction}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <SubmitButton>Envoyer le lien</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          <TextLink href="/login">Retour à la connexion</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
