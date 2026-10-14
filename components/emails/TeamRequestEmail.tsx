import { EmailShell, paragraph } from "./EmailShell";

type Props = {
  ownerName: string;
  requesterName: string;
  teamName: string;
  reviewUrl: string;
};

const TeamRequestEmail = ({
  ownerName,
  requesterName,
  teamName,
  reviewUrl,
}: Props) => (
  <EmailShell
    preview={`${requesterName} asked to join ${teamName}`}
    scene="request"
    title={`${requesterName} wants in!`}
    action={{ href: reviewUrl, label: "Review the request" }}
    footnote={`You're getting this because you own ${teamName}.`}
  >
    <p style={paragraph}>Hi {ownerName},</p>
    <p style={paragraph}>
      {requesterName} asked to join <strong>{teamName}</strong>. Your team page
      shows what they wrote about themselves, so you can get a feel for them
      before you accept or decline.
    </p>
    <p style={paragraph}>
      They&apos;ll join the moment you accept. If it&apos;s not a fit, just
      decline.
    </p>
  </EmailShell>
);

export default TeamRequestEmail;
