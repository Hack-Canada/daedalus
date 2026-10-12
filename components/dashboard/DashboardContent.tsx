"use client";

import { cn } from "@/lib/utils";
import { useHackathonPhase } from "@/hooks/useHackathonPhase";

import PageWrapper from "../PageWrapper";
import { PhaseGuard } from "../phase/PhaseGuard";
import { BackButton } from "../ui/back-button";
import { ApplicationStatus } from "./ApplicationStatus";
import { ContactSection } from "./ContactSection";
import { CountdownSection } from "./CountdownSection";
import { DashboardHeader } from "./DashboardHeader";
import DashboardQRCode from "./DashboardQRCode";
import DevpostCard from "./DevpostCard";
import { HackathonConclusion } from "./HackathonConclusion";
import HackathonsCanadaDiscord from "./HackathonsCanadaDiscord";
import HackerPackageCard from "./HackerPackageCard";
import ProfileCard from "./ProfileCard";
import ProjectsCard from "./ProjectsCard";
import { ThankYouCard } from "./ThankYouCard";

interface DashboardContentProps {
  user: User;
}

export const DashboardContent = ({ user }: DashboardContentProps) => {
  // Lock everything for unassigned users
  const isLocked = user.role === "unassigned";
  const { isPhase } = useHackathonPhase();

  return (
    <PageWrapper className="max-w-screen-xl 2xl:max-w-screen-xl">
      <DashboardHeader userName={user.name || "Hacker"} />
      <div
        className={cn("flex flex-col gap-6 md:gap-8 lg:gap-10", {
          "flex-col-reverse": user.role === "hacker",
        })}
      >
        {/* Application Status - shown during pre-registration, registration and pre-event phases */}
        <PhaseGuard
          phases={["pre-registration", "registration-open", "pre-event"]}
        >
          <ApplicationStatus
            status={isPhase("pre-registration") ? "coming_soon" : user.status}
            role={user.role}
          />
        </PhaseGuard>

        {/* Post-Event Content */}
        <PhaseGuard phases={["post-event"]}>
          <div className="space-y-6 md:space-y-8 lg:space-y-10">
            <HackathonConclusion role={user.role} />
            <ThankYouCard role={user.role} />
          </div>
        </PhaseGuard>

        {/* Hacker Package & Devpost - shown during pre-event and during-event */}
        <PhaseGuard phases={["pre-event", "during-event"]}>
          <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-4 lg:gap-10">
            <HackerPackageCard isLocked={isLocked} />
            <DevpostCard />
          </div>
        </PhaseGuard>

        {/* Main Grid Sections */}
        <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-4 lg:gap-10">
          <HackathonsCanadaDiscord />
          <ProjectsCard />
        </div>

        {/* Profile Section */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-5 lg:gap-10">
          <DashboardQRCode isLocked={isLocked} userId={user.id!} />

          {/* Locked for anyone without an assigned role */}
          <ProfileCard isLocked={isLocked} userId={user.id!} />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3 lg:gap-10">
        <CountdownSection />
        <ContactSection />
      </div>
      <BackButton label="Back to landing page" href="https://hackcanada.org" />
    </PageWrapper>
  );
};
