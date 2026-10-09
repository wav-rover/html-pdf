import { requestPasswordResetAction } from "@/server/actions";
import { Alert, AuthShell, Field, FooterLinks, SubmitButton, TextLink } from "@/components/auth/ui";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AuthShell title="Reset password">
      {sp.sent && (
        <Alert kind="success">
          If an account exists for that email, a reset link has been sent. In dev mode the link is
          printed to the server console.
        </Alert>
      )}
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={requestPasswordResetAction}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          <TextLink href="/login">Back to sign in</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
