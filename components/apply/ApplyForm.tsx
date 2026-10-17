"use client";

import { useEffect, useRef, useState } from "react";
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

const actionButton = "min-h-12 px-6 text-base";

const SHARED_FIELDS: FieldPath<THackerApplicationSubmission>[] = [
  "firstName",
  "lastName",
  "age",
  "school.value",
  "school.customValue",
  "country",
  "levelOfStudy",
  "resumeUrl",
  "personalWebsite",
  "linkedin",
  "github",
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
  initialRevision,
  defaultValues,
  userEmail,
  canSave,
  canSubmit,
  team,
  requests,
  teamOpen,
}: {
  track: ApplyTrack;
  initialRevision: number;
  defaultValues: THackerApplicationSubmission;
  userEmail: string;
  canSave: boolean;
  canSubmit: boolean;
  team: MyTeamView | null;
  requests: MyRequestView[];
  teamOpen: boolean;
}) {
  const router = useRouter();
  const revision = useRef(initialRevision);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [teamUnsaved, setTeamUnsaved] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
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
        expectedRevision: revision.current,
        applicationType: track,
        email: userEmail,
      }),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
      data?: { revision: number };
    };
    if (!result.success) {
      if (response.status === 409) setConflict(result.message);
      throw new Error(result.message);
    }
    if (result.data) revision.current = result.data.revision;
    return result.message;
  };

  const onSave = async () => {
    if (busy.current || conflict || resumeUploading) return;
    busy.current = true;
    setSaving(true);
    try {
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
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const onNext = async () => {
    if (busy.current || conflict || resumeUploading) return;
    busy.current = true;
    setSaving(true);
    try {
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
          toast.error(
            error instanceof Error ? error.message : "Failed to save.",
          );
          return;
        }
      }
      setStep(1);
      window.scrollTo({ top: 0 });
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const submitValues = async (values: THackerApplicationSubmission) => {
    try {
      await persist("/api/application/submit", values);
      router.push("/apply?submitted=1");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit.");
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current || conflict || resumeUploading) return;
    busy.current = true;
    setSaving(true);
    try {
      if (teamUnsaved) {
        toast.error("Save your team answers before submitting.");
        return;
      }
      await form.handleSubmit(submitValues, focusFirstInvalid)(event);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="apply-form"
        className="space-y-12"
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
        <div className="space-y-4">
          <Link
            href="/apply"
            className="inline-block text-[1.3rem] text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Go back (all application types)
          </Link>
          <h1 className="font-display text-4xl font-semibold text-white md:text-6xl">
            {title}
          </h1>
          {hasSecondPage && (
            <div className="flex items-center gap-4">
              <div className="flex w-32 gap-1.5" aria-hidden>
                {[0, 1].map((index) => (
                  <span
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                      index <= step ? "bg-[#85B7F1]" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
              <p className="text-base text-white/60">Step {step + 1} of 2</p>
            </div>
          )}
        </div>

        {conflict && (
          <p
            role="alert"
            className="rounded-xl border border-amber-400 p-4 text-amber-100"
          >
            {conflict} Your unsaved text is still in this form.
          </p>
        )}
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
            <TeamStep
              team={team}
              requests={requests}
              open={teamOpen}
              onUnsavedChange={setTeamUnsaved}
            />
          )}
        </div>

        {teamUnsaved && (
          <p role="status" className="text-amber-100">
            Save your team answers before submitting.
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          {hasSecondPage && step === 1 && (
            <Button
              type="button"
              variant="outline"
              className={actionButton}
              disabled={saving || teamUnsaved}
              onClick={() => {
                if (saving || teamUnsaved) return;
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
              className={actionButton}
              disabled={
                saving ||
                Boolean(conflict) ||
                form.formState.isSubmitting ||
                resumeUploading
              }
              onClick={() => void onSave()}
            >
              Save draft
            </Button>
          )}
          {hasSecondPage && step === 0 && (
            <Button
              type="button"
              className={actionButton}
              disabled={saving || Boolean(conflict) || resumeUploading}
              onClick={() => void onNext()}
            >
              {resumeUploading ? "Uploading resume..." : "Next"}
            </Button>
          )}
          {onLastPage && canSubmit && (
            <Button
              type="submit"
              className={actionButton}
              disabled={
                saving ||
                teamUnsaved ||
                Boolean(conflict) ||
                form.formState.isSubmitting ||
                resumeUploading ||
                !teamReady
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
