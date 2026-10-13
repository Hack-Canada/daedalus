import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ApplyMark } from "@/components/apply/ApplyMark";

export function TeamPage({
  title,
  lede,
  meta,
  backHref,
  children,
}: {
  title: string;
  lede?: string;
  meta?: React.ReactNode;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 pt-20 pb-24">
      <ApplyMark />
      {backHref && (
        <Link
          href={backHref}
          className="group inline-flex w-fit items-center gap-1.5 rounded-full py-1 pr-3 text-sm text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden
          />
          Back
        </Link>
      )}
      <header className="animate-in fade-in slide-in-from-bottom-1 mt-6 duration-500 motion-reduce:animate-none">
        <h1 className="font-display text-4xl break-words text-white md:text-5xl">
          {title}
        </h1>
        {lede && <p className="mt-3 max-w-2xl text-white/65">{lede}</p>}
        {meta && <div className="mt-4">{meta}</div>}
      </header>
      {children && (
        <div className="animate-in fill-mode-both fade-in slide-in-from-bottom-2 mt-10 delay-75 duration-500 motion-reduce:animate-none">
          {children}
        </div>
      )}
    </main>
  );
}
