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
      <AuthShell title="Reset password">
        <Alert kind="error">Missing reset token. Request a new link.</Alert>
        <FooterLinks>
          <p>
            <TextLink href="/forgot-password">Request reset link</TextLink>
          </p>
        </FooterLinks>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      {sp.error && <Alert kind="error">{sp.error}</Alert>}

      <form action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton>Update password</SubmitButton>
      </form>

      <FooterLinks>
        <p>
          <TextLink href="/login">Back to sign in</TextLink>
        </p>
      </FooterLinks>
    </AuthShell>
  );
}
