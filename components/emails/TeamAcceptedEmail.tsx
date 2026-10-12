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
  name: string;
  teamName: string;
  teamUrl: string;
};

const TeamAcceptedEmail = ({ name, teamName, teamUrl }: Props) => (
  <Html>
    <Head />
    <Preview>You are on {teamName}</Preview>
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
          You are on the team
        </Heading>
        <Text>Hi {name},</Text>
        <Text>
          {teamName} accepted your request. You can write your team answers from
          your team page.
        </Text>
        <Button
          href={teamUrl}
          style={{
            backgroundColor: "#5B21B6",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
          }}
        >
          Open your team
        </Button>
      </Container>
    </Body>
  </Html>
);

export default TeamAcceptedEmail;
