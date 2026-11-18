import type { Metadata } from "next";

import { loadTeamPage } from "@/lib/apply/team-page";
import { getApplicantShare, getPublicTeam } from "@/lib/db/queries/team";
import { JoinRequestButton } from "@/components/teams/JoinRequestButton";
import { MemberContacts } from "@/components/teams/MemberContacts";
import { SpotsMeter } from "@/components/teams/SpotsMeter";
import { TeamPage } from "@/components/teams/TeamPage";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const team = await getPublicTeam(id, "");
  return {
    title: team?.name ?? "Team",
    robots: { index: false },
  };
}

function LookingFor({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-medium tracking-[0.14em] text-white/45 uppercase">
        What they are looking for
      </p>
      <p className="mt-2 whitespace-pre-line text-white/85">{text}</p>
    </div>
  );
}

export default async function PublicTeamPage({ params }: Props) {
  const { id } = await params;
  const { userId, open } = await loadTeamPage(`/apply/teams/browse/${id}`);
  const [team, share] = await Promise.all([
    getPublicTeam(id, userId),
    getApplicantShare(userId),
  ]);

  if (!team) {
    return (
      <TeamPage
        title="Team not listed"
        lede="This team is private, or it is no longer on Browse teams."
        backHref="/apply/teams/browse"
      />
    );
  }

  return (
    <TeamPage
      title={team.name}
      meta={<SpotsMeter memberCount={team.memberCount} />}
      backHref="/apply/teams/browse"
    >
      <div className="max-w-xl space-y-6">
        <LookingFor
          text={
            team.lookingFor ||
            "They have not written what they are looking for yet."
          }
        />
        <MemberContacts members={team.contacts} />
        <JoinRequestButton
          teamName={team.name}
          share={share}
          open={open}
          teamId={team.id}
          requestStatus={team.requestStatus}
          requestId={team.requestId}
          cooldownUntil={team.cooldownUntil}
          full={team.spotsLeft <= 0}
          mine={team.mine}
        />
      </div>
    </TeamPage>
  );
}
