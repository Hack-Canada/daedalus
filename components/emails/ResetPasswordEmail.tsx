import { EmailShell, paragraph } from "./EmailShell";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

const ResetPasswordEmail = ({ name, resetUrl }: ResetPasswordEmailProps) => (
  <EmailShell
    preview="Reset your Hack Canada password"
    scene="code"
    title="Reset your password"
    action={{ href: resetUrl, label: "Reset my password" }}
    footnote="Didn't ask for this? Ignore this email and your password stays the same."
  >
    <p style={paragraph}>Hi {name},</p>
    <p style={paragraph}>
      We got a request to reset your Hack Canada password. Use the button
      below to pick a new one. The link works for the next hour.
    </p>
  </EmailShell>
);

export default ResetPasswordEmail;
