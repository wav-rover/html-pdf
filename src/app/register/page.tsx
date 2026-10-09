import { registerAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Create account">
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={registerAction}>
        <Field label="Name" name="name" type="text" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Create account</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          Already have an account? <TextLink href="/login">Sign in</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
