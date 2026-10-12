"use client";

import { type HackathonPhase, type PhaseFeatures } from "@/config/phases";
import { usePhaseSnapshot } from "@/components/phase/PhaseProvider";

export function useHackathonPhase() {
  const { phase, features, dates } = usePhaseSnapshot();

  return {
    phase,
    features,
    dates,
    isFeatureEnabled: (featureName: keyof PhaseFeatures) =>
      features[featureName] as boolean,
    isPhase: (...phases: HackathonPhase[]) => phases.includes(phase),
    areApplicationsOpen: phase === "registration-open",
    isEventActive: phase === "during-event",
    isEventConcluded: phase === "post-event",
    eventDate: new Date(dates.eventStart),
    applicationDeadline: new Date(dates.registrationClose),
  };
}

export function useFeatureFlag(featureName: keyof PhaseFeatures): boolean {
  const { features } = usePhaseSnapshot();
  return features[featureName] as boolean;
}

export function usePhaseCheck(...phases: HackathonPhase[]): boolean {
  const { phase } = usePhaseSnapshot();
  return phases.includes(phase);
}

export function usePhaseConfig() {
  const { dates, phase } = usePhaseSnapshot();
  return {
    applicationDeadline: new Date(dates.registrationClose),
    eventDate: new Date(dates.eventStart),
    areApplicationsOpen: phase === "registration-open",
    isEventActive: phase === "during-event",
    isEventConcluded: phase === "post-event",
  };
}
