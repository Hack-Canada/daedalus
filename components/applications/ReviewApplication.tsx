import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { NORMAL_PROMPTS, TEAM_PROMPTS, TRACKS } from "@/config/apply";
import { MyTeamView } from "@/lib/apply/team-types";
import type { hackerApplications } from "@/lib/db/schema";
import { TeamPage } from "@/components/teams/TeamPage";

import { OpenResumeButton } from "./OpenResumeButton";

type Row = [label: string, value: React.ReactNode];
type Answer = [prompt: string, answer: string | null | undefined];

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#85B7F1]";
const link = `rounded text-[#85B7F1] underline-offset-4 hover:underline ${focus}`;
const promptNumber =
  "font-display mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#85B7F1] text-base text-[#043251]";
const empty = <span className="text-white/35">Not provided</span>;

function external(href: string | null) {
  if (!href) return null;
  // Forcing an http(s) scheme keeps bare domains clickable and blocks javascript: URLs.
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={link}>
      {href.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")}
    </a>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-3xl text-white md:text-4xl">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Details({ rows }: { rows: Row[] }) {
  return (
    <dl className="grid gap-x-10 gap-y-6 rounded-3xl bg-white/[0.04] p-6 sm:grid-cols-2 md:p-8">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-sm text-white/50">{label}</dt>
          <dd className="mt-1 break-words text-white">
            {value || value === 0 ? value : empty}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Answers({ items }: { items: Answer[] }) {
  return (
    <ol className="space-y-8">
      {items.map(([prompt, answer], index) => (
        <li key={prompt} className="space-y-3">
          <p className="flex gap-3 text-lg leading-relaxed text-white">
            <span className={promptNumber}>{index + 1}</span>
            {prompt}
          </p>
          <p className="rounded-xl bg-white/[0.04] px-5 py-4 text-lg leading-relaxed whitespace-pre-line text-white/85 sm:ml-11">
            {answer?.trim() || empty}
          </p>
        </li>
      ))}
    </ol>
  );
}

const yesNo = (value: boolean | null) => (value ? "Yes" : "No");
const agreed = (value: boolean | null) => (value ? "Agreed" : "Not agreed");

export function ReviewApplication({
  application,
  team,
}: {
  application: typeof hackerApplications.$inferSelect;
  team: MyTeamView | null;
}) {
  const track = TRACKS.find((item) => item.id === application.applicationType);
  const mine = team?.members.find((member) => member.isMe);
  const name = [application.firstName, application.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <TeamPage
      title="Your application"
      lede="Here's what you sent us. Answers are locked after you submit, but you can still manage your team."
      backHref="/apply"
      meta={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-white/60">
          {track && (
            <span className="rounded-full bg-[#85B7F1]/15 px-3 py-1 text-sm text-[#85B7F1]">
              {track.title}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Check className="size-4 text-emerald-300" aria-hidden />
            Submitted
          </span>
        </div>
      }
    >
      <div className="space-y-14">
        <Section title="Basics">
          <Details
            rows={[
              ["Name", name],
              ["Email", application.email],
              ["Age", application.age],
              ["Country", application.country],
              ["School", application.school],
              ["Level of study", application.levelOfStudy],
              ["Hackathons attended", application.hackathonsAttended],
            ]}
          />
        </Section>

        <Section title="Socials and resume">
          <Details
            rows={[
              ["Portfolio", external(application.personalWebsite)],
              ["LinkedIn", external(application.linkedin)],
              ["GitHub", external(application.github)],
              ["X", external(application.xUrl)],
              [
                "Resume",
                application.resumeUrl && (
                  <OpenResumeButton className={`${link} disabled:opacity-50`}>
                    Open resume
                  </OpenResumeButton>
                ),
              ],
              ["Share with sponsors", yesNo(application.shareResume)],
            ]}
          />
        </Section>

        <Section title="MLH and travel">
          <Details
            rows={[
              ["MLH Code of Conduct", agreed(application.mlhCheckbox1)],
              [
                "MLH Privacy Policy and Terms",
                agreed(application.mlhCheckbox2),
              ],
              ["MLH emails", agreed(application.mlhCheckbox3)],
              [
                "Travel reimbursement",
                yesNo(application.needsTravelReimbursement),
              ],
              ...(application.needsTravelReimbursement
                ? ([
                    [
                      "Amount",
                      application.travelAmount != null &&
                        `$${application.travelAmount} CAD`,
                    ],
                    ["Travelling from", application.travelFrom],
                  ] satisfies Row[])
                : []),
            ]}
          />
        </Section>

        {application.applicationType === "normal" && (
          <Section title="Short answers">
            <Answers
              items={[
                [NORMAL_PROMPTS.normalAnswer1, application.shortAnswer1],
                [NORMAL_PROMPTS.normalAnswer2, application.shortAnswer2],
              ]}
            />
          </Section>
        )}

        {team && (
          <Section
            title="Team answers"
            action={
              <Link
                href="/apply/teams"
                className={`group inline-flex items-center gap-1.5 ${link}`}
              >
                Open {team.name}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            }
          >
            <Answers
              items={[
                [TEAM_PROMPTS.mars, mine?.marsAnswer],
                [TEAM_PROMPTS.essay, team.essay],
              ]}
            />
          </Section>
        )}
      </div>
    </TeamPage>
  );
}
