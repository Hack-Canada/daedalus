import { NextRequest } from "next/server";

import { guardApplicationEdit } from "@/lib/apply/guard";
import { invalid, teamResponse } from "@/lib/apply/team-http";
import { updateTeamSettings } from "@/lib/db/queries/team";
import { teamIssue, teamSettingsSchema } from "@/lib/validations/team";

export async function POST(req: NextRequest) {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const parsed = teamSettingsSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return invalid(teamIssue(parsed.error));

  const result = await updateTeamSettings(
    guard.userId,
    parsed.data.name,
    parsed.data.isPublic,
    parsed.data.lookingFor ?? "",
  );
  return teamResponse(result);
}
