import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
} from "@react-email/components";

const SITE_URL = "https://hackcanada.org";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.hackcanada.org";

const navy = "#043251";
const ink = "#102b3d";
const muted = "#6b7f8e";
const display = "'Londrina Solid', 'Trebuchet MS', Arial, sans-serif";
const body = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

export type EmailScene = "code" | "request" | "accepted";

const SCENE_ALT: Record<EmailScene, string> = {
  code: "A message in a bottle floating on the sea",
  request: "The Hack Canada beaver waving hello",
  accepted: "The Hack Canada beaver sailing with a flag",
};

export const paragraph = {
  color: ink,
  fontFamily: body,
  fontSize: "16px",
  lineHeight: 1.65,
  margin: "0 0 16px",
};

export function CodeBlock({ code }: { code: string }) {
  return (
    <div
      style={{
        backgroundColor: "#eef6fe",
        borderRadius: "16px",
        color: navy,
        fontFamily: display,
        fontSize: "44px",
        letterSpacing: "0.3em",
        lineHeight: 1,
        margin: "8px 0 24px",
        padding: "26px 0 26px 0.3em",
        textAlign: "center",
      }}
    >
      {code}
    </div>
  );
}

export function EmailShell({
  preview,
  scene,
  title,
  children,
  action,
  footnote,
}: {
  preview: string;
  scene: EmailScene;
  title: ReactNode;
  children: ReactNode;
  action: { href: string; label: string };
  footnote: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- email markup, not a Next page */}
        <link
          href="https://fonts.googleapis.com/css2?family=Londrina+Solid&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <style>{`@media (max-width: 600px) {
  .card { border-radius: 0 !important; }
  .pad { padding-left: 24px !important; padding-right: 24px !important; }
  .title { font-size: 36px !important; }
}`}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{ backgroundColor: "#e6f1fc", margin: 0, padding: "32px 12px" }}
      >
        <Container
          className="card"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            maxWidth: "560px",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Img
            src={`${APP_URL}/emails/${scene}.jpg`}
            width="560"
            alt={SCENE_ALT[scene]}
            style={{
              border: 0,
              display: "block",
              height: "auto",
              maxWidth: "560px",
              width: "100%",
            }}
          />

          <Section className="pad" style={{ padding: "36px 44px 0" }}>
            <h1
              className="title"
              style={{
                color: navy,
                fontFamily: display,
                fontSize: "44px",
                fontWeight: 400,
                lineHeight: 1.05,
                margin: "0 0 20px",
              }}
            >
              {title}
            </h1>
            {children}
            <Link
              href={action.href}
              style={{
                backgroundColor: navy,
                borderRadius: "999px",
                color: "#ffffff",
                display: "inline-block",
                fontFamily: body,
                fontSize: "16px",
                fontWeight: 600,
                margin: "8px 0 0",
                padding: "15px 30px",
                textDecoration: "none",
              }}
            >
              {action.label} &rarr;
            </Link>
            <p style={{ ...paragraph, margin: "32px 0 0" }}>
              See you soon,
              <br />
              <span
                style={{ color: navy, fontFamily: display, fontSize: "22px" }}
              >
                The Hack Canada team
              </span>
            </p>
          </Section>

          <Section className="pad" style={{ padding: "32px 44px 32px" }}>
            <p
              style={{
                borderTop: "1px solid #e4edf5",
                color: muted,
                fontFamily: body,
                fontSize: "12px",
                lineHeight: 1.6,
                margin: 0,
                paddingTop: "20px",
              }}
            >
              {footnote} This address doesn&apos;t receive replies, so write to{" "}
              <Link href="mailto:hi@hackcanada.org" style={{ color: muted }}>
                hi@hackcanada.org
              </Link>{" "}
              if you need us.
              <br />
              <Link href={SITE_URL} style={{ color: muted }}>
                hackcanada.org
              </Link>
            </p>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
