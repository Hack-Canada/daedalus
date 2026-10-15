"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApplyTrack, TRACKS } from "@/config/apply";
import starBeaver from "@/public/beaver-star.png";
import laptopBeaver from "@/public/beaver-laptop.png";
import moneyBeaver from "@/public/beaver-money.png";
import businessBeaver from "@/public/beaver-business.png";
import pencilBeaver from "@/public/beaver-pencil.png";
import ideaBeaver from "@/public/beaver-idea.png";

import { ApplyMark } from "./ApplyMark";

type Track = (typeof TRACKS)[number];

// Quick matches the application form; Normal and Team keep their blue themes.
const THEMES: Record<
  ApplyTrack,
  { panel: string; muted: string }
> = {
  quick: {
    panel: "bg-[#0a0a0f] text-white",
    muted: "text-white",
  },
  normal: {
    panel:
      "bg-linear-to-b from-[#5f9be2] via-[#3c7bcc] to-[#1c58a1] text-white",
    muted: "text-white/80",
  },
  team: {
    panel:
      "bg-linear-to-b from-[#0d426d] via-[#062f52] to-[#031b31] text-white",
    muted: "text-white/75",
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
    <div className="group/picker h-dvh snap-y snap-mandatory overflow-y-auto bg-[#031b31] lg:grid lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)_auto_auto_auto] lg:snap-none lg:overflow-hidden">
      <ApplyMark />
      {TRACKS.map((track, index) => {
        const theme = THEMES[track.id];
        const isCurrent = hasDraft && currentTrack === track.id;
        const action = !hasDraft ? "Start" : isCurrent ? "Continue" : "Switch";
        const linkClass =
          "relative z-10 flex h-full min-h-11 w-full flex-col p-8 pt-20 text-left outline-none md:p-12 md:pt-24 lg:row-span-4 lg:grid lg:grid-rows-subgrid";

        return (
          <section
            key={track.id}
            aria-labelledby={`${track.id}-title`}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            style={{ animationDelay: `${index * 90}ms` }}
            className={`${theme.panel} group animate-in fade-in fill-mode-both relative z-0 flex h-dvh origin-center snap-start overflow-hidden duration-700 motion-reduce:animate-none motion-reduce:transition-none lg:row-span-4 lg:grid lg:h-auto lg:min-w-0 lg:grid-rows-subgrid lg:transition-[scale,filter] lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover/picker:not-hover:brightness-90 lg:hover:z-10 lg:hover:scale-110`}
          >
            <div className="pointer-events-none absolute inset-0">
              <Scenery id={track.id} />
            </div>
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
      <span>
        {isCurrent && (
          <span className={`w-fit text-sm font-medium ${theme.muted}`}>
            Draft saved
          </span>
        )}
      </span>

      <span
        id={`${track.id}-title`}
        role="heading"
        aria-level={2}
        className="font-display mt-auto block max-w-md text-5xl leading-[0.95] transition-transform duration-500 ease-out group-hover:-translate-y-1 md:text-6xl lg:mt-0"
      >
        {track.title}
      </span>
      <span
        className={`mt-4 block max-w-md text-base leading-relaxed md:text-lg ${theme.muted}`}
      >
        {track.description}
      </span>
      <span
        aria-hidden={track.id === "team"}
        className={`mt-4 block max-w-md pb-8 text-sm italic lg:pb-10 ${theme.muted} ${track.id === "team" ? "invisible" : ""}`}
      >
        You can still join a team later.
      </span>

      <span className="sr-only">{action}</span>
    </>
  );
}

export function Cloud({ className }: { className: string }) {
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
const art = "h-[min(30dvh,16rem)] w-auto max-w-full object-contain";
const teamBeaverMotion =
  "transition-transform duration-500 ease-out motion-reduce:transition-none";

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
            <div className="motion-safe:animate-bob flex w-4/5 justify-center">
              <Image
                src={starBeaver}
                alt=""
                className={`${art} transition-transform duration-700 ease-out group-hover:translate-x-3 group-hover:-translate-y-3`}
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
        <div className={frame} style={parallax(22)}>
          <div className={stage}>
            <div className="motion-safe:animate-bob flex w-4/5 justify-center [animation-delay:-2s]">
              <Image
                src={laptopBeaver}
                alt=""
                className={`${art} transition-transform duration-500 group-hover:-translate-y-1`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden>
      <div className={frame} style={parallax(20)}>
        <div className={stage}>
          <div className="motion-safe:animate-bob relative aspect-[6/5] w-[min(88%,43.2dvh,24rem)] origin-bottom transition-transform duration-500 group-hover:scale-105">
            <Image
              src={businessBeaver}
              alt=""
              sizes="(min-width: 1024px) 18vw, 55vw"
              className={`absolute top-0 left-[8%] h-auto w-[48%] motion-safe:group-hover:translate-x-[12%] motion-safe:group-hover:translate-y-[10%] ${teamBeaverMotion}`}
            />
            <Image
              src={ideaBeaver}
              alt=""
              sizes="(min-width: 1024px) 18vw, 55vw"
              className={`absolute top-[2%] right-[3%] h-auto w-[48%] motion-safe:group-hover:-translate-x-[12%] motion-safe:group-hover:translate-y-[10%] ${teamBeaverMotion}`}
            />
            <Image
              src={pencilBeaver}
              alt=""
              sizes="(min-width: 1024px) 18vw, 55vw"
              className={`absolute bottom-[1%] left-[2%] z-10 h-auto w-1/2 motion-safe:group-hover:translate-x-[12%] motion-safe:group-hover:-translate-y-[10%] ${teamBeaverMotion}`}
            />
            <Image
              src={moneyBeaver}
              alt=""
              sizes="(min-width: 1024px) 18vw, 55vw"
              className={`absolute right-[-4%] bottom-[-2%] z-20 h-auto w-[62%] motion-safe:group-hover:-translate-x-[10%] motion-safe:group-hover:-translate-y-[12%] ${teamBeaverMotion}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
