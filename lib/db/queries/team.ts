import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import {
  ESSAY_WORD_LIMIT,
  LOOKING_FOR_LIMIT,
  MARS_WORD_LIMIT,
  MAX_TEAM_SIZE,
  REQUEST_COOLDOWN_MS,
  REQUEST_NOTE_LIMIT,
} from "@/config/apply";
import { requestBlockReason } from "@/lib/apply/requests";
import {
  ApplicantShare,
  InvitePreview,
  MyRequestView,
  MyTeamView,
  PublicTeamCard,
  RequestCardView,
  SharedProfile,
} from "@/lib/apply/team-types";
import { wordCount } from "@/lib/apply/words";

import { db } from "..";
import {
  hackerApplications,
  teamMembers,
  teamRequests,
  teams,
  users,
} from "../schema";

export type TeamMail =
  | {
      kind: "request";
      to: string;
      ownerName: string;
      requesterName: string;
      teamName: string;
    }
  | { kind: "accepted"; to: string; name: string; teamName: string };

type Result =
  | { success: true; message: string; revision?: number; mail?: TeamMail }
  | { success: false; message: string; conflict?: boolean };

function displayName(firstName: string | null, name: string) {
  return firstName?.trim() || name.trim().split(/\s+/)[0] || "Teammate";
}

function makeInviteToken() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString(
    "base64url",
  );
}

function cleanNote(value: string, limit: number) {
  const trimmed = value.trim();
  if (trimmed.length > limit) return { ok: false as const };
  return { ok: true as const, value: trimmed };
}

function profileFrom(
  row: {
    firstName: string | null;
    lastName: string | null;
    school: string | null;
    country: string | null;
    levelOfStudy: string | null;
    hackathonsAttended: string | null;
    linkedin: string | null;
    github: string | null;
    xUrl: string | null;
    personalWebsite: string | null;
  } | null,
): ApplicantShare {
  const text = (value: string | null | undefined) => value?.trim() ?? "";
  const profile: SharedProfile = {
    name: [text(row?.firstName), text(row?.lastName)].filter(Boolean).join(" "),
    school: text(row?.school),
    country: text(row?.country),
    levelOfStudy: text(row?.levelOfStudy),
    hackathonsAttended: text(row?.hackathonsAttended),
    linkedin: text(row?.linkedin),
    github: text(row?.github),
    xUrl: text(row?.xUrl),
    personalWebsite: text(row?.personalWebsite),
  };
  return {
    ready: Boolean(
      text(row?.firstName) &&
      text(row?.lastName) &&
      profile.school &&
      profile.levelOfStudy,
    ),
    profile,
  };
}

const shareColumns = {
  firstName: hackerApplications.firstName,
  lastName: hackerApplications.lastName,
  school: hackerApplications.school,
  country: hackerApplications.country,
  levelOfStudy: hackerApplications.levelOfStudy,
  hackathonsAttended: hackerApplications.hackathonsAttended,
  linkedin: hackerApplications.linkedin,
  github: hackerApplications.github,
  xUrl: hackerApplications.xUrl,
  personalWebsite: hackerApplications.personalWebsite,
};

async function applicantShare(userId: string) {
  const [row] = await db
    .select(shareColumns)
    .from(hackerApplications)
    .where(eq(hackerApplications.userId, userId));
  return profileFrom(row ?? null);
}

export async function getApplicantShare(
  userId: string,
): Promise<ApplicantShare> {
  return applicantShare(userId);
}

function cooldownUntil(decidedAt: Date | null) {
  if (!decidedAt) return null;
  const until = decidedAt.getTime() + REQUEST_COOLDOWN_MS;
  return until > Date.now() ? new Date(until).toISOString() : null;
}

export async function getTeamForUser(
  userId: string,
): Promise<MyTeamView | null> {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  if (!membership) return null;

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId));
  if (!team) return null;

  const members = await db
    .select({
      userId: teamMembers.userId,
      marsAnswer: teamMembers.marsAnswer,
      marsRevision: teamMembers.marsRevision,
      membershipId: teamMembers.membershipId,
      joinedAt: teamMembers.joinedAt,
      firstName: hackerApplications.firstName,
      name: users.name,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .leftJoin(
      hackerApplications,
      eq(hackerApplications.userId, teamMembers.userId),
    )
    .where(eq(teamMembers.teamId, team.id))
    .orderBy(asc(teamMembers.joinedAt));

  let essayUpdatedByName: string | null = null;
  if (team.essayUpdatedBy) {
    const [editor] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, team.essayUpdatedBy));
    essayUpdatedByName = editor?.name ?? null;
  }

  const isOwner = team.createdBy === userId;
  let requests: RequestCardView[] = [];
  if (isOwner) {
    const rows = await db
      .select({
        id: teamRequests.id,
        message: teamRequests.message,
        via: teamRequests.via,
        createdAt: teamRequests.createdAt,
        ...shareColumns,
      })
      .from(teamRequests)
      .leftJoin(
        hackerApplications,
        eq(hackerApplications.userId, teamRequests.userId),
      )
      .where(
        and(
          eq(teamRequests.teamId, team.id),
          eq(teamRequests.status, "pending"),
        ),
      )
      .orderBy(asc(teamRequests.createdAt));

    requests = rows.map((row) => ({
      id: row.id,
      message: row.message?.trim() ?? "",
      via: row.via === "link" ? "link" : "public",
      createdAt: row.createdAt.toISOString(),
      profile: profileFrom(row).profile,
    }));
  }

  return {
    id: team.id,
    essayRevision: team.essayRevision,
    name: team.name,
    isPublic: team.isPublic,
    lookingFor: team.lookingFor?.trim() ?? "",
    answersLocked: team.answersLocked,
    essay: team.essay || "",
    essayUpdatedAt: team.essayUpdatedAt?.toISOString() ?? null,
    essayUpdatedByName,
    invitePath: `/apply/teams/join/${team.inviteToken}`,
    isOwner,
    members: members.map((member) => ({
      firstName: displayName(member.firstName, member.name),
      marsAnswer: member.marsAnswer || "",
      marsRevision: member.marsRevision,
      membershipId: member.membershipId,
      isOwner: member.userId === team.createdBy,
      isMe: member.userId === userId,
      ...(isOwner ? { userId: member.userId } : {}),
    })),
    requests,
    pendingCount: requests.length,
  };
}

export async function listPublicTeams(
  viewerId: string,
): Promise<PublicTeamCard[]> {
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      lookingFor: teams.lookingFor,
      memberId: teamMembers.userId,
      firstName: hackerApplications.firstName,
      userName: users.name,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .leftJoin(
      hackerApplications,
      eq(hackerApplications.userId, teamMembers.userId),
    )
    .where(eq(teams.isPublic, true))
    .orderBy(asc(teams.name), asc(teamMembers.joinedAt));

  const requests = await db
    .select({
      id: teamRequests.id,
      teamId: teamRequests.teamId,
      status: teamRequests.status,
      decidedAt: teamRequests.decidedAt,
    })
    .from(teamRequests)
    .where(
      and(
        eq(teamRequests.userId, viewerId),
        inArray(teamRequests.status, ["pending", "declined"]),
      ),
    );

  const grouped = new Map<string, PublicTeamCard>();
  for (const row of rows) {
    const current = grouped.get(row.id);
    if (!current) {
      const mine = requests.filter((request) => request.teamId === row.id);
      const pendingRow = mine.find((request) => request.status === "pending");
      const declined = mine
        .filter((request) => request.status === "declined" && request.decidedAt)
        .sort((a, b) => b.decidedAt!.getTime() - a.decidedAt!.getTime())[0];
      grouped.set(row.id, {
        id: row.id,
        name: row.name,
        lookingFor: row.lookingFor?.trim() ?? "",
        memberCount: 1,
        spotsLeft: MAX_TEAM_SIZE - 1,
        memberFirstNames: [displayName(row.firstName, row.userName)],
        mine: row.memberId === viewerId,
        requestStatus: pendingRow ? "pending" : null,
        requestId: pendingRow?.id ?? null,
        cooldownUntil: pendingRow
          ? null
          : cooldownUntil(declined?.decidedAt ?? null),
      });
      continue;
    }
    current.memberCount += 1;
    current.spotsLeft = MAX_TEAM_SIZE - current.memberCount;
    current.memberFirstNames.push(displayName(row.firstName, row.userName));
    if (row.memberId === viewerId) current.mine = true;
  }

  return Array.from(grouped.values());
}

export async function listMyRequests(userId: string): Promise<MyRequestView[]> {
  const rows = await db
    .select({
      id: teamRequests.id,
      teamName: teams.name,
      status: teamRequests.status,
      createdAt: teamRequests.createdAt,
      decidedAt: teamRequests.decidedAt,
    })
    .from(teamRequests)
    .innerJoin(teams, eq(teams.id, teamRequests.teamId))
    .where(
      and(
        eq(teamRequests.userId, userId),
        inArray(teamRequests.status, ["pending", "declined"]),
      ),
    )
    .orderBy(desc(teamRequests.createdAt));

  return rows.flatMap((row) => {
    if (row.status === "declined" && !cooldownUntil(row.decidedAt)) return [];
    return [
      {
        id: row.id,
        teamName: row.teamName,
        status:
          row.status === "pending"
            ? ("pending" as const)
            : ("declined" as const),
        createdAt: row.createdAt.toISOString(),
      },
    ];
  });
}

// Public by token: only what the share card prints. No member names.
export async function getTeamCard(token: string) {
  if (!token || token.length > 128) return null;
  const [team] = await db
    .select({
      name: teams.name,
      lookingFor: teams.lookingFor,
      memberCount: sql<number>`(select count(*)::int from ${teamMembers} where ${teamMembers.teamId} = ${teams.id})`,
    })
    .from(teams)
    .where(eq(teams.inviteToken, token));
  if (!team) return null;
  return {
    name: team.name,
    lookingFor: team.lookingFor?.trim() ?? "",
    memberCount: team.memberCount,
    spotsLeft: Math.max(0, MAX_TEAM_SIZE - team.memberCount),
  };
}

export async function getInvitePreview(
  token: string,
  viewerId: string,
): Promise<InvitePreview | null> {
  if (!token || token.length > 128) return null;
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.inviteToken, token));
  if (!team) return null;

  const members = await db
    .select({
      userId: teamMembers.userId,
      firstName: hackerApplications.firstName,
      name: users.name,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .leftJoin(
      hackerApplications,
      eq(hackerApplications.userId, teamMembers.userId),
    )
    .where(eq(teamMembers.teamId, team.id))
    .orderBy(asc(teamMembers.joinedAt));

  const requests = await db
    .select({
      id: teamRequests.id,
      status: teamRequests.status,
      decidedAt: teamRequests.decidedAt,
    })
    .from(teamRequests)
    .where(
      and(eq(teamRequests.userId, viewerId), eq(teamRequests.teamId, team.id)),
    );

  const pendingRow = requests.find((request) => request.status === "pending");
  const declined = requests
    .filter((request) => request.status === "declined" && request.decidedAt)
    .sort((a, b) => b.decidedAt!.getTime() - a.decidedAt!.getTime())[0];

  return {
    name: team.name,
    lookingFor: team.lookingFor?.trim() ?? "",
    memberCount: members.length,
    spotsLeft: MAX_TEAM_SIZE - members.length,
    memberFirstNames: members.map((member) =>
      displayName(member.firstName, member.name),
    ),
    mine: members.some((member) => member.userId === viewerId),
    requestStatus: pendingRow ? "pending" : null,
    requestId: pendingRow?.id ?? null,
    cooldownUntil: pendingRow
      ? null
      : cooldownUntil(declined?.decidedAt ?? null),
  };
}

export async function createTeam(
  userId: string,
  name: string,
  isPublic: boolean,
  lookingFor: string,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) {
    return { success: false, message: "Team name must be 1 to 60 characters." };
  }
  const note = cleanNote(lookingFor, LOOKING_FOR_LIMIT);
  if (!note.ok) {
    return {
      success: false,
      message: `Say what you're looking for in ${LOOKING_FOR_LIMIT} characters or less.`,
    };
  }

  const [existing] = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  if (existing)
    return { success: false, message: "Leave your current team first." };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .for("no key update");
        const [created] = await tx
          .insert(teams)
          .values({
            name: trimmed,
            isPublic,
            inviteToken: makeInviteToken(),
            lookingFor: note.value || null,
            createdBy: userId,
          })
          .returning();
        await tx.insert(teamMembers).values({ teamId: created.id, userId });
        await tx
          .update(hackerApplications)
          .set({ isTeam: true, updatedAt: new Date() })
          .where(eq(hackerApplications.userId, userId));
      });
      return { success: true, message: "Team created." };
    } catch (error) {
      const text = String(error);
      if (text.includes("teamMember_userId") || text.includes("userId")) {
        return { success: false, message: "Leave your current team first." };
      }
      if (attempt === 4 || !text.includes("inviteToken")) {
        console.error("Create team failed:", error);
        return {
          success: false,
          message: "Could not create a team. Please try again.",
        };
      }
    }
  }
  return {
    success: false,
    message: "Could not create a team. Please try again.",
  };
}

async function lockOwnedTeam(userId: string) {
  const [membership] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  if (!membership) return null;
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId));
  if (!team || team.createdBy !== userId) return null;
  return team;
}

export async function updateTeamSettings(
  userId: string,
  name: string,
  isPublic: boolean,
  lookingFor: string,
): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) {
    return { success: false, message: "Team name must be 1 to 60 characters." };
  }
  const note = cleanNote(lookingFor, LOOKING_FOR_LIMIT);
  if (!note.ok) {
    return {
      success: false,
      message: `Say what you're looking for in ${LOOKING_FOR_LIMIT} characters or less.`,
    };
  }
  const team = await lockOwnedTeam(userId);
  if (!team)
    return {
      success: false,
      message: "Only the team owner can change these settings.",
    };

  const [saved] = await db
    .update(teams)
    .set({ name: trimmed, isPublic, lookingFor: note.value || null })
    .where(and(eq(teams.id, team.id), eq(teams.createdBy, userId)))
    .returning({ id: teams.id });
  if (!saved)
    return {
      success: false,
      message: "Only the team owner can change these settings.",
    };
  return { success: true, message: "Team settings saved." };
}

export async function resetInvite(userId: string): Promise<Result> {
  const team = await lockOwnedTeam(userId);
  if (!team)
    return {
      success: false,
      message: "Only the team owner can reset the link.",
    };

  const [saved] = await db
    .update(teams)
    .set({ inviteToken: makeInviteToken() })
    .where(and(eq(teams.id, team.id), eq(teams.createdBy, userId)))
    .returning({ id: teams.id });
  if (!saved)
    return {
      success: false,
      message: "Only the team owner can reset the link.",
    };
  return {
    success: true,
    message: "Team link reset. The old link no longer works.",
  };
}

export async function createTeamRequest(
  userId: string,
  input: { teamId?: string; token?: string; message: string },
): Promise<Result> {
  const note = cleanNote(input.message, REQUEST_NOTE_LIMIT);
  if (!note.ok) {
    return {
      success: false,
      message: `Keep your note to ${REQUEST_NOTE_LIMIT} characters or less.`,
    };
  }
  const share = await applicantShare(userId);
  if (!share.ready) {
    return {
      success: false,
      message:
        "Save your name, school, and level of study on your application before asking to join a team.",
    };
  }

  try {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`select "id" from "user" where "id" = ${userId} for no key update`,
      );

      const [member] = await tx
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId));
      if (member)
        return {
          success: false as const,
          message: "Leave your current team first.",
        };

      const [team] = input.token
        ? await tx
            .select()
            .from(teams)
            .where(eq(teams.inviteToken, input.token))
        : await tx
            .select()
            .from(teams)
            .where(eq(teams.id, input.teamId || ""));
      if (!team)
        return {
          success: false as const,
          message: "That team is not available.",
        };
      if (!input.token && !team.isPublic) {
        return { success: false as const, message: "That team is not public." };
      }
      if (team.createdBy === userId) {
        return {
          success: false as const,
          message: "You already own this team.",
        };
      }

      await tx.execute(
        sql`select "id" from "team" where "id" = ${team.id} for update`,
      );
      const [countRow] = await tx
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));
      if (Number(countRow?.count ?? 0) >= MAX_TEAM_SIZE) {
        return { success: false as const, message: "This team is full." };
      }

      const pending = await tx
        .select({ teamId: teamRequests.teamId })
        .from(teamRequests)
        .where(
          and(
            eq(teamRequests.userId, userId),
            eq(teamRequests.status, "pending"),
          ),
        );
      const [declined] = await tx
        .select({ decidedAt: teamRequests.decidedAt })
        .from(teamRequests)
        .where(
          and(
            eq(teamRequests.userId, userId),
            eq(teamRequests.teamId, team.id),
            eq(teamRequests.status, "declined"),
          ),
        )
        .orderBy(desc(teamRequests.decidedAt))
        .limit(1);

      const blocked = requestBlockReason({
        pendingCount: pending.length,
        alreadyPendingHere: pending.some((row) => row.teamId === team.id),
        declinedAt: declined?.decidedAt?.getTime() ?? null,
        now: Date.now(),
      });
      if (blocked) return { success: false as const, message: blocked };

      await tx.insert(teamRequests).values({
        teamId: team.id,
        userId,
        status: "pending",
        via: input.token ? "link" : "public",
        message: note.value || null,
        consentAt: new Date(),
      });

      const [owner] = await tx
        .select({
          email: users.email,
          name: users.name,
          firstName: hackerApplications.firstName,
        })
        .from(users)
        .leftJoin(hackerApplications, eq(hackerApplications.userId, users.id))
        .where(eq(users.id, team.createdBy));

      const mail: TeamMail | undefined = owner?.email
        ? {
            kind: "request",
            to: owner.email,
            ownerName: displayName(owner.firstName, owner.name),
            requesterName: share.profile.name.split(/\s+/)[0] || "Someone",
            teamName: team.name,
          }
        : undefined;

      return {
        success: true as const,
        message: "Request sent. The owner will decide.",
        mail,
      };
    });
  } catch (error) {
    console.error("Create team request failed:", error);
    return {
      success: false,
      message: "Could not send that request. Please try again.",
    };
  }
}

export async function cancelTeamRequest(
  userId: string,
  requestId: string,
): Promise<Result> {
  const [row] = await db
    .update(teamRequests)
    .set({ status: "cancelled", decidedAt: new Date() })
    .where(
      and(
        eq(teamRequests.id, requestId),
        eq(teamRequests.userId, userId),
        eq(teamRequests.status, "pending"),
      ),
    )
    .returning({ id: teamRequests.id });
  if (!row)
    return { success: false, message: "That request is no longer open." };
  return { success: true, message: "Request cancelled." };
}

export async function decideTeamRequest(
  ownerId: string,
  requestId: string,
  decision: "accept" | "decline",
): Promise<Result> {
  try {
    return await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(teamRequests)
        .where(eq(teamRequests.id, requestId));
      if (!request || request.status !== "pending") {
        return {
          success: false as const,
          message: "That request is no longer open.",
        };
      }

      await tx
        .select()
        .from(users)
        .where(eq(users.id, request.userId))
        .for("no key update");
      await tx.execute(
        sql`select "id" from "team" where "id" = ${request.teamId} for update`,
      );
      const [team] = await tx
        .select()
        .from(teams)
        .where(eq(teams.id, request.teamId));
      if (!team || team.createdBy !== ownerId) {
        return {
          success: false as const,
          message: "Only the team owner can decide requests.",
        };
      }

      if (decision === "decline") {
        await tx
          .update(teamRequests)
          .set({
            status: "declined",
            decidedAt: new Date(),
            decidedBy: ownerId,
          })
          .where(
            and(
              eq(teamRequests.id, requestId),
              eq(teamRequests.status, "pending"),
            ),
          );
        return { success: true as const, message: "Request declined." };
      }

      const [already] = await tx
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, request.userId));
      if (already) {
        await tx
          .update(teamRequests)
          .set({
            status: "cancelled",
            decidedAt: new Date(),
            decidedBy: ownerId,
          })
          .where(eq(teamRequests.id, requestId));
        return {
          success: false as const,
          message: "That person already joined a team.",
        };
      }

      const [countRow] = await tx
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));
      if (Number(countRow?.count ?? 0) >= MAX_TEAM_SIZE) {
        return { success: false as const, message: "This team is full." };
      }

      await tx
        .insert(teamMembers)
        .values({ teamId: team.id, userId: request.userId });
      const now = new Date();
      await tx
        .update(teamRequests)
        .set({ status: "accepted", decidedAt: now, decidedBy: ownerId })
        .where(eq(teamRequests.id, requestId));
      await tx
        .update(teamRequests)
        .set({ status: "cancelled", decidedAt: now, decidedBy: ownerId })
        .where(
          and(
            eq(teamRequests.userId, request.userId),
            eq(teamRequests.status, "pending"),
          ),
        );
      await tx
        .update(hackerApplications)
        .set({ isTeam: true, updatedAt: now })
        .where(eq(hackerApplications.userId, request.userId));

      const [person] = await tx
        .select({
          email: users.email,
          name: users.name,
          firstName: hackerApplications.firstName,
        })
        .from(users)
        .leftJoin(hackerApplications, eq(hackerApplications.userId, users.id))
        .where(eq(users.id, request.userId));

      const mail: TeamMail | undefined = person?.email
        ? {
            kind: "accepted",
            to: person.email,
            name: displayName(person.firstName, person.name),
            teamName: team.name,
          }
        : undefined;
      return { success: true as const, message: "They're on the team.", mail };
    });
  } catch (error) {
    console.error("Decide team request failed:", error);
    return {
      success: false,
      message: "Could not update that request. Please try again.",
    };
  }
}

export async function removeMember(
  ownerId: string,
  memberUserId: string,
): Promise<Result> {
  if (ownerId === memberUserId)
    return { success: false, message: "Use leave team to remove yourself." };
  return db.transaction(async (tx) => {
    await tx
      .select()
      .from(users)
      .where(eq(users.id, memberUserId))
      .for("no key update");
    const context = await lockMembership(tx, ownerId);
    if (!context || context.team.createdBy !== ownerId)
      return {
        success: false,
        message: "Only the team owner can remove someone.",
      };
    const [removed] = await tx
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, context.team.id),
          eq(teamMembers.userId, memberUserId),
        ),
      )
      .returning();
    if (!removed)
      return { success: false, message: "That person is not on your team." };
    await tx
      .update(hackerApplications)
      .set({ isTeam: false, updatedAt: new Date() })
      .where(eq(hackerApplications.userId, memberUserId));
    return { success: true, message: "Removed from the team." };
  });
}

export async function transferOwnership(
  ownerId: string,
  memberUserId: string,
): Promise<Result> {
  if (ownerId === memberUserId)
    return {
      success: false,
      message: "Pick a teammate to transfer ownership to.",
    };
  return db.transaction(async (tx) => {
    const context = await lockMembership(tx, ownerId);
    if (!context || context.team.createdBy !== ownerId)
      return {
        success: false,
        message: "Only the team owner can transfer ownership.",
      };
    const [member] = await tx
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, context.team.id),
          eq(teamMembers.userId, memberUserId),
        ),
      );
    if (!member)
      return { success: false, message: "That person is not on your team." };
    await tx
      .update(teams)
      .set({ createdBy: memberUserId })
      .where(eq(teams.id, context.team.id));
    return { success: true, message: "Ownership transferred." };
  });
}

export async function leaveTeam(userId: string): Promise<Result> {
  return db.transaction(async (tx) => {
    await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for("no key update");
    const [membership] = await tx
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    if (!membership)
      return { success: false as const, message: "You are not on a team." };

    await tx.execute(
      sql`select "id" from "team" where "id" = ${membership.teamId} for update`,
    );
    const [stillMember] = await tx
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.membershipId, membership.membershipId),
        ),
      );
    if (!stillMember)
      return {
        success: false as const,
        message: "Your team changed. Reload before trying again.",
      };
    const members = await tx
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, membership.teamId))
      .orderBy(asc(teamMembers.joinedAt));
    const [team] = await tx
      .select()
      .from(teams)
      .where(eq(teams.id, membership.teamId));

    if (members.length <= 1) {
      await tx.delete(teams).where(eq(teams.id, membership.teamId));
    } else {
      await tx.delete(teamMembers).where(eq(teamMembers.userId, userId));
      if (team?.createdBy === userId) {
        const next = members.find((member) => member.userId !== userId);
        if (next) {
          await tx
            .update(teams)
            .set({ createdBy: next.userId })
            .where(eq(teams.id, team.id));
        }
      }
    }

    await tx
      .update(hackerApplications)
      .set({ isTeam: false, updatedAt: new Date() })
      .where(eq(hackerApplications.userId, userId));
    return { success: true as const, message: "You left the team." };
  });
}

type TeamTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function lockMembership(tx: TeamTransaction, userId: string) {
  const [initial] = await tx
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  if (!initial) return null;
  const [team] = await tx
    .select()
    .from(teams)
    .where(eq(teams.id, initial.teamId))
    .for("update");
  if (!team) return null;
  // Recheck after waiting on the team lock. Removal/rejoin is a new membership.
  const [membership] = await tx
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.membershipId, initial.membershipId),
      ),
    );
  return membership ? { team, membership } : null;
}

export async function setAnswersLocked(
  userId: string,
  locked: boolean,
): Promise<Result> {
  const team = await lockOwnedTeam(userId);
  if (!team)
    return {
      success: false,
      message: "Only the team owner can lock the answers.",
    };
  const [saved] = await db
    .update(teams)
    .set({ answersLocked: locked })
    .where(and(eq(teams.id, team.id), eq(teams.createdBy, userId)))
    .returning({ id: teams.id });
  if (!saved)
    return {
      success: false,
      message: "Only the team owner can lock the answers.",
    };
  return {
    success: true,
    message: locked ? "Team answers locked." : "Team answers unlocked.",
  };
}

export async function saveMarsAnswer(
  userId: string,
  marsAnswer: string,
  expected: { teamId: string; membershipId: string; revision: number },
): Promise<Result> {
  const answer = marsAnswer.trim();
  if (wordCount(answer) > MARS_WORD_LIMIT)
    return {
      success: false,
      message: `Your Mars answer must be ${MARS_WORD_LIMIT} words or less.`,
    };
  return db.transaction(async (tx) => {
    const context = await lockMembership(tx, userId);
    if (
      !context ||
      context.team.id !== expected.teamId ||
      context.membership.membershipId !== expected.membershipId
    )
      return {
        success: false,
        conflict: true,
        message: "Your membership changed. Copy your answer before reloading.",
      };
    if (context.team.answersLocked)
      return {
        success: false,
        message:
          "The owner locked the team answers. Your unsaved text is still here.",
      };
    if (context.membership.marsRevision !== expected.revision)
      return {
        success: false,
        conflict: true,
        message:
          "Your saved Mars answer changed. Copy your unsaved answer before reloading.",
      };
    await tx
      .update(teamMembers)
      .set({ marsAnswer: answer, marsRevision: expected.revision + 1 })
      .where(eq(teamMembers.membershipId, expected.membershipId));
    return {
      success: true,
      message: "Mars answer saved.",
      revision: expected.revision + 1,
    };
  });
}

export async function saveTeamEssay(
  userId: string,
  essay: string,
  expected: { teamId: string; revision: number },
): Promise<Result> {
  const answer = essay.trim();
  if (wordCount(answer) > ESSAY_WORD_LIMIT)
    return {
      success: false,
      message: `The team answer must be ${ESSAY_WORD_LIMIT} words or less.`,
    };
  return db.transaction(async (tx) => {
    const context = await lockMembership(tx, userId);
    if (!context || context.team.id !== expected.teamId)
      return {
        success: false,
        conflict: true,
        message: "Your team changed. Copy your answer before reloading.",
      };
    if (context.team.answersLocked)
      return {
        success: false,
        message:
          "The owner locked the team answers. Your unsaved text is still here.",
      };
    if (context.team.essayRevision !== expected.revision)
      return {
        success: false,
        conflict: true,
        message:
          "A teammate saved a newer answer. Copy your unsaved answer before reloading to compare it.",
      };
    await tx
      .update(teams)
      .set({
        essay: answer,
        essayRevision: expected.revision + 1,
        essayUpdatedBy: userId,
        essayUpdatedAt: new Date(),
      })
      .where(eq(teams.id, expected.teamId));
    return {
      success: true,
      message: "Team answer saved.",
      revision: expected.revision + 1,
    };
  });
}
