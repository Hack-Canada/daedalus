import { eq } from "drizzle-orm";

import { MIN_TEAM_APPLY } from "@/config/apply";
import { teamAnswerError } from "@/lib/validations/application";

import { db } from "..";
import {
  hackerApplications,
  HackerApplicationsInsertData,
  teamMembers,
  teams,
  users,
} from "../schema";

export const getHackerApplicationByUserId = async (userId: string) => {
  try {
    const [application] = await db
      .select()
      .from(hackerApplications)
      .where(eq(hackerApplications.userId, userId));
    return application;
  } catch (error) {
    console.error(
      "Error fetching application in getApplicationByID function: ",
      error,
    );
    return null;
  }
};

export class ApplicationConflict extends Error {}

export function assertRevision(actual: number, expected: unknown) {
  if (!Number.isSafeInteger(expected) || expected !== actual) {
    throw new ApplicationConflict(
      "Your application changed in another tab. Copy your unsaved answers before reloading to review the latest saved version.",
    );
  }
}

// All draft, track and submission writes serialize on the same existing user
// row, including the first save when there is no application row to lock yet.
export async function writeApplication(
  data: HackerApplicationsInsertData,
  expectedRevision: number,
  submit = false,
) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .for("no key update");
    if (!user) throw new ApplicationConflict("Sign in again before saving.");
    const [existing] = await tx
      .select()
      .from(hackerApplications)
      .where(eq(hackerApplications.userId, data.userId));
    // A retry may finish the existing second submission stage, but must never
    // overwrite the answers already committed by the first stage.
    if (
      submit &&
      existing?.submissionStatus === "submitted" &&
      user.role === "unassigned" &&
      user.applicationStatus === "not_applied"
    ) {
      return { application: existing };
    }
    if (
      user.role !== "unassigned" ||
      user.applicationStatus !== "not_applied" ||
      existing?.submissionStatus === "submitted"
    ) {
      throw new ApplicationConflict(
        "This application has already been submitted or received a decision.",
      );
    }
    assertRevision(existing?.revision ?? 0, expectedRevision);

    let teamSnapshot = null;
    const [membership] = await tx
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, data.userId));
    let isTeam = false;
    if (membership) {
      const [team] = await tx
        .select()
        .from(teams)
        .where(eq(teams.id, membership.teamId))
        .for("update");
      const members = team
        ? await tx
            .select()
            .from(teamMembers)
            .where(eq(teamMembers.teamId, team.id))
        : [];
      const mine = members.find(
        (member) =>
          member.userId === data.userId &&
          member.membershipId === membership.membershipId,
      );
      isTeam = Boolean(mine);
      if (submit && data.applicationType === "team" && team && mine) {
        const error = teamAnswerError(mine.marsAnswer || "", team.essay || "");
        if (members.length < MIN_TEAM_APPLY || error) {
          throw new ApplicationConflict(
            error ||
              `A team application needs at least ${MIN_TEAM_APPLY} people, including you.`,
          );
        }
        teamSnapshot = {
          teamId: team.id,
          name: team.name,
          essay: team.essay,
          essayRevision: team.essayRevision,
          members,
        };
      }
    }
    if (submit && data.applicationType === "team" && !teamSnapshot) {
      throw new ApplicationConflict(
        "Your team changed. Reload and check your team before submitting.",
      );
    }
    const values = {
      ...data,
      isTeam,
      revision: (existing?.revision ?? 0) + 1,
      submissionStatus: submit ? "submitted" : "draft",
      updatedAt: new Date(),
      ...(submit ? { submittedAt: new Date(), teamSnapshot } : {}),
    };
    const [application] = await tx
      .insert(hackerApplications)
      .values(values)
      .onConflictDoUpdate({ target: hackerApplications.userId, set: values })
      .returning();
    return { application };
  });
}

export async function setApplicationTrack(
  userId: string,
  track: "quick" | "normal" | "team",
  expectedRevision: number,
) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for("no key update");
    const [existing] = await tx
      .select()
      .from(hackerApplications)
      .where(eq(hackerApplications.userId, userId));
    if (
      !user ||
      user.role !== "unassigned" ||
      user.applicationStatus !== "not_applied" ||
      !existing ||
      existing.submissionStatus === "submitted"
    ) {
      throw new ApplicationConflict(
        "This application can no longer change tracks.",
      );
    }
    assertRevision(existing.revision, expectedRevision);
    await tx
      .update(hackerApplications)
      .set({
        applicationType: track,
        ...(track === "normal"
          ? {}
          : { shortAnswer1: null, shortAnswer2: null }),
        revision: existing.revision + 1,
        updatedAt: new Date(),
      })
      .where(eq(hackerApplications.userId, userId));
    return { success: true, message: "Track updated." };
  });
}

// Preserve the existing separate status transition. Submission atomicity (issue 2)
// is outside this change; never rewrite answers from this second stage.
export async function completeApplicationSubmission(userId: string) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for("no key update");
    const [application] = await tx
      .select()
      .from(hackerApplications)
      .where(eq(hackerApplications.userId, userId));
    if (!user || application?.submissionStatus !== "submitted") {
      throw new ApplicationConflict(
        "The submitted application could not be found.",
      );
    }
    if (
      user.role === "unassigned" &&
      user.applicationStatus === "not_applied"
    ) {
      await tx
        .update(users)
        .set({ applicationStatus: "pending", updatedAt: new Date() })
        .where(eq(users.id, userId));
    }
  });
}
