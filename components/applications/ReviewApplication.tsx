import Link from "next/link";
import { File } from "lucide-react";

import { NORMAL_PROMPTS, TEAM_PROMPTS, TRACKS } from "@/config/apply";
import type { hackerApplications } from "@/lib/db/schema";
import { MyTeamView } from "@/lib/apply/team-types";

import { buttonVariants } from "../ui/button";
import { Field } from "./Field";
import { OpenResumeButton } from "./OpenResumeButton";
import { ReviewSection } from "./ReviewSection";
import { StepContentWrapper } from "./StepContentWrapper";

interface ReviewApplicationProps {
  application: typeof hackerApplications.$inferSelect;
  team: MyTeamView | null;
}

export function ReviewApplication({ application, team }: ReviewApplicationProps) {
  const trackLabel =
    TRACKS.find((track) => track.id === application.applicationType)?.title ??
    "Hacker application";
  const mine = team?.members.find((member) => member.isMe);
  const legacy =
    !application.applicationType &&
    (application.shortAnswer1 || application.shortAnswer2 || application.shortAnswer3);

  return (
    <div className="space-y-8 xl:space-y-12">
      <StepContentWrapper
        title="Review your application"
        className="space-y-2 md:space-y-2 xl:space-y-2"
      >
        <p className="text-white/50 max-md:text-sm">
          An overview of your submitted application is below. You can no longer
          change these answers. You can still manage your team from the apply
          page.
        </p>
      </StepContentWrapper>

      <ReviewSection title="Application">
        <Field label="Type" value={trackLabel} />
      </ReviewSection>

      <ReviewSection title="Basic questions">
        <Field label="First Name" value={application.firstName} />
        <Field label="Last Name" value={application.lastName} />
        <Field label="Age" value={application.age?.toString() || ""} />
        <Field label="Email" value={application.email} />
        <Field label="School" value={application.school} />
        <Field label="Country of residence" value={application.country} />
        <Field label="Level of Study" value={application.levelOfStudy} />
        <Field
          label="Hackathons Attended"
          value={application.hackathonsAttended}
        />
      </ReviewSection>

      <ReviewSection title="Socials, MLH, and travel">
        <Field label="Portfolio" value={application.personalWebsite} />
        <Field label="LinkedIn" value={application.linkedin} />
        <Field label="GitHub" value={application.github} />
        <Field label="X" value={application.xUrl} />
        {application.resumeUrl ? (
          <div className="space-y-1.5 overflow-hidden">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">
              Resume
            </p>
            <OpenResumeButton className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(30,144,255,0.2)] disabled:opacity-50">
              <File className="h-4 w-4" />
              View Resume
            </OpenResumeButton>
          </div>
        ) : (
          <Field label="Resume" value="" />
        )}
        <Field
          label="Share resume with sponsors/recruiters"
          value={application.shareResume ? "Yes" : "No"}
        />
        <Field
          label="MLH Code of Conduct"
          value={application.mlhCheckbox1 ? "Agreed" : "Not agreed"}
        />
        <Field
          label="MLH Privacy Policy and Contest Terms"
          value={application.mlhCheckbox2 ? "Agreed" : "Not agreed"}
        />
        <Field
          label="MLH email authorization"
          value={application.mlhCheckbox3 ? "Agreed" : "Not agreed"}
        />
        <Field
          label="Travel reimbursement"
          value={application.needsTravelReimbursement ? "Yes" : "No"}
        />
        {application.needsTravelReimbursement && (
          <>
            <Field
              label="Reimbursement amount (CAD)"
              value={application.travelAmount?.toString()}
            />
            <Field label="Travelling from" value={application.travelFrom} />
          </>
        )}
      </ReviewSection>

      {application.applicationType === "normal" && (
        <ReviewSection title="Normal application questions" columns="1">
          <Field
            label={NORMAL_PROMPTS.normalAnswer1}
            value={application.shortAnswer1}
            isLongText
          />
          <Field
            label={NORMAL_PROMPTS.normalAnswer2}
            value={application.shortAnswer2}
            isLongText
          />
        </ReviewSection>
      )}

      {legacy && (
        <ReviewSection title="Earlier short answers" columns="1">
          <Field label="Short answer 1" value={application.shortAnswer1} isLongText />
          <Field label="Short answer 2" value={application.shortAnswer2} isLongText />
          <Field label="Short answer 3" value={application.shortAnswer3} isLongText />
        </ReviewSection>
      )}

      {team && (
        <ReviewSection title="Team" columns="1">
          <Field label="Team" value={team.name} />
          <Field label={TEAM_PROMPTS.mars} value={mine?.marsAnswer} isLongText />
          <Field label={TEAM_PROMPTS.essay} value={team.essay} isLongText />
        </ReviewSection>
      )}

      <hr className="border-white/10" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white md:text-xl">
          Interested in anything else?
        </h3>
        <div className="flex gap-2.5 max-xs:flex-col xs:items-center">
          <Link href="/apply" className={buttonVariants({ variant: "primary" })}>
            Back to apply
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
