import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadTeamPage } from "@/lib/apply/team-page";
import { getTeamForUser } from "@/lib/db/queries/team";
import { TeamCreateForm } from "@/components/teams/TeamCreateForm";
import { TeamPage } from "@/components/teams/TeamPage";

export const metadata: Metadata = {
  title: "Start a team",
};

export default async function NewTeamPage() {
  const { userId, open } = await loadTeamPage("/apply/teams/new");
  if (await getTeamForUser(userId)) redirect("/apply/teams");

  return (
    <TeamPage
      eyebrow="Teams"
      title="Start a team"
      lede="You become the owner. People use your link to ask to join, and you accept or decline each one."
      backHref="/apply/teams"
    >
      {!open && (
        <p className="mb-4 text-sm text-white/60">
          Applications are closed, so new teams cannot be created.
        </p>
      )}
      <TeamCreateForm open={open} />
    </TeamPage>
  );
}
