import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import { ReviewApplication } from "@/components/applications/ReviewApplication";

export const metadata: Metadata = {
  title: "Your application",
};

export default async function HackerApplicationReviewPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/sign-in?callbackUrl=/apply/review");

  const application = await getHackerApplicationByUserId(user.id);
  if (application?.submissionStatus !== "submitted") redirect("/apply");

  const team = await getTeamForUser(user.id);
  return <ReviewApplication application={application} team={team} />;
}
