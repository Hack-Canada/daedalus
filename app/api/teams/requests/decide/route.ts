import { NextRequest } from "next/server";

import { guardApplicationEdit } from "@/lib/apply/guard";
import { invalid, notifyTeam, teamResponse } from "@/lib/apply/team-http";
import { decideTeamRequest } from "@/lib/db/queries/team";
import { decideRequestSchema, teamIssue } from "@/lib/validations/team";

export async function POST(req: NextRequest) {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const parsed = decideRequestSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(teamIssue(parsed.error));

  const result = await decideTeamRequest(
    guard.userId,
    parsed.data.requestId,
    parsed.data.decision,
  );
  if (result.success) await notifyTeam(result.mail);
  return teamResponse(result);
}
