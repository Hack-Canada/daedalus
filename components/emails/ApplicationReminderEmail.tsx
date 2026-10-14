import { hackathonYear } from "@/config/site";

import { APP_URL, EmailShell, paragraph } from "./EmailShell";

interface ApplicationReminderEmailProps {
  name: string;
  hasDraft: boolean;
}

const ApplicationReminderEmail = ({
  name,
  hasDraft,
}: ApplicationReminderEmailProps) =>
  hasDraft ? (
    <EmailShell
      preview="Your Hack Canada application is saved. Just hit submit."
      scene="request"
      title="Almost there!"
      action={{ href: `${APP_URL}/apply`, label: "Finish my application" }}
      footnote="You're getting this because you started a Hack Canada application."
    >
      <p style={paragraph}>Hi {name},</p>
      <p style={paragraph}>
        You started your Hack Canada {hackathonYear} application but
        haven&apos;t submitted it yet. Your progress is saved, so you can pick
        up right where you left off.
      </p>
      <p style={paragraph}>It only takes a few more minutes to finish.</p>
    </EmailShell>
  ) : (
    <EmailShell
      preview="Your Hack Canada application is waiting for you"
      scene="request"
      title="Still thinking about it?"
      action={{ href: `${APP_URL}/apply`, label: "Start my application" }}
      footnote="You're getting this because you have a Hack Canada account."
    >
      <p style={paragraph}>Hi {name},</p>
      <p style={paragraph}>
        You made a Hack Canada account a little while ago, but we haven&apos;t
        seen an application from you yet.
      </p>
      <p style={paragraph}>
        If you&apos;re still keen on Hack Canada {hackathonYear}, applying only
        takes a few minutes. Come solo or bring your crew. We&apos;d love to
        have you.
      </p>
    </EmailShell>
  );

export default ApplicationReminderEmail;
