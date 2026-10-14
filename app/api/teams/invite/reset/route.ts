import { guardApplicationEdit } from "@/lib/apply/guard";
import { teamResponse } from "@/lib/apply/team-http";
import { resetInvite } from "@/lib/db/queries/team";

export async function POST() {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;
  return teamResponse(await resetInvite(guard.userId));
}
