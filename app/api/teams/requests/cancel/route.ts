import { NextRequest } from "next/server";

import { guardApplicationEdit } from "@/lib/apply/guard";
import { invalid, teamResponse } from "@/lib/apply/team-http";
import { cancelTeamRequest } from "@/lib/db/queries/team";
import { requestActionSchema, teamIssue } from "@/lib/validations/team";

export async function POST(req: NextRequest) {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const parsed = requestActionSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(teamIssue(parsed.error));
  return teamResponse(
    await cancelTeamRequest(guard.userId, parsed.data.requestId),
  );
}
