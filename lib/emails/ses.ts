import {
  SendEmailCommand,
  SendRawEmailCommand,
  SESClient,
} from "@aws-sdk/client-ses";
import { render } from "@react-email/render";

import { hackathonYear } from "@/config/site";

import ApplicationReminderEmail from "@/components/emails/ApplicationReminderEmail";
import ApplicationSubmittedEmail from "@/components/emails/ApplicationSubmittedEmail";
import { APP_URL } from "@/components/emails/EmailShell";
import HackathonPrepEmail from "@/components/emails/HackathonPrepEmail";
import ResetPasswordEmail from "@/components/emails/ResetPasswordEmail";
import TeamAcceptedEmail from "@/components/emails/TeamAcceptedEmail";
import TeamRequestEmail from "@/components/emails/TeamRequestEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

type SendEmailResult = {
  success: boolean;
  error?: string;
};

type InlineImage = {
  cid: string;
  base64Data: string;
  mimeType: string;
};

export const sendEmailWithInlineImages = async (
  to: string,
  subject: string,
  htmlBody: string,
  inlineImages: InlineImage[],
): Promise<SendEmailResult> => {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const fromAddress = `Hack Canada <${process.env.AWS_SES_NO_REPLY_EMAIL!}>`;

  let rawEmail = [
    `From: ${fromAddress}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlBody,
  ].join("\r\n");

  for (const image of inlineImages) {
    rawEmail += [
      ``,
      `--${boundary}`,
      `Content-Type: ${image.mimeType}`,
      `Content-Transfer-Encoding: base64`,
      `Content-ID: <${image.cid}>`,
      `Content-Disposition: inline; filename="${image.cid}"`,
      ``,
      image.base64Data,
    ].join("\r\n");
  }

  rawEmail += `\r\n--${boundary}--`;

  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: Buffer.from(rawEmail),
    },
  });

  try {
    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error sending raw email with SES:", error);
    return {
      success: false,
      error: "Something went wrong. Email could not be sent.",
    };
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  from?: string,
): Promise<SendEmailResult> => {
  const command = new SendEmailCommand({
    Source: `Hack Canada <${process.env.AWS_SES_NO_REPLY_EMAIL!}>` || "",
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
        Text: {
          Charset: "UTF-8",
          Data: body.replace(/<[^>]+>/g, ""),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  });

  try {
    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error sending email with SES:", error);
    return {
      success: false,
      error: "Something went wrong. Email could not be sent.",
    };
  }
};

type WelcomeEmailProps = {
  name: string;
  email: string;
  subject: string;
  verificationCode: string;
  token: string;
};

export const sendWelcomeEmail = async (data: WelcomeEmailProps) => {
  const { name, email, subject, verificationCode, token } = data;

  const verificationUrl = `${APP_URL}/email-verification?token=${token}&code=${verificationCode}&email=${email}`;

  const body = await render(
    WelcomeEmail({
      name,
      verificationCode,
      verificationUrl,
    }),
  );

  const result = await sendEmail(
    email,
    subject,
    body,
    process.env.AWS_SES_NO_REPLY_EMAIL,
  );
  console.log("Email result:", result);
  return result;
};

type ResetPasswordEmailProps = {
  name: string;
  email: string;
  subject: string;
  token: string;
};

export const sendResetPasswordEmail = async (data: ResetPasswordEmailProps) => {
  const { name, email, subject, token } = data;

  const resetUrl = `${APP_URL}/reset-password/${token}`;

  const body = await render(
    ResetPasswordEmail({
      name,
      resetUrl,
    }),
  );

  const result = await sendEmail(
    email,
    subject,
    body,
    process.env.AWS_SES_NO_REPLY_EMAIL,
  );

  return result;
};

type ApplicationSubmittedEmailProps = {
  name: string;
  email: string;
  subject: string;
};

export const sendApplicationSubmittedEmail = async (
  data: ApplicationSubmittedEmailProps,
) => {
  const { name, email, subject } = data;

  const body = await render(
    ApplicationSubmittedEmail({
      name,
    }),
  );

  const result = await sendEmail(
    email,
    subject,
    body,
    process.env.AWS_SES_NO_REPLY_EMAIL,
  );

  return result;
};

const teamPageUrl = () => `${APP_URL}/apply/teams`;

export const sendTeamRequestEmail = async (data: {
  to: string;
  ownerName: string;
  requesterName: string;
  teamName: string;
}) => {
  const body = await render(
    TeamRequestEmail({
      ownerName: data.ownerName,
      requesterName: data.requesterName,
      teamName: data.teamName,
      reviewUrl: teamPageUrl(),
    }),
  );
  return sendEmail(
    data.to,
    `${data.requesterName} asked to join ${data.teamName}`,
    body,
  );
};

export const sendTeamAcceptedEmail = async (data: {
  to: string;
  name: string;
  teamName: string;
}) => {
  const body = await render(
    TeamAcceptedEmail({
      name: data.name,
      teamName: data.teamName,
      teamUrl: teamPageUrl(),
    }),
  );
  return sendEmail(data.to, `You're on ${data.teamName}`, body);
};

type HackathonPrepEmailProps = {
  name: string;
  email: string;
  userId: string;
};

const createHackathonPrepTextVersion = (name: string) => `
Hello ${name}!

HACK CANADA EVENT DETAILS AND CHECK-IN INFORMATION

We're getting closer to the big day! Here's everything you need to know about Hack Canada at SPUR Campus in Waterloo this weekend.

LOCATION & CHECK-IN DETAILS
--------------------------
CHECK-IN TIME:
Friday, March 6th, 4:00 PM — 6:30 PM
Note: If you're running late, message us in #ask-an-organizer on Discord or find an organizer at the event.

VENUE ADDRESS:
SPUR Campus - Spur Innovation Center
2240 University Ave, Waterloo, ON N2K 0G3
Note: Parking is available at the venue.

WHAT TO BRING:
-------------
- Valid Photo ID (required for check-in)
- Laptop & charger
- Any other devices or hardware you plan to use
- Toiletries & any medication you need
- Comfortable clothes and a light jacket
- Sleeping bag/blanket if you plan to rest
- Water bottle

IMPORTANT LINKS:
--------------
- Hacker Package: https://torpid-tuesday-6d4.notion.site/Hack-Canada-Hacker-Package-1805d88c3a21800198e9e0731d94dc3f
- Discord Server: https://discord.gg/6sHskEpdpb
- Event Schedule: https://docs.google.com/spreadsheets/d/1AVNb3k0e6ly5n9tv4BI1HLt_JrkNqfgZ3L1vhcU0vso/edit
- Hacker Dashboard: ${APP_URL}
- Project Submissions: https://dorahacks.io/hackathon/hackcanada/detail

Questions? Email us at hi@hackcanada.org or message us on Discord.

See you soon!
- Hack Canada Team

--
Hack Canada | https://hackcanada.org
2240 University Ave, Waterloo, ON N2K 0G3
To unsubscribe, visit: https://hackcanada.org/unsubscribe`;

export const sendHackathonPrepEmail = async (data: HackathonPrepEmailProps) => {
  const { name, email, userId } = data;

  const htmlBody = await render(
    HackathonPrepEmail({
      name,
      userId,
    }),
  );

  const textBody = createHackathonPrepTextVersion(name);

  const command = new SendEmailCommand({
    Source: `Hack Canada <${process.env.AWS_SES_NO_REPLY_EMAIL!}>` || "",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Hack Canada Event Details and Check-in Information",
      },
    },
  });

  try {
    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error sending email with SES:", error);
    return {
      success: false,
      error: "Something went wrong. Email could not be sent.",
    };
  }
};

type ApplicationReminderEmailProps = {
  name: string;
  email: string;
  hasDraft: boolean;
};

export const sendApplicationReminderEmail = async (
  data: ApplicationReminderEmailProps,
) => {
  const { name, email, hasDraft } = data;

  const subject = hasDraft
    ? "Quick reminder about your Hack Canada application"
    : "Your Hack Canada application";

  const htmlBody = await render(ApplicationReminderEmail({ name, hasDraft }));

  const textBody = hasDraft
    ? `Hi ${name},\n\nYou started your Hack Canada ${hackathonYear} application but haven't submitted it yet. Your progress is saved, so you can pick up right where you left off.\n\nIt only takes a few more minutes to finish.\n\nFinish your application: ${APP_URL}/apply\n\nSee you soon,\nThe Hack Canada team\n\nThis address doesn't receive replies. Write to hi@hackcanada.org if you need us.`
    : `Hi ${name},\n\nYou made a Hack Canada account a little while ago, but we haven't seen an application from you yet.\n\nIf you're still keen on Hack Canada ${hackathonYear}, applying only takes a few minutes. Come solo or bring your crew. We'd love to have you.\n\nStart your application: ${APP_URL}/apply\n\nSee you soon,\nThe Hack Canada team\n\nThis address doesn't receive replies. Write to hi@hackcanada.org if you need us.`;

  const command = new SendEmailCommand({
    Source: `Hack Canada <${process.env.AWS_SES_NO_REPLY_EMAIL!}>` || "",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  });

  try {
    await ses.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error sending email with SES:", error);
    return {
      success: false,
      error: "Something went wrong. Email could not be sent.",
    };
  }
};
