import type { Metadata } from "next";
import { Globe, Lock } from "lucide-react";

import { MAX_TEAM_SIZE, MIN_TEAM_APPLY } from "@/config/apply";
import { loadTeamPage } from "@/lib/apply/team-page";
import { getTeamForUser, listMyRequests } from "@/lib/db/queries/team";
import { MyRequests } from "@/components/teams/MyRequests";
import { SpotsMeter } from "@/components/teams/SpotsMeter";
import { TeamChoices } from "@/components/teams/TeamChoices";
import { TeamHowItWorks } from "@/components/teams/TeamHowItWorks";
import { TeamManage } from "@/components/teams/TeamManage";
import { TeamPage } from "@/components/teams/TeamPage";

export const metadata: Metadata = {
  title: "Your team",
};

export default async function TeamsPage() {
  const { userId, open, backHref } = await loadTeamPage("/apply/teams");
  const team = await getTeamForUser(userId);

  if (team) {
    const ready = team.members.length >= MIN_TEAM_APPLY;
    const Visibility = team.isPublic ? Globe : Lock;
    return (
      <TeamPage
        title={team.name}
        backHref={backHref}
        meta={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <SpotsMeter memberCount={team.members.length} />
            <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
              <Visibility className="size-3.5" aria-hidden />
              {team.isPublic ? "Listed publicly" : "Link only"}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <span
                className={`size-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-300"}`}
                aria-hidden
              />
              <span>
                {ready
                  ? "Ready to apply as a team"
                  : `Needs ${MIN_TEAM_APPLY - team.members.length} more to apply as a team`}
              </span>
              <TeamHowItWorks />
            </span>
          </div>
        }
      >
        <TeamManage team={team} open={open} />
      </TeamPage>
    );
  }

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
