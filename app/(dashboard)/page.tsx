import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";

import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { UnauthorizedState } from "@/components/dashboard/UnauthorizedState";

export const metadata: Metadata = {
  title: "Hacker Dashboard",
  description: "Your Hack Canada Hacker Portal dashboard. Access your application status, hacker package, QR code, profile, and all event information in one place.",
  keywords: [
    "Hack Canada dashboard",
    "HC dashboard",
    "hacker portal",
    "hackathon dashboard",
    "Hack Canada profile",
    "HC hacker dashboard",
  ],
};

const Home = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return <UnauthorizedState />;
  }


  return <DashboardContent user={user} />;
};

export default Home;
