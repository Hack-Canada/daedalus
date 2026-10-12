import { MAX_PENDING_REQUESTS, REQUEST_COOLDOWN_MS } from "@/config/apply";

export function requestBlockReason(input: {
  pendingCount: number;
  alreadyPendingHere: boolean;
  declinedAt: number | null;
  now: number;
}): string | null {
  if (input.alreadyPendingHere) {
    return "You already asked to join this team.";
  }
  if (input.pendingCount >= MAX_PENDING_REQUESTS) {
    return `You already have ${MAX_PENDING_REQUESTS} open requests. Cancel one before asking another team.`;
  }
  if (
    input.declinedAt !== null &&
    input.now - input.declinedAt < REQUEST_COOLDOWN_MS
  ) {
    return "This team declined you recently. You can ask again in 24 hours.";
  }
  return null;
}
