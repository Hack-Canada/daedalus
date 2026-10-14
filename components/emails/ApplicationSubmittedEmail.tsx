import { hackathonYear } from "@/config/site";

import { APP_URL, EmailShell, paragraph } from "./EmailShell";

interface ApplicationSubmittedEmailProps {
  name: string;
}

const ApplicationSubmittedEmail = ({ name }: ApplicationSubmittedEmailProps) => (
  <EmailShell
    preview="Your Hack Canada application is in"
    scene="request"
    title="Thanks for applying!"
    action={{ href: `${APP_URL}/apply`, label: "See your application" }}
    footnote="You're getting this because you applied to Hack Canada."
  >
    <p style={paragraph}>Hi {name},</p>
    <p style={paragraph}>
      Your Hack Canada {hackathonYear} application is in. There&apos;s nothing
      else you need to do. Results come out about a week after applications
      close, and we&apos;ll email you either way.
    </p>
    <p style={paragraph}>
      Want to hack with friends? Teams are optional, and you can still make or
      join one from the apply page.
    </p>
  </EmailShell>
);

export default ApplicationSubmittedEmail;
