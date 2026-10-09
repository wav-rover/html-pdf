import { loginAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Connexion">
      {sp.reset && <Alert kind="success">Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.</Alert>}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={loginAction}>
        <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? ""} />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
        <SubmitButton>Se connecter</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          Pas de compte ? <TextLink href="/register">En créer un</TextLink>
        </p>
        <p>
          <TextLink href="/forgot-password">Mot de passe oublié ?</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
