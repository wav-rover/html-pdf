import { loginAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Sign in">
      {sp.reset && <Alert kind="success">Password updated. Sign in with your new password.</Alert>}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={loginAction}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <SubmitButton>Sign in</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          No account? <TextLink href="/register">Create one</TextLink>
        </p>
        <p>
          <TextLink href="/forgot-password">Forgot your password?</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
