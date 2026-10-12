import { TRAVEL_REIMBURSEMENT_MAX } from "@/config/apply";

export const TRAVEL_CAP_MESSAGE = `${TRAVEL_REIMBURSEMENT_MAX} CAD is the max. The budget beaver has left the chat.`;

export function travelAmountError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < 1) return "Enter a whole dollar amount.";
  if (amount > TRAVEL_REIMBURSEMENT_MAX) return TRAVEL_CAP_MESSAGE;
  return null;
}
