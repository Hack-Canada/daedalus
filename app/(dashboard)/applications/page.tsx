import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { getApplications } from "@/config/applications";
import { hackathonYear } from "@/config/site";
import { getPhaseState } from "@/lib/phase";
import { BackButton } from "@/components/ui/back-button";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Applications - Apply to Hack Canada",
  description: `Apply to Hack Canada ${hackathonYear}! Submit your hacker application, mentor application, or judge application. Official HC applications portal for Canada's premier student hackathon.`,
  openGraph: {
    title: `Hack Canada ${hackathonYear} Applications | HC Apps Portal`,
    description:
      "Apply now to join 500+ hackers at Hack Canada! Submit your application for hacker, mentor, or judge positions through the official portal.",
  },
  keywords: [
    "Hack Canada applications",
    "HC applications",
    "Hack Canada apply",
    "hackathon application",
    "apply Hack Canada",
    "HC apply",
    "Hack Canada hacker application",
    "Hack Canada registration",
    "hackathon registration Canada",
    `Hack Canada ${hackathonYear} apply`,
  ],
};

const ApplicationPage = async () => {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const alreadyApplied = user.status !== "not_applied";

  // Get phase-aware applications and current phase
  const phaseState = await getPhaseState();
  const applications = getApplications(
    phaseState.phase,
    new Date(phaseState.dates.registrationClose),
  );
  const currentPhase = phaseState.phase;

  return (
    <PageWrapper>
      {applications.some((application) => application.status === "open") ? (
        <ApplicationsOpenHeader />
      ) : (
        <ApplicationsClosedHeader phase={currentPhase} />
      )}
      <main
        className="flex w-full flex-col gap-6"
        role="main"
        aria-label="Hack Canada Applications"
      >
        {applications.map((application) => (
          <ApplicationCard
            key={application.title}
            application={application}
            phase={currentPhase}
            alreadyApplied={
              alreadyApplied && application.title === "Hacker Applications"
            }
          />
        ))}
      </main>
      <BackButton />
    </PageWrapper>
  );
};

const ApplicationsOpenHeader = () => {
  return (
    <header className="mb-8 space-y-2">
      <div className="from-primary to-primary w-fit bg-linear-to-r via-sky-400 bg-clip-text text-transparent">
        <h1 className="font-rubik text-3xl font-bold">
          Your Journey Starts Here!
        </h1>
      </div>
      <p className="text-white/60 max-md:text-sm">
        Hack Canada {hackathonYear} applications are live!
        <br /> Don&apos;t miss your chance to join 500+ hackers for an epic
        weekend of innovation and fun.
      </p>
    </header>
  );
};

const ApplicationsClosedHeader = ({ phase }: { phase: string }) => {
  // Dynamic title and message based on phase
  const getHeaderContent = () => {
    switch (phase) {
      case "pre-registration":
        return {
          title: "Something Big is Coming! ✨",
          message: `Hack Canada ${hackathonYear} applications are opening soon! Get ready to join the most exciting hackathon in Canada.`,
        };
      case "pre-event":
        return {
          title: "The Countdown is On! ⏰",
          message: `Applications are closed, but the excitement is just beginning! Accepted hackers, check your dashboard for updates.`,
        };
      case "during-event":
        return {
          title: "We're Live! 🔥",
          message: `Hack Canada ${hackathonYear} is happening RIGHT NOW! The energy is incredible. See you next year!`,
        };
      case "post-event":
        return {
          title: "What a Journey! 🎉",
          message: `Hack Canada ${hackathonYear} was absolutely legendary! Thanks for being part of it. Can't wait to see you at Hack Canada ${hackathonYear + 1}!`,
        };
      default:
        return {
          title: "Stay Tuned! 📣",
          message: `Applications for Hack Canada ${hackathonYear} are currently closed. Follow us for updates!`,
        };
    }
  };

  const { title, message } = getHeaderContent();

  return (
    <header className="mb-8 space-y-2">
      <div className="from-primary to-primary w-fit bg-linear-to-r via-sky-400 bg-clip-text text-transparent">
        <h1 className="font-rubik text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-white/60 max-md:text-sm">{message}</p>
    </header>
  );
};

export default ApplicationPage;
