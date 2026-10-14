"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { ApplyTrack, TRACKS } from "@/config/apply";

import { ApplyMark } from "./ApplyMark";

type Track = (typeof TRACKS)[number];

// Day, dusk, night: the hackcanada.org sky (#85B7F1) down to its navy (#043251).
const THEMES: Record<
  ApplyTrack,
  { panel: string; muted: string; button: string; ring: string }
> = {
  quick: {
    panel:
      "bg-linear-to-b from-[#c4defb] via-[#9cc5f4] to-[#6fa6ea] text-[#043251]",
    muted: "text-[#043251]/75",
    button: "bg-[#043251] text-white",
    ring: "focus-visible:outline-[#043251]",
  },
  normal: {
    panel:
      "bg-linear-to-b from-[#5f9be2] via-[#3c7bcc] to-[#1c58a1] text-white",
    muted: "text-white/80",
    button: "bg-white text-[#043251]",
    ring: "focus-visible:outline-white",
  },
  team: {
    panel:
      "bg-linear-to-b from-[#0d426d] via-[#062f52] to-[#031b31] text-white",
    muted: "text-white/75",
    button: "bg-[#85B7F1] text-[#043251]",
    ring: "focus-visible:outline-[#85B7F1]",
  },
};

// [left %, top %, size px, delay s]
const STARS = [
  [12, 14, 2, 0],
  [28, 8, 3, 1.2],
  [46, 18, 2, 0.6],
  [64, 10, 2, 2.1],
  [80, 20, 3, 0.3],
  [90, 8, 2, 1.7],
  [20, 30, 2, 2.6],
  [56, 32, 2, 1],
  [74, 38, 3, 0.8],
  [36, 42, 2, 1.9],
  [8, 48, 2, 0.4],
  [88, 52, 2, 2.3],
] as const;

function onPointerMove(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const box = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - box.left;
  const y = e.clientY - box.top;
  const style = e.currentTarget.style;
  style.setProperty("--px", ((x / box.width) * 2 - 1).toFixed(3));
  style.setProperty("--py", ((y / box.height) * 2 - 1).toFixed(3));
}

function onPointerLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--px", "0");
  e.currentTarget.style.setProperty("--py", "0");
}

const parallax = (depth: number): CSSProperties => ({
  transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth * 0.6}px), 0)`,
});

export function ApplyPicker({
  currentTrack,
  hasDraft,
}: {
  currentTrack: ApplyTrack | null;
  hasDraft: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function openTrack(track: ApplyTrack) {
    const needsSave = hasDraft && currentTrack !== track;
    if (needsSave) {
      const confirmed = window.confirm(
        track === "normal"
          ? "Switch tracks? Your shared answers and your team stay."
          : "Switch tracks? Short answers that only belong to Normal Apps will be removed. Your other answers and your team stay.",
      );
      if (!confirmed) return;

      setPending(true);
      try {
        const response = await fetch("/api/application/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationType: track }),
        });
        const result = (await response.json()) as {
          success: boolean;
          message: string;
        };
        if (!result.success) {
          toast.error(result.message);
          return;
        }
      } catch {
        toast.error("Could not switch tracks. Please try again.");
        return;
      } finally {
        setPending(false);
      }
    }

    router.push(`/apply/${track}`);
  }

  return (
    <div className="group/picker h-dvh snap-y snap-mandatory overflow-y-auto bg-[#031b31] lg:flex lg:snap-none lg:overflow-hidden">
      <ApplyMark />
      {TRACKS.map((track, index) => {
        const theme = THEMES[track.id];
        const isCurrent = hasDraft && currentTrack === track.id;
        const action = !hasDraft ? "Start" : isCurrent ? "Continue" : "Switch";
        const linkClass = `relative z-10 flex h-full min-h-11 w-full flex-col p-8 pt-20 text-left focus-visible:outline-2 focus-visible:outline-offset-[-12px] md:p-12 md:pt-24 ${theme.ring}`;

        return (
          <section
            key={track.id}
            aria-labelledby={`${track.id}-title`}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            style={{ animationDelay: `${index * 90}ms` }}
            className={`${theme.panel} group animate-in fade-in fill-mode-both relative flex h-dvh snap-start overflow-hidden duration-700 motion-reduce:animate-none motion-reduce:transition-none lg:h-full lg:flex-1 lg:transition-[flex-grow,filter] lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover/picker:not-hover:brightness-90 lg:focus-within:flex-[1.3] lg:hover:flex-[1.3]`}
          >
            <Scenery id={track.id} />
            {isCurrent || !hasDraft ? (
              <Link href={`/apply/${track.id}`} className={linkClass}>
                <PanelCopy
                  track={track}
                  action={action}
                  isCurrent={isCurrent}
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => void openTrack(track.id)}
                className={`${linkClass} disabled:cursor-wait`}
              >
                <PanelCopy track={track} action={action} isCurrent={false} />
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PanelCopy({
  track,
  action,
  isCurrent,
}: {
  track: Track;
  action: string;
  isCurrent: boolean;
}) {
  const theme = THEMES[track.id];
  return (
    <>
      {isCurrent && (
        <span className={`w-fit text-sm font-medium ${theme.muted}`}>
          Draft saved
        </span>
      )}

      <span className="mt-auto block max-w-md pb-8 lg:pb-10">
        <span
          id={`${track.id}-title`}
          role="heading"
          aria-level={2}
          className="font-display block text-5xl leading-[0.95] transition-transform duration-500 ease-out group-hover:-translate-y-1 md:text-6xl"
        >
          {track.title}
        </span>
        <span
          className={`mt-4 block text-base leading-relaxed md:text-lg lg:min-h-[3lh] ${theme.muted}`}
        >
          {track.description}
        </span>
        {/* Team keeps an invisible line so the arrows stay level across cards. */}
        <span
          aria-hidden={track.id === "team"}
          className={`mt-4 block text-sm italic ${theme.muted} ${track.id === "team" ? "invisible" : ""}`}
        >
          You can still join a team later.
        </span>
      </span>

      <span className="flex items-center gap-3 text-base font-semibold">
        <span
          className={`flex size-12 items-center justify-center rounded-full shadow-lg transition-transform duration-500 ease-out group-hover:scale-110 ${theme.button}`}
        >
          <ArrowRight
            className="size-5 -rotate-45 transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:rotate-0"
            aria-hidden
          />
        </span>
        <span className="sr-only">{action}</span>
      </span>
    </>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 120 50"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20 48h86a14 14 0 0 0 0-28 22 22 0 0 0-41-8A17 17 0 0 0 34 22a13 13 0 0 0-14 26Z" />
    </svg>
  );
}

const frame =
  "pointer-events-none absolute inset-0 transition-transform duration-700 ease-out motion-reduce:transition-none";
// Art sits in the empty band above the copy, sized by viewport height.
const stage = "absolute inset-x-0 top-[14%] flex justify-center";
const art = "h-[min(24dvh,13rem)] w-auto";

function Scenery({ id }: { id: ApplyTrack }) {
  if (id === "quick") {
    return (
      <div aria-hidden>
        <div className={frame} style={parallax(10)}>
          <Cloud className="motion-safe:animate-drift absolute top-[12%] right-[6%] w-28 text-white/80" />
          <Cloud className="motion-safe:animate-drift absolute top-[34%] left-[2%] w-20 text-white/60 [animation-delay:-8s]" />
        </div>
        <div className={frame} style={parallax(22)}>
          <div className={stage}>
            <div className="motion-safe:animate-bob">
              <Image
                src="/paper-plane.svg"
                alt=""
                width={200}
                height={150}
                className="h-[min(18dvh,10rem)] w-auto drop-shadow-[0_12px_18px_rgba(4,50,81,0.18)] transition-transform duration-700 ease-out group-hover:translate-x-3 group-hover:-translate-y-3"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "normal") {
    return (
      <div aria-hidden>
        <div className={frame} style={parallax(8)}>
          <Cloud className="motion-safe:animate-drift absolute top-[16%] left-[6%] w-24 text-white/30 [animation-delay:-4s]" />
          <Cloud className="motion-safe:animate-drift absolute top-[36%] right-[4%] w-32 text-white/20 [animation-delay:-14s]" />
        </div>
        <div className={frame} style={parallax(22)}>
          <div className={stage}>
            <div className="motion-safe:animate-bob relative flex flex-col items-center [animation-delay:-2s]">
              <Image
                src="/glacier-small.svg"
                alt=""
                width={193}
                height={115}
                className="h-[min(14dvh,8rem)] w-auto transition-transform duration-500 group-hover:-translate-y-1"
              />
              <span className="mt-2 h-2 w-3/4 rounded-full bg-white/20 blur-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden>
      <div className={frame} style={parallax(6)}>
        {STARS.map(([left, top, size, delay]) => (
          <span
            key={`${left}-${top}`}
            className="motion-safe:animate-twinkle absolute rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
      <div className={frame} style={parallax(20)}>
        <div className={stage}>
          <div className="relative">
            <div className="motion-safe:animate-flicker absolute -inset-12 rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.4),transparent_65%)]" />
            <Image
              src="/fire.webp"
              alt=""
              width={310}
              height={473}
              className={`${art} relative origin-bottom transition-transform duration-500 group-hover:scale-105`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
