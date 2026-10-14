import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { isApplyTrack, TRACKS } from "@/config/apply";
import { applicationToForm } from "@/lib/apply/payload";
import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { getTeamForUser, listMyRequests } from "@/lib/db/queries/team";
import { getPhaseState } from "@/lib/phase";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { EmptyPage } from "@/components/EmptyPage";
import PageWrapper from "@/components/PageWrapper";

type Props = {
  params: Promise<{ track: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  const title = TRACKS.find((item) => item.id === track)?.title ?? "Apply";
  return { title };
}

export default async function ApplyTrackPage({ params }: Props) {
  const { track } = await params;
  if (!isApplyTrack(track)) notFound();

  const user = await getCurrentUser();
  if (!user?.id) redirect(`/sign-in?callbackUrl=/apply/${track}`);

  if (user.status !== "not_applied") redirect("/apply");

  const { features } = await getPhaseState();
  if (!features.applicationSaving && !features.applicationSubmission) {
    return (
      <EmptyPage
        title="Applications Closed"
        message="Hacker applications are currently closed. Check back during the registration period."
      />
    );
  }

  const application = await getHackerApplicationByUserId(user.id);
  if (application?.submissionStatus === "submitted") redirect("/apply");

  const [team, requests] = await Promise.all([
    getTeamForUser(user.id),
    listMyRequests(user.id),
  ]);

  return (
    <PageWrapper>
      <ApplyForm
        track={track}
        defaultValues={applicationToForm(application, track, user.email || "")}
        userEmail={user.email || ""}
        canSave={features.applicationSaving}
        canSubmit={features.applicationSubmission}
        team={team}
        requests={requests}
        teamOpen={features.applicationSaving || features.applicationSubmission}
      />
    </PageWrapper>
  );
}
