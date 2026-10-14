import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { isApplyTrack } from "@/config/apply";
import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { getTeamForUser, listMyRequests } from "@/lib/db/queries/team";
import { getPhaseState } from "@/lib/phase";
import { ApplyMark } from "@/components/apply/ApplyMark";
import { ApplyPicker } from "@/components/apply/ApplyPicker";
import { ApplySubmitted } from "@/components/apply/ApplySubmitted";
import { EmptyPage } from "@/components/EmptyPage";

export const metadata: Metadata = {
  title: "Apply - Hack Canada",
  description: "Choose a Quick, Normal, or Team application for Hack Canada.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/sign-in?callbackUrl=/apply");

  const { features, phase } = await getPhaseState();
  const open = features.applicationSaving || features.applicationSubmission;
  const application = await getHackerApplicationByUserId(user.id);
  const submitted =
    user.status !== "not_applied" ||
    application?.submissionStatus === "submitted";

  if (phase === "pre-registration" && !submitted) {
    return (
      <div className="flex h-dvh items-center justify-center px-6 text-center">
        <ApplyMark />
        <div className="max-w-md space-y-3">
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
            Applications are not open yet
          </h1>
          <p className="text-white/70">
            Hack Canada applications have not opened. Check back when
            registration starts.
          </p>
        </div>
      </div>
    );
  }

  if (!open && !submitted) {
    return (
      <EmptyPage
        title="Applications Closed"
        message="Hacker applications are currently closed. Check back during the registration period."
      />
    );
  }

  if (submitted) {
    const [team, requests] = await Promise.all([
      getTeamForUser(user.id),
      listMyRequests(user.id),
    ]);
    const track = application?.applicationType;
    return (
      <ApplySubmitted
        track={track && isApplyTrack(track) ? track : null}
        firstName={application?.firstName || null}
        celebrate={(await searchParams).submitted === "1"}
        team={team}
        requests={requests}
        open={open}
      />
    );
  }

  const track = application?.applicationType;
  return (
    <ApplyPicker
      currentTrack={track && isApplyTrack(track) ? track : null}
      hasDraft={Boolean(application)}
    />
  );
}
