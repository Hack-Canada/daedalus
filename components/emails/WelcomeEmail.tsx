import { CodeBlock, EmailShell, paragraph } from "./EmailShell";

interface WelcomeEmailProps {
  name: string;
  verificationCode: string;
  verificationUrl: string;
}

const WelcomeEmail = ({
  name,
  verificationCode,
  verificationUrl,
}: WelcomeEmailProps) => (
  <EmailShell
    preview={`${verificationCode} is your Hack Canada code`}
    scene="code"
    title="Here's your code"
    action={{ href: verificationUrl, label: "Verify my email" }}
    footnote="Didn't ask for this? You can ignore this email."
  >
    <p style={paragraph}>Hi {name},</p>
    <p style={paragraph}>
      Pop this into the Hack Canada sign-in page to verify your email. It works
      for the next hour.
    </p>
    <CodeBlock code={verificationCode} />
    <p style={paragraph}>Or skip the typing and use the button.</p>
  </EmailShell>
);

export default WelcomeEmail;
