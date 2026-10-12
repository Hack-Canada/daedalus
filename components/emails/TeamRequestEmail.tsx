import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

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
  <Html>
    <Head />
    <Preview>
      {requesterName} asked to join {teamName}
    </Preview>
    <Body
      style={{ backgroundColor: "#F5F3FF", fontFamily: "Arial, sans-serif" }}
    >
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
        }}
      >
        <Heading style={{ color: "#5B21B6", fontSize: "24px" }}>
          New team request
        </Heading>
        <Text>Hi {ownerName},</Text>
        <Text>
          {requesterName} asked to join {teamName}. Open your team page to see
          the details they agreed to share, then accept or decline.
        </Text>
        <Button
          href={reviewUrl}
          style={{
            backgroundColor: "#5B21B6",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
          }}
        >
          Review request
        </Button>
      </Container>
    </Body>
  </Html>
);

export default TeamRequestEmail;
