import { EmailShell, paragraph } from "./EmailShell";

type Props = {
  name: string;
  teamName: string;
  teamUrl: string;
};

const TeamAcceptedEmail = ({ name, teamName, teamUrl }: Props) => (
  <EmailShell
    preview={`You're on ${teamName}`}
    scene="accepted"
    title={`Welcome aboard ${teamName}!`}
    action={{ href: teamUrl, label: "Meet your team" }}
    footnote={`You're getting this because you asked to join ${teamName}.`}
  >
    <p style={paragraph}>Hi {name},</p>
    <p style={paragraph}>
      Good news: <strong>{teamName}</strong> accepted your request, so
      you&apos;re officially on the team.
    </p>
    <p style={paragraph}>
      Next up, write your Mars answer and help your team with the shared answer
      before applications close.
    </p>
  </EmailShell>
);

export default TeamAcceptedEmail;
