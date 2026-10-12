import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { getPhaseState } from "@/lib/phase";

export async function loadTeamPage(path: string) {
  const user = await getCurrentUser();
  if (!user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(path)}`);

  const { features } = await getPhaseState();
  const application = await getHackerApplicationByUserId(user.id);
  const backHref =
    application?.applicationType === "team" &&
    application.submissionStatus !== "submitted"
      ? "/apply/team"
      : "/apply";

  return {
    userId: user.id,
    open: features.applicationSaving || features.applicationSubmission,
    backHref,
  };
}
