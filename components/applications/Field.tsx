"use client";

import { File, Github, Linkedin, Link as LinkIcon } from "lucide-react";

interface FieldProps {
  label: string;
  value: string | number | undefined | null;
  customValue?: string;
  isLongText?: boolean;
}

function getUrlType(url: string) {
  if (url.includes("github.com")) return "github";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("/api/resume") || url.includes("s3.amazonaws.com")) return "resume";
  return "website";
}

function getIcon(type: string) {
  switch (type) {
    case "github":
      return <Github className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "resume":
      return <File className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
}

export function Field({ label, value, customValue, isLongText }: FieldProps) {
  const isEmpty = typeof value === "string" ? value.trim() === "" : !value;
  const strValue = customValue ? customValue : value?.toString() || "";
  const isUrl = strValue.startsWith("http") || strValue.startsWith("/api/resume");

  // Auto-detect long text (more than 100 chars or contains newlines)
  const isLong =
    isLongText || strValue.length > 100 || strValue.includes("\n");

  if (isLong && !isUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-xs font-semibold text-primary shadow-[0_0_10px_rgba(30,144,255,0.15)]">
            Q
          </span>
          <p className="text-sm font-medium leading-relaxed text-white/70 md:text-base">
            {label}
          </p>
        </div>
        {isEmpty ? (
          <p className="ml-9 italic text-white/30">[No response provided]</p>
        ) : (
          <div className="ml-9 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/90 md:text-base">
              {strValue}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 overflow-hidden">
      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </p>
      {isEmpty ? (
        <p className="italic text-white/30">[Empty]</p>
      ) : isUrl ? (
        <a
          href={strValue}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(30,144,255,0.2)]"
        >
          {getIcon(getUrlType(strValue))}
          <span>View {label}</span>
        </a>
      ) : (
        <p className="text-base font-medium text-white md:text-lg">
          {strValue}
        </p>
      )}
    </div>
  );
}
