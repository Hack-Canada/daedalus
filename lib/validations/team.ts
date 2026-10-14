import { z } from "zod";

import { LOOKING_FOR_LIMIT, REQUEST_NOTE_LIMIT } from "@/config/apply";

export const teamSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name must be 1 to 60 characters.")
    .max(60),
  isPublic: z.boolean(),
  lookingFor: z.string().max(LOOKING_FOR_LIMIT).optional(),
});

export const teamRequestSchema = z
  .object({
    teamId: z.string().min(1).max(80).optional(),
    token: z.string().min(1).max(128).optional(),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "Agree to share your listed details before sending a request.",
      }),
    }),
    message: z.string().max(REQUEST_NOTE_LIMIT).optional(),
  })
  .refine((value) => Boolean(value.teamId) !== Boolean(value.token), {
    message: "Pick one team.",
  });

export const requestActionSchema = z.object({
  requestId: z.string().min(1).max(80),
});

export const decideRequestSchema = requestActionSchema.extend({
  decision: z.enum(["accept", "decline"]),
});

export const memberActionSchema = z.object({
  userId: z.string().min(1).max(80),
});

export const lockAnswersSchema = z.object({
  locked: z.boolean(),
});

export function teamIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message || "Check the form and try again.";
}
