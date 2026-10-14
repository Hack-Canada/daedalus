import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Globe, Lock } from "lucide-react";

import { MAX_TEAM_SIZE, MIN_TEAM_APPLY } from "@/config/apply";
import { loadTeamPage } from "@/lib/apply/team-page";
import { getTeamForUser, listMyRequests } from "@/lib/db/queries/team";
import { MyRequests } from "@/components/teams/MyRequests";
import { TeamChoices } from "@/components/teams/TeamChoices";
import { TeamHowItWorks } from "@/components/teams/TeamHowItWorks";
import { TeamManage } from "@/components/teams/TeamManage";
import { TeamPage } from "@/components/teams/TeamPage";

export const metadata: Metadata = {
  title: "Your team",
};

export default async function TeamsPage() {
  const { userId, open, backHref, submitted } =
    await loadTeamPage("/apply/teams");
  const team = await getTeamForUser(userId);

  if (team) {
    const ready = team.members.length >= MIN_TEAM_APPLY;
    const Visibility = team.isPublic ? Globe : Lock;
    return (
      <TeamPage
        title={team.name}
        backHref={backHref}
        meta={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60">
            <span>
              {ready
                ? "Ready to apply as a team"
                : `Needs ${MIN_TEAM_APPLY - team.members.length} more to apply as a team`}
            </span>
            <span aria-hidden className="text-white/25">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Visibility className="size-4" aria-hidden />
              {team.isPublic ? "Public" : "Link only"}
            </span>
            <TeamHowItWorks />
          </div>
        }
      >
        <TeamManage team={team} open={open} />
      </TeamPage>
    );
  }

  // After submitting, /apply shows these same choices.
  if (submitted) redirect("/apply");

  const requests = await listMyRequests(userId);
  return (
    <TeamPage
      title="Find your people"
      lede={`Teams have up to ${MAX_TEAM_SIZE} people. Start one and share the link, or ask to join a public team. Owners accept every request.`}
      backHref={backHref}
    >
      <div className="space-y-10">
        <TeamChoices />
        <MyRequests requests={requests} open={open} />
      </div>
    </TeamPage>
  );
}
