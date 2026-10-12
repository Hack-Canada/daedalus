import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

import { hackathonYear } from "@/config/site";

interface ApplicationReminderEmailProps {
  name: string;
  hasDraft: boolean;
}

const ApplicationReminderEmail = ({
  name,
  hasDraft,
}: ApplicationReminderEmailProps) => {
  const previewText = hasDraft
    ? `Hey ${name}, your Hack Canada application is saved as a draft — just need to hit submit!`
    : `Hey ${name}, just a friendly reminder to start your Hack Canada application.`;

  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#1E90FF",
                primaryDark: "#1565C0",
                background: "#FFFFFF",
                backgroundMuted: "#F8FAFC",
                textPrimary: "#1F2937",
                textSecondary: "#4B5563",
                textMuted: "#9CA3AF",
              },
            },
          },
        }}
      >
        <Head />
        <Body
          style={{
            backgroundColor: "#F5F3FF",
            margin: 0,
            padding: 0,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "20px 0",
            }}
          >
            <Section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "40px 32px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Heading
                style={{
                  color: "#5B21B6",
                  fontSize: "24px",
                  fontWeight: "700",
                  margin: "0 0 24px 0",
                  textAlign: "center",
                }}
              >
                {hasDraft
                  ? "Your application is almost done"
                  : "Quick reminder about your application"}
              </Heading>

              <Text
                style={{
                  color: "#4B5563",
                  fontSize: "16px",
                  lineHeight: "26px",
                  margin: "0 0 16px 0",
                }}
              >
                Hey {name},
              </Text>

              {hasDraft ? (
                <>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: "16px",
                      lineHeight: "26px",
                      margin: "0 0 16px 0",
                    }}
                  >
                    We noticed you started your Hack Canada {hackathonYear}{" "}
                    hacker application but haven&apos;t submitted it yet. Your
                    progress is saved, so you can pick up right where you left
                    off.
                  </Text>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: "16px",
                      lineHeight: "26px",
                      margin: "0 0 28px 0",
                    }}
                  >
                    It should only take a few more minutes to finish up and
                    submit.
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: "16px",
                      lineHeight: "26px",
                      margin: "0 0 16px 0",
                    }}
                  >
                    You created a Hack Canada account a little while ago, but we
                    haven&apos;t received a hacker application from you yet.
                  </Text>
                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: "16px",
                      lineHeight: "26px",
                      margin: "0 0 28px 0",
                    }}
                  >
                    If you&apos;re still interested in joining us for Hack
                    Canada {hackathonYear}, the application only takes about 10
                    minutes. We&apos;d love to have you.
                  </Text>
                </>
              )}

              <div style={{ textAlign: "center", margin: "0 0 28px 0" }}>
                <Button
                  href="https://app.hackcanada.org/apply"
                  style={{
                    backgroundColor: "#5B21B6",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    textDecoration: "none",
                    textAlign: "center",
                    display: "inline-block",
                    padding: "12px 32px",
                    borderRadius: "8px",
                  }}
                >
                  {hasDraft ? "Finish my application" : "Go to my application"}
                </Button>
              </div>

              <Text
                style={{
                  color: "#6B7280",
                  fontSize: "14px",
                  lineHeight: "22px",
                  margin: "0 0 0 0",
                }}
              >
                If you have any questions about the application or the event,
                feel free to reply to this email or reach out at{" "}
                <Link
                  href="mailto:hi@hackcanada.org"
                  style={{
                    color: "#7C3AED",
                    textDecoration: "underline",
                  }}
                >
                  hi@hackcanada.org
                </Link>
                .
              </Text>

              <Text
                style={{
                  color: "#4B5563",
                  fontSize: "16px",
                  lineHeight: "26px",
                  margin: "28px 0 4px 0",
                }}
              >
                Cheers,
              </Text>
              <Text
                style={{
                  color: "#5B21B6",
                  fontSize: "16px",
                  lineHeight: "26px",
                  margin: "0 0 0 0",
                  fontWeight: "600",
                }}
              >
                The Hack Canada Team
              </Text>

              <Hr
                style={{
                  border: "none",
                  borderTop: "1px solid #E5E7EB",
                  margin: "32px 0",
                }}
              />

              <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: "12px" }}>
                  <Link
                    href="https://hackcanada.org"
                    target="_blank"
                    style={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      textDecoration: "none",
                      margin: "0 8px",
                    }}
                  >
                    Website
                  </Link>
                  <span style={{ color: "#D1D5DB" }}>·</span>
                  <Link
                    href="https://app.hackcanada.org"
                    target="_blank"
                    style={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      textDecoration: "none",
                      margin: "0 8px",
                    }}
                  >
                    Dashboard
                  </Link>
                  <span style={{ color: "#D1D5DB" }}>·</span>
                  <Link
                    href="mailto:hi@hackcanada.org"
                    style={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      textDecoration: "none",
                      margin: "0 8px",
                    }}
                  >
                    Contact
                  </Link>
                </div>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: "11px",
                    lineHeight: "18px",
                    margin: "8px 0 0 0",
                  }}
                >
                  © {hackathonYear} Hack Canada
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApplicationReminderEmail;
