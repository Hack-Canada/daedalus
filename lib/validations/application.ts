import { z } from "zod";

import {
  ESSAY_WORD_LIMIT,
  MARS_WORD_LIMIT,
  NORMAL_WORD_LIMIT,
} from "@/config/apply";
import { travelAmountError } from "@/lib/apply/travel";
import { isHttpUrl, isSocialUrl } from "@/lib/apply/urls";
import { wordCount } from "@/lib/apply/words";

function withinWords(value: string, limit: number) {
  return wordCount(value) <= limit;
}

const applyObject = z.object({
  applicationType: z.enum(["quick", "normal", "team"]),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  age: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const age = Number(value);
      return Number.isInteger(age) && age >= 1 && age <= 123;
    }, "Invalid age provided."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Invalid email address.",
    ),
  school: z.object({
    value: z.string().trim(),
    customValue: z.string().trim().optional(),
  }),
  country: z.string().trim(),
  levelOfStudy: z.string().trim(),
  hackathonsAttended: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const attended = Number(value);
      return Number.isInteger(attended) && attended >= 0 && attended <= 100;
    }, "Enter a number from 0 to 100."),
  personalWebsite: z
    .string()
    .trim()
    .refine(isHttpUrl, "Enter a link, like https://yoursite.com."),
  linkedin: z
    .string()
    .trim()
    .refine(
      (value) => isSocialUrl(value, ["linkedin.com"]),
      "Enter a LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).",
    ),
  github: z
    .string()
    .trim()
    .refine(
      (value) => isSocialUrl(value, ["github.com"]),
      "Enter a GitHub profile URL (e.g., https://github.com/username).",
    ),
  xUrl: z
    .string()
    .trim()
    .refine(
      (value) => isSocialUrl(value, ["x.com", "twitter.com"]),
      "Enter an X profile URL (e.g., https://x.com/username).",
    ),
  resumeUrl: z.string().trim(),
  shareResume: z.boolean(),
  mlhCheckbox1: z.boolean(),
  mlhCheckbox2: z.boolean(),
  mlhCheckbox3: z.boolean(),
  needsTravelReimbursement: z.boolean(),
  travelAmount: z.string().trim().superRefine((value, ctx) => {
    const message = travelAmountError(value);
    if (!message) return;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  }),
  travelFrom: z.string().trim().max(120, "Keep this to 120 characters or less."),
  normalAnswer1: z.string().trim().refine(
    (value) => withinWords(value, NORMAL_WORD_LIMIT),
    `Your answer must be ${NORMAL_WORD_LIMIT} words or less.`,
  ),
  normalAnswer2: z.string().trim().refine(
    (value) => withinWords(value, NORMAL_WORD_LIMIT),
    `Your answer must be ${NORMAL_WORD_LIMIT} words or less.`,
  ),
});

function requireText(
  ctx: z.RefinementCtx,
  value: string,
  path: string,
  message: string,
) {
  if (!value.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });
  }
}

export const HackerApplicationDraftSchema = applyObject;

export const HackerApplicationSubmissionSchema = applyObject.superRefine(
  (data, ctx) => {
    requireText(ctx, data.firstName, "firstName", "First name is required");
    requireText(ctx, data.lastName, "lastName", "Last name is required");
    requireText(ctx, data.age, "age", "Age is required");
    requireText(ctx, data.country, "country", "Country of residence is required");
    requireText(ctx, data.levelOfStudy, "levelOfStudy", "Level of study is required");

    if (!data.school.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "School is required",
        path: ["school", "value"],
      });
    }

    if (
      data.school.value === "Other (please specify)" &&
      !data.school.customValue?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your school/university.",
        path: ["school", "customValue"],
      });
    }

    if (!data.mlhCheckbox1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must agree to the MLH Code of Conduct.",
        path: ["mlhCheckbox1"],
      });
    }

    if (!data.mlhCheckbox2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must agree to the MLH Privacy Policy and Contest Terms.",
        path: ["mlhCheckbox2"],
      });
    }

    if (data.needsTravelReimbursement) {
      requireText(
        ctx,
        data.travelAmount,
        "travelAmount",
        "Enter how much reimbursement you need",
      );
      requireText(
        ctx,
        data.travelFrom,
        "travelFrom",
        "Tell us where you are travelling from",
      );
    }

    if (data.applicationType === "normal") {
      if (!data.normalAnswer1.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This answer is required",
          path: ["normalAnswer1"],
        });
      }
      if (!data.normalAnswer2.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This answer is required",
          path: ["normalAnswer2"],
        });
      }
    }
  },
);

export type THackerApplicationDraft = z.infer<typeof HackerApplicationDraftSchema>;
export type THackerApplicationSubmission = z.infer<
  typeof HackerApplicationSubmissionSchema
>;

export function teamAnswerError(marsAnswer: string, essay: string) {
  if (!marsAnswer.trim()) return "Add your Mars answer before submitting.";
  if (wordCount(marsAnswer) > MARS_WORD_LIMIT) {
    return `Your Mars answer must be ${MARS_WORD_LIMIT} words or less.`;
  }
  if (!essay.trim()) return "Your team still needs the shared team answer.";
  if (wordCount(essay) > ESSAY_WORD_LIMIT) {
    return `The team answer must be ${ESSAY_WORD_LIMIT} words or less.`;
  }
  return null;
}
