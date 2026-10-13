"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { Control, UseFormWatch } from "react-hook-form";

import { THackerApplicationSubmission } from "@/lib/validations/application";
import { useUploadResume } from "@/hooks/useUploadResume";
import { OpenResumeButton } from "@/components/applications/OpenResumeButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UploadResumeProps {
  control: Control<THackerApplicationSubmission>;
  watch: UseFormWatch<THackerApplicationSubmission>;
}

export function UploadResume({ control, watch }: UploadResumeProps) {
  const { handleFileUpload, deleteResume, previewUrl, isPending } =
    useUploadResume();
  const resumeUrl = watch("resumeUrl");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="resumeUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Resume
            </FormLabel>
            {!resumeUrl && (
              <button
                type="button"
                className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 text-center transition-all hover:border-primary/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  document.getElementById("resume-upload")?.click()
                }
                disabled={isPending}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-white/10", "border-primary/40");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("bg-white/10", "border-primary/40");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("bg-white/10", "border-primary/40");
                  if (e.dataTransfer.files[0]) {
                    handleFileUpload(
                      e.dataTransfer.files[0],
                      field.onChange,
                      resumeUrl,
                    );
                  }
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-white/60">
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      <>
                        Drag and drop your resume here, or{" "}
                        <span className="font-medium text-primary">
                          click to upload
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-white/40">PDF only (max 5MB)</p>
                </div>
              </button>
            )}
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) handleFileUpload(file, field.onChange, resumeUrl);
              }}
              id="resume-upload"
              className="hidden"
            />
            {resumeUrl && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/20 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-white/50" />
                  {previewUrl ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:text-primaryLight hover:underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    <OpenResumeButton className="text-sm font-medium text-primary hover:text-primaryLight hover:underline disabled:opacity-50" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      document.getElementById("resume-upload")?.click()
                    }
                  >
                    Replace
                  </Button>
                  <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={async () => {
                    if (resumeUrl && (await deleteResume(resumeUrl))) {
                      field.onChange("");
                    }
                  }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {isPending ? "Deleting..." : "Delete"}
                </Button>
                </div>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="shareResume"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer text-sm font-medium text-white/70 transition-colors hover:text-white md:text-base">
                I consent to sharing my resume with potential sponsors and
                recruiters
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
