"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ApplyTrack, MAX_TEAM_SIZE, TRACKS } from "@/config/apply";
import { MyTeamView } from "@/lib/apply/team-types";

import { ApplyMark } from "./ApplyMark";

const THANKS_MS = 1000;
const spring = {
  type: "spring",
  stiffness: 110,
  damping: 20,
  mass: 0.9,
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

const choiceLink =
  "font-display text-3xl text-white underline decoration-[#85B7F1]/40 decoration-2 underline-offset-[10px] transition-colors hover:decoration-[#85B7F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-4xl";

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
  open,
}: {
  track: ApplyTrack | null;
  firstName: string | null;
  celebrate: boolean;
  team: MyTeamView | null;
  open: boolean;
}) {
  const [stage, setStage] = useState<"thanks" | "teams">(
    celebrate ? "thanks" : "teams",
  );
  const title =
    TRACKS.find((item) => item.id === track)?.title ?? "your application";
  const askTeam = stage === "teams" && !team;
  const heading = askTeam
    ? "Want to hack with friends?"
    : `Thank you${firstName ? `, ${firstName}` : ""}!`;
  const subtitle =
    stage === "thanks"
      ? `You applied with ${title}. Hang tight while we set up your next step.`
      : team
        ? `You applied with ${title}. You are on ${team.name}.`
        : `Optional. Teams hold up to ${MAX_TEAM_SIZE} people.`;

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
      <main
        className={`relative flex min-h-dvh w-full flex-col items-center overflow-x-clip px-6 ${
          stage === "thanks"
            ? "justify-center"
            : "justify-start pt-20 pb-20 md:pt-24"
        }`}
      >
        {open && <ApplyMark />}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_top,rgba(133,183,241,0.16),transparent_65%)]"
        />
        <motion.header
          layout
          transition={spring}
          className="relative flex max-w-2xl flex-col items-center text-center"
        >
          <motion.div
            layout
            transition={spring}
            className={stage === "thanks" ? "size-24" : "size-14"}
          >
            <motion.div
              initial={celebrate ? { scale: 0, rotate: -30 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 14,
                delay: 0.1,
              }}
              className="flex size-full items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30"
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
                  initial={celebrate ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </motion.div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={heading}
              layout="position"
              transition={spring}
              initial={celebrate ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-display mt-6 text-4xl font-semibold text-balance text-white md:text-5xl"
            >
              {heading}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={subtitle}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              aria-live="polite"
              className="mt-3 text-base text-white/65 md:text-lg"
            >
              {subtitle}
            </motion.p>
          </AnimatePresence>
        </motion.header>

        <AnimatePresence>
          {stage === "teams" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: celebrate ? 0.35 : 0 },
              }}
              className="relative mt-10 w-full max-w-3xl"
            >
              {team ? (
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <Link
                    href="/apply/teams"
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-white/25 md:p-8"
                  >
                    <span>
                      <span className="font-display block text-2xl text-white">
                        {team.name}
                      </span>
                      <span className="mt-1 block text-white/60">
                        {team.isOwner && team.pendingCount > 0
                          ? `${team.pendingCount} ${team.pendingCount === 1 ? "person wants" : "people want"} to join`
                          : "Manage your team"}
                      </span>
                    </span>
                    <ArrowRight className="size-5 text-white/70" aria-hidden />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8"
                >
                  <Link href="/apply/teams/new" className={choiceLink}>
                    Make a team
                  </Link>
                  <span className="text-sm text-white/40">or</span>
                  <Link href="/apply/teams/browse" className={choiceLink}>
                    Join a team
                  </Link>
                </motion.div>
              )}
              <p className="mx-auto mt-16 max-w-md text-center text-sm leading-relaxed text-white/55">
                {team
                  ? "Your application is in. "
                  : "If not, you're all set. Your application is in and there's nothing else to do. "}
                Results come out about a week after applications close :)
                <Link
                  href="/applications/hacker/review"
                  className="mx-auto mt-3 block w-fit text-white/80 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Review your answers
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
