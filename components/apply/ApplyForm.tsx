"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldPath, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  ApplyTrack,
  MIN_TEAM_APPLY,
  TRACK_SECTIONS,
  TRACKS,
} from "@/config/apply";
import { MyRequestView, MyTeamView } from "@/lib/apply/team-types";
import {
  HackerApplicationDraftSchema,
  HackerApplicationSubmissionSchema,
  THackerApplicationSubmission,
} from "@/lib/validations/application";
import { useResumeUploading } from "@/hooks/useUploadResume";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TeamStep } from "@/components/teams/TeamStep";

import { BasicQuestions } from "./BasicQuestions";
import { NormalQuestions } from "./NormalQuestions";
import { SocialsMlhTravel } from "./SocialsMlhTravel";

const SHARED_FIELDS: FieldPath<THackerApplicationSubmission>[] = [
  "firstName",
  "lastName",
  "age",
  "school.value",
  "school.customValue",
  "country",
  "levelOfStudy",
  "hackathonsAttended",
  "resumeUrl",
  "personalWebsite",
  "linkedin",
  "github",
  "xUrl",
  "mlhCheckbox1",
  "mlhCheckbox2",
  "mlhCheckbox3",
  "travelAmount",
  "travelFrom",
];

function focusFirstInvalid() {
  requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>("#apply-form [aria-invalid='true']")
      ?.focus();
  });
}

export function ApplyForm({
  track,
  defaultValues,
  userEmail,
  canSave,
  canSubmit,
  team,
  requests,
  teamOpen,
}: {
  track: ApplyTrack;
  defaultValues: THackerApplicationSubmission;
  userEmail: string;
  canSave: boolean;
  canSubmit: boolean;
  team: MyTeamView | null;
  requests: MyRequestView[];
  teamOpen: boolean;
}) {
  const router = useRouter();
  const resumeUploading = useResumeUploading();
  const title =
    TRACKS.find((item) => item.id === track)?.title ?? "Application";
  const sections = TRACK_SECTIONS[track];
  const hasSecondPage = track !== "quick";
  const [step, setStep] = useState(0);
  const onLastPage = !hasSecondPage || step === 1;
  const teamReady =
    track !== "team" || (team?.members.length ?? 0) >= MIN_TEAM_APPLY;
  const form = useForm<THackerApplicationSubmission>({
    resolver: zodResolver(HackerApplicationSubmissionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (userEmail && form.getValues("email") !== userEmail) {
      form.setValue("email", userEmail, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [form, userEmail]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [form.formState.isDirty]);

  const showErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
    issues.forEach((issue) => {
      const path = issue.path
        .map(String)
        .join(".") as FieldPath<THackerApplicationSubmission>;
      if (!path) return;
      form.setError(path, { message: issue.message });
    });
    focusFirstInvalid();
  };

  const persist = async (url: string, values: THackerApplicationSubmission) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        applicationType: track,
        email: userEmail,
      }),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };
    if (!result.success) throw new Error(result.message);
    return result.message;
  };

  const onSave = async () => {
    const values = form.getValues();
    const parsed = HackerApplicationDraftSchema.safeParse({
      ...values,
      applicationType: track,
      email: userEmail,
    });
    if (!parsed.success) {
      showErrors(parsed.error.issues);
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    try {
      const message = await persist("/api/application/save", parsed.data);
      toast.success(message);
      form.reset(parsed.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save.");
    }
  };

  const onNext = async () => {
    const valid = await form.trigger(SHARED_FIELDS);
    if (!valid) {
      focusFirstInvalid();
      return;
    }
    if (canSave) {
      const parsed = HackerApplicationDraftSchema.safeParse({
        ...form.getValues(),
        applicationType: track,
        email: userEmail,
      });
      if (!parsed.success) {
        showErrors(parsed.error.issues);
        toast.error("Fix the highlighted fields before continuing.");
        return;
      }
      try {
        await persist("/api/application/save", parsed.data);
        form.reset(parsed.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save.");
        return;
      }
    }
    setStep(1);
    window.scrollTo({ top: 0 });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await persist("/api/application/submit", values);
      router.push("/apply?submitted=1");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit.");
    }
  }, focusFirstInvalid);

  return (
    <Form {...form}>
      <form
        id="apply-form"
        className="space-y-10"
        onSubmit={
          onLastPage
            ? onSubmit
            : (event) => {
                event.preventDefault();
                void onNext();
              }
        }
        noValidate
      >
        <div className="space-y-2">
          <p className="text-sm text-white/50">
            <Link
              href="/apply"
              className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              All application types
            </Link>
          </p>
          <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h1>
          {hasSecondPage && (
            <p className="text-sm text-white/50">Step {step + 1} of 2</p>
          )}
        </div>

        <div
          key={step}
          className="animate-page-in space-y-10 motion-reduce:animate-none"
        >
          {step === 0 && sections.includes("basic") && (
            <BasicQuestions control={form.control} watch={form.watch} />
          )}
          {step === 0 && sections.includes("socials") && (
            <SocialsMlhTravel
              control={form.control}
              watch={form.watch}
              setValue={form.setValue}
            />
          )}
          {step === 1 && sections.includes("normal") && (
            <NormalQuestions control={form.control} />
          )}
          {step === 1 && sections.includes("team") && (
            <TeamStep team={team} requests={requests} open={teamOpen} />
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {hasSecondPage && step === 1 && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setStep(0);
                window.scrollTo({ top: 0 });
              }}
            >
              Back
            </Button>
          )}
          {canSave && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={form.formState.isSubmitting || resumeUploading}
              onClick={() => void onSave()}
            >
              Save draft
            </Button>
          )}
          {hasSecondPage && step === 0 && (
            <Button
              type="button"
              className="min-h-11"
              disabled={resumeUploading}
              onClick={() => void onNext()}
            >
              {resumeUploading ? "Uploading resume..." : "Next"}
            </Button>
          )}
          {onLastPage && canSubmit && (
            <Button
              type="submit"
              className="min-h-11"
              disabled={
                form.formState.isSubmitting || resumeUploading || !teamReady
              }
            >
              {resumeUploading
                ? "Uploading resume..."
                : form.formState.isSubmitting
                  ? "Submitting..."
                  : track === "team"
                    ? "Submit team application"
                    : "Submit application"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
