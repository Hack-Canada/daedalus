"use client";

import { ApplyMark } from "@/components/apply/ApplyMark";
import { EmptyPage } from "@/components/EmptyPage";

// ponytail: no global-error.tsx, so a crash in the root layout itself still gets Next's default screen.
export default function ErrorPage() {
  return (
    <>
      <ApplyMark />
      <EmptyPage
        title="Something went wrong"
        message="That one's on us. Give it a moment and try again."
      />
    </>
  );
}
