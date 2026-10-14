import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import {
  getPhaseFeatures,
  isHackathonPhase,
  PHASE_PREVIEW_COOKIE,
  phaseDates,
  resolvePhase,
  type PhaseDates,
  type PhaseSnapshot,
} from "@/config/phases";
import { db } from "@/lib/db";
import { eventConfig } from "@/lib/db/schema";

type CachedEventConfig = {
  phase: string | null;
  registrationOpen: string;
  registrationClose: string;
  eventStart: string;
  eventEnd: string;
};

const loadEventConfig = unstable_cache(
  async (): Promise<CachedEventConfig | null> => {
    const [row] = await db
      .select()
      .from(eventConfig)
      .where(eq(eventConfig.id, "default"))
      .limit(1);

    if (!row) return null;

    return {
      phase: row.phase,
      registrationOpen: row.registrationOpen.toISOString(),
      registrationClose: row.registrationClose.toISOString(),
      eventStart: row.eventStart.toISOString(),
      eventEnd: row.eventEnd.toISOString(),
    };
  },
  ["event-config"],
  { revalidate: 30, tags: ["event-phase"] },
);

function toIsoDates(dates: PhaseDates) {
  return {
    registrationOpen: dates.registrationOpen.toISOString(),
    registrationClose: dates.registrationClose.toISOString(),
    eventStart: dates.eventStart.toISOString(),
    eventEnd: dates.eventEnd.toISOString(),
  };
}

export const getPhaseState = cache(async (): Promise<PhaseSnapshot> => {
  let dates: PhaseDates = phaseDates;
  let dbPhase: string | null = null;

  try {
    const row = await loadEventConfig();
    if (row) {
      dates = {
        registrationOpen: new Date(row.registrationOpen),
        registrationClose: new Date(row.registrationClose),
        eventStart: new Date(row.eventStart),
        eventEnd: new Date(row.eventEnd),
      };
      dbPhase = row.phase;
    }
  } catch (error) {
    console.error("Failed to read eventConfig:", error);
  }

  const jar = await cookies();
  const rawCookie =
    process.env.NODE_ENV === "development"
      ? jar.get(PHASE_PREVIEW_COOKIE)?.value
      : undefined;
  // ponytail: missing dev cookie means registration-open. "config" is the explicit fallthrough.
  const cookiePhase =
    process.env.NODE_ENV === "development" && rawCookie == null
      ? "registration-open"
      : rawCookie;
  const phase = resolvePhase({
    now: new Date(),
    dates,
    cookiePhase,
    envPhase: process.env.FORCE_HACKATHON_PHASE,
    dbPhase,
  });

  return {
    phase,
    features: getPhaseFeatures(phase),
    dates: toIsoDates(dates),
    preview: cookiePhase && isHackathonPhase(cookiePhase) ? cookiePhase : null,
  };
});
