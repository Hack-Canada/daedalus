import type { Metadata } from "next";

import { loadTeamPage } from "@/lib/apply/team-page";
import { getApplicantShare, listPublicTeams } from "@/lib/db/queries/team";
import { PublicTeamsBrowser } from "@/components/teams/PublicTeamsBrowser";
import { TeamPage } from "@/components/teams/TeamPage";

export const metadata: Metadata = {
  title: "Browse teams",
};

export default async function BrowseTeamsPage() {
  const { userId, open } = await loadTeamPage("/apply/teams/browse");
  const [teams, share] = await Promise.all([
    listPublicTeams(userId),
    getApplicantShare(userId),
  ]);

  return (
    <TeamPage
      eyebrow="Teams"
      title="Browse teams"
      lede="Asking to join shares your name, school, country, level of study, hackathons, and social links with that team's owner, only after you agree."
      backHref="/apply/teams"
    >
      <PublicTeamsBrowser teams={teams} share={share} open={open} />
    </TeamPage>
  );
}
