"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { ApplyTrack, MAX_TEAM_SIZE, TRACKS } from "@/config/apply";
import { MyRequestView, MyTeamView } from "@/lib/apply/team-types";
import { MyRequests } from "@/components/teams/MyRequests";
import { TeamChoices } from "@/components/teams/TeamChoices";
import { TeamPage } from "@/components/teams/TeamPage";

import { ApplyMark } from "./ApplyMark";

const THANKS_MS = 1000;

function burst() {
  const base = {
    colors: ["#34d399", "#38bdf8", "#a78bfa", "#ffffff"],
    disableForReducedMotion: true,
    zIndex: 60,
  };
  confetti({
    ...base,
    particleCount: 140,
    spread: 90,
    startVelocity: 48,
    origin: { y: 0.55 },
  });
  const end = Date.now() + 1000;
  (function frame() {
    confetti({
      ...base,
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.75 },
    });
    confetti({
      ...base,
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.75 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function ApplySubmitted({
  track,
  firstName,
  celebrate,
  team,
  requests,
  open,
}: {
  track: ApplyTrack | null;
  firstName: string | null;
  celebrate: boolean;
  team: MyTeamView | null;
  requests: MyRequestView[];
  open: boolean;
}) {
  const [stage, setStage] = useState<"thanks" | "teams">(
    celebrate ? "thanks" : "teams",
  );
  const title =
    TRACKS.find((item) => item.id === track)?.title ?? "your application";

  useEffect(() => {
    if (!celebrate) return;
    window.history.replaceState(null, "", "/apply");
    burst();
    const timer = window.setTimeout(() => setStage("teams"), THANKS_MS);
    return () => {
      window.clearTimeout(timer);
      confetti.reset();
    };
  }, [celebrate]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "thanks" ? (
          <motion.main
            key="thanks"
            exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
            className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
          >
            {open && <ApplyMark />}
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 14,
                delay: 0.1,
              }}
              className="grid size-24 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                />
              </svg>
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display mt-6 text-4xl font-semibold text-balance text-white md:text-5xl"
            >
              Thank you{firstName ? `, ${firstName}` : ""}!
            </motion.h1>
            <p className="mt-3 text-base text-white/65 md:text-lg">
              You applied with {title}.
            </p>
          </motion.main>
        ) : (
          <motion.div
            key="teams"
            initial={celebrate ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <TeamPage
              title={team ? "You're all set" : "Find your people"}
              lede={
                team
                  ? `Your ${title} application is in and you're on ${team.name}. Results come out about a week after applications close.`
                  : `Your ${title} application is in. Teams are optional and hold up to ${MAX_TEAM_SIZE} people. Start one, ask to join one, or skip it and you're done. Results come out about a week after applications close.`
              }
              meta={
                <p className="inline-flex items-center gap-2 text-white/60">
                  <Check className="size-4 text-emerald-300" aria-hidden />
                  Application submitted
                </p>
              }
            >
              <div className="space-y-10">
                {team ? (
                  <Link
                    href="/apply/teams"
                    className="group flex items-center justify-between gap-4 rounded-3xl bg-linear-to-b from-[#5f9be2] via-[#3c7bcc] to-[#1c58a1] p-8 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:p-10"
                  >
                    <span>
                      <span className="font-display block text-4xl leading-none md:text-5xl">
                        {team.name}
                      </span>
                      <span className="mt-3 block text-white/80">
                        {team.isOwner && team.pendingCount > 0
                          ? `${team.pendingCount} ${team.pendingCount === 1 ? "person wants" : "people want"} to join`
                          : "Open your team"}
                      </span>
                    </span>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#043251] shadow-lg transition-transform duration-500 ease-out group-hover:scale-110">
                      <ArrowRight
                        className="size-5 -rotate-45 transition-transform duration-500 ease-out group-hover:rotate-0"
                        aria-hidden
                      />
                    </span>
                  </Link>
                ) : (
                  <>
                    <TeamChoices />
                    <MyRequests requests={requests} open={open} />
                  </>
                )}
                <Link
                  href="/applications/hacker/review"
                  className="inline-block text-white/60 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Review your answers
                </Link>
              </div>
            </TeamPage>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
