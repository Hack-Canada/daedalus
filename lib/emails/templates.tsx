import type { ReactElement } from "react";

import ApplicationReminderEmail from "@/components/emails/ApplicationReminderEmail";
import ApplicationSubmittedEmail from "@/components/emails/ApplicationSubmittedEmail";
import { APP_URL } from "@/components/emails/EmailShell";
import HackathonPrepEmail from "@/components/emails/HackathonPrepEmail";
import ResetPasswordEmail from "@/components/emails/ResetPasswordEmail";
import TeamAcceptedEmail from "@/components/emails/TeamAcceptedEmail";
import TeamRequestEmail from "@/components/emails/TeamRequestEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  component: ReactElement;
  subject: string;
}

// Email template registry
// Add new email templates here - they'll automatically appear in the preview
export const emailTemplates: EmailTemplate[] = [
  {
    id: "hackathon-prep",
    name: "Hackathon Prep",
    description: "Pre-event preparation",
    component: <HackathonPrepEmail name="Taylor Davis" userId="user_12345" />,
    subject: "Get Ready for Hack Canada!",
  },
  {
    id: "new-welcome-email",
    name: "New Welcome Email",
    description: "New welcome email",
    component: (
      <WelcomeEmail
        name="John Doe"
        verificationCode="123456"
        verificationUrl={`${APP_URL}/email-verification?token=abc123&code=123456&email=john@example.com`}
      />
    ),
    subject: "Welcome to Hack Canada!",
  },
  {
    id: "new-application-submitted-email",
    name: "New Application Submitted Email",
    description: "New application submitted email",
    component: <ApplicationSubmittedEmail name="John Doe" />,
    subject: "Thanks for applying to Hack Canada!",
  },
  {
    id: "application-reminder-draft",
    name: "Application reminder (draft)",
    description: "Sent by the reminder script to people with an unsubmitted draft",
    component: <ApplicationReminderEmail name="John Doe" hasDraft />,
    subject: "Quick reminder about your Hack Canada application",
  },
  {
    id: "application-reminder-none",
    name: "Application reminder (no application)",
    description: "Sent by the reminder script to people who never started",
    component: <ApplicationReminderEmail name="John Doe" hasDraft={false} />,
    subject: "Your Hack Canada application",
  },
  {
    id: "new-reset-password-email",
    name: "New Reset Password Email",
    description: "New reset password email",
    component: (
      <ResetPasswordEmail
        name="John Doe"
        resetUrl={`${APP_URL}/reset-password/abc123`}
      />
    ),
    subject: "Reset Your Password",
  },
  {
    id: "team-request",
    name: "Team request",
    description: "Sent to a team owner when someone asks to join",
    component: (
      <TeamRequestEmail
        ownerName="Ada"
        requesterName="Grace"
        teamName="Northwind"
        reviewUrl={`${APP_URL}/apply/teams`}
      />
    ),
    subject: "Grace asked to join Northwind",
  },
  {
    id: "team-accepted",
    name: "Team accepted",
    description: "Sent when a team owner accepts a request",
    component: (
      <TeamAcceptedEmail
        name="Grace"
        teamName="Northwind"
        teamUrl={`${APP_URL}/apply/teams`}
      />
    ),
    subject: "You're on Northwind",
  },
];

// Helper to get template by ID
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((template) => template.id === id);
}

// Helper to get all template IDs
export function getTemplateIds(): string[] {
  return emailTemplates.map((template) => template.id);
}
