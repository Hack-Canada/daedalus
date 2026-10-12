import type { ReactElement } from "react";

import ApplicationSubmittedEmail from "@/components/emails/ApplicationSubmittedEmail";
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
        verificationUrl="https://app.hackcanada.org/email-verification?token=abc123"
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
    id: "new-reset-password-email",
    name: "New Reset Password Email",
    description: "New reset password email",
    component: (
      <ResetPasswordEmail
        name="John Doe"
        resetUrl="https://app.hackcanada.org/reset-password?token=abc123"
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
        reviewUrl="https://app.hackcanada.org/apply/teams"
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
        teamUrl="https://app.hackcanada.org/apply/teams"
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
