import { NextRequest } from "next/server";

import { guardApplicationEdit } from "@/lib/apply/guard";
import { invalid, notifyTeam, teamResponse } from "@/lib/apply/team-http";
import { createTeamRequest } from "@/lib/db/queries/team";
import { teamIssue, teamRequestSchema } from "@/lib/validations/team";

export async function POST(req: NextRequest) {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const parsed = teamRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(teamIssue(parsed.error));

  const result = await createTeamRequest(guard.userId, {
    teamId: parsed.data.teamId,
    token: parsed.data.token,
    message: parsed.data.message ?? "",
  });
  if (result.success) await notifyTeam(result.mail);
  return teamResponse(result);
}
