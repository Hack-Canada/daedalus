/**
 * Phase feature matrix and pure date resolution.
 * The live phase is chosen in lib/phase.ts (cookie, env, then the eventConfig row).
 */

export const HACKATHON_PHASES = [
  "pre-registration",
  "registration-open",
  "pre-event",
  "during-event",
  "post-event",
] as const;

export type HackathonPhase = (typeof HACKATHON_PHASES)[number];

export const PHASE_PREVIEW_COOKIE = "hc-phase";

export type PhaseDates = {
  registrationOpen: Date;
  registrationClose: Date;
  eventStart: Date;
  eventEnd: Date;
};

// Phase dates - keep HEAD's functional dates
export const phaseDates = {
  registrationOpen: new Date("2026-02-05T00:00:00-05:00"),
  registrationClose: new Date("2026-02-28T23:59:59-05:00"),
  eventStart: new Date("2026-03-06T16:00:00-05:00"),
  eventEnd: new Date("2026-03-08T16:00:00-05:00"),
} as const;

// Phase features
export interface PhaseFeatures {
  // Authentication & Registration
  userRegistration: boolean;
  oauthSignIn: boolean;

  // Applications
  applicationSubmission: boolean;
  applicationSaving: boolean;
  applicationViewing: boolean;

  // RSVP
  rsvpAccess: boolean;
  rsvpCancellation: boolean;

  // Dashboard Components
  showApplicationStatus: boolean;
  showHackathonConclusion: boolean;
  showCountdown: boolean;
  showProjectsCard: boolean;
  showHackerPackage: boolean;
  showDiscordInvite: boolean;

  // Check-ins & QR
  qrCodeCheckIns: boolean;
  qrCodeDisplay: boolean;

  // Profile & Updates
  profileUpdates: boolean;

  // Schedule
  scheduleVisible: boolean;

  // Content Messages
  contactMessage: "pre-event" | "during-event" | "post-event";
}

export const phaseFeatures: Record<HackathonPhase, PhaseFeatures> = {
  "pre-registration": {
    userRegistration: false,
    oauthSignIn: false,
    applicationSubmission: false,
    applicationSaving: false,
    applicationViewing: true,
    rsvpAccess: false,
    rsvpCancellation: false,
    showApplicationStatus: true,
    showHackathonConclusion: false,
    showCountdown: true,
    showProjectsCard: false,
    showHackerPackage: false,
    showDiscordInvite: true,
    qrCodeCheckIns: false,
    qrCodeDisplay: false,
    profileUpdates: false,
    scheduleVisible: true,
    contactMessage: "pre-event",
  },

  "registration-open": {
    userRegistration: true,
    oauthSignIn: true,
    applicationSubmission: true,
    applicationSaving: true,
    applicationViewing: true,
    rsvpAccess: true,
    rsvpCancellation: true,
    showApplicationStatus: true,
    showHackathonConclusion: false,
    showCountdown: true,
    showProjectsCard: false,
    showHackerPackage: false,
    showDiscordInvite: true,
    qrCodeCheckIns: false,
    qrCodeDisplay: false,
    profileUpdates: true,
    scheduleVisible: true,
    contactMessage: "pre-event",
  },

  "pre-event": {
    userRegistration: true,
    oauthSignIn: true,
    applicationSubmission: false,
    applicationSaving: false,
    applicationViewing: true,
    rsvpAccess: true,
    rsvpCancellation: true,
    showApplicationStatus: true,
    showHackathonConclusion: false,
    showCountdown: true,
    showProjectsCard: false,
    showHackerPackage: true,
    showDiscordInvite: true,
    qrCodeCheckIns: false,
    qrCodeDisplay: true,
    profileUpdates: true,
    scheduleVisible: true,
    contactMessage: "pre-event",
  },

  "during-event": {
    userRegistration: true,
    oauthSignIn: true,
    applicationSubmission: false,
    applicationSaving: false,
    applicationViewing: true,
    rsvpAccess: true,
    rsvpCancellation: true,
    showApplicationStatus: true,
    showHackathonConclusion: false,
    showCountdown: false,
    showProjectsCard: false,
    showHackerPackage: true,
    showDiscordInvite: true,
    qrCodeCheckIns: true,
    qrCodeDisplay: true,
    profileUpdates: true,
    scheduleVisible: true,
    contactMessage: "during-event",
  },

  "post-event": {
    userRegistration: false,
    oauthSignIn: true,
    applicationSubmission: false,
    applicationSaving: false,
    applicationViewing: true,
    rsvpAccess: false,
    rsvpCancellation: false,
    showApplicationStatus: false,
    showHackathonConclusion: true,
    showCountdown: false,
    showProjectsCard: true,
    showHackerPackage: false,
    showDiscordInvite: true,
    qrCodeCheckIns: false,
    qrCodeDisplay: false,
    profileUpdates: false,
    scheduleVisible: true,
    contactMessage: "post-event",
  },
};

export type PhaseSnapshot = {
  phase: HackathonPhase;
  features: PhaseFeatures;
  dates: {
    registrationOpen: string;
    registrationClose: string;
    eventStart: string;
    eventEnd: string;
  };
  /** Dev cookie phase when that cookie is what won. Otherwise null. */
  preview: HackathonPhase | null;
};

export function isHackathonPhase(phase: string): phase is HackathonPhase {
  return (HACKATHON_PHASES as readonly string[]).includes(phase);
}

export function phaseFromDates(now: Date, dates: PhaseDates): HackathonPhase {
  const currentTime = now.getTime();

  if (currentTime < dates.registrationOpen.getTime()) {
    return "pre-registration";
  }

  if (currentTime < dates.registrationClose.getTime()) {
    return "registration-open";
  }

  if (currentTime < dates.eventStart.getTime()) {
    return "pre-event";
  }

  if (currentTime < dates.eventEnd.getTime()) {
    return "during-event";
  }

  return "post-event";
}

export function resolvePhase(input: {
  now: Date;
  dates: PhaseDates;
  cookiePhase?: string | null;
  envPhase?: string | null;
  dbPhase?: string | null;
}): HackathonPhase {
  if (input.cookiePhase && isHackathonPhase(input.cookiePhase)) {
    return input.cookiePhase;
  }

  if (input.envPhase && isHackathonPhase(input.envPhase)) {
    return input.envPhase;
  }

  if (input.dbPhase && isHackathonPhase(input.dbPhase)) {
    return input.dbPhase;
  }

  return phaseFromDates(input.now, input.dates);
}

export function getPhaseFeatures(phase: HackathonPhase): PhaseFeatures {
  return phaseFeatures[phase];
}

function assertResolvePhase() {
  const early = new Date("2020-01-01T00:00:00Z");
  const afterEvent = new Date("2026-10-07T16:00:00Z");

  if (
    resolvePhase({
      now: early,
      dates: phaseDates,
      cookiePhase: "during-event",
      envPhase: "pre-registration",
      dbPhase: "post-event",
    }) !== "during-event"
  ) {
    throw new Error("phase cookie must beat env and the database");
  }

  if (
    resolvePhase({
      now: early,
      dates: phaseDates,
      envPhase: "pre-event",
      dbPhase: "post-event",
    }) !== "pre-event"
  ) {
    throw new Error("phase env must beat the database");
  }

  if (
    resolvePhase({
      now: early,
      dates: phaseDates,
      dbPhase: "registration-open",
    }) !== "registration-open"
  ) {
    throw new Error("locked database phase must beat the dates");
  }

  if (resolvePhase({ now: early, dates: phaseDates }) !== "pre-registration") {
    throw new Error("dates must decide when nothing is forced");
  }

  if (resolvePhase({ now: afterEvent, dates: phaseDates }) !== "post-event") {
    throw new Error("a date after event end must be post-event");
  }

  if (
    resolvePhase({
      now: afterEvent,
      dates: phaseDates,
      cookiePhase: "nope",
      envPhase: "registration-open",
    }) !== "registration-open"
  ) {
    throw new Error("an invalid override must fall through");
  }
}

if (process.env.NODE_ENV === "development") {
  assertResolvePhase();
}
