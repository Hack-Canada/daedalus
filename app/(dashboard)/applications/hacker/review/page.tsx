import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import type { hackerApplications } from "@/lib/db/schema";
import { ReviewApplication } from "@/components/applications/ReviewApplication";
import { EmptyPage } from "@/components/EmptyPage";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Review Application",
};

export default async function HackerApplicationReviewPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    redirect("/sign-up");
  }

  const dbApplication = await getHackerApplicationByUserId(currentUser.id);

  if (!dbApplication) {
    return (
      <EmptyPage
        title="No Application Found"
        message="You haven't submitted an application yet. Please submit one to view this page."
      />
    );
  }

  const application = dbApplication as typeof hackerApplications.$inferSelect;
  const team = await getTeamForUser(currentUser.id);

  return (
    <PageWrapper>
      <ReviewApplication application={application} team={team} />
    </PageWrapper>
  );
}
