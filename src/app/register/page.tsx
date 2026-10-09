import { registerAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Créer un compte">
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={registerAction}>
        <Field label="Nom" name="name" type="text" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Créer le compte</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          Déjà un compte ? <TextLink href="/login">Se connecter</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
