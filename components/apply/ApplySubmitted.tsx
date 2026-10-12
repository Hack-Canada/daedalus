"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowRight, Plus, Users } from "lucide-react";

import { ApplyTrack, MAX_TEAM_SIZE, TRACKS } from "@/config/apply";
import { MyTeamView } from "@/lib/apply/team-types";

import { ApplyMark } from "./ApplyMark";

const THANKS_MS = 2600;
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

const CHOICES = [
  {
    href: "/apply/teams/new",
    title: "Make a team",
    body: `Name it, say what you are looking for, and share a link. Teams have up to ${MAX_TEAM_SIZE} people.`,
    Icon: Plus,
    accent: "bg-[#85B7F1]/15 text-[#85B7F1] ring-[#85B7F1]/25",
  },
  {
    href: "/apply/teams/browse",
    title: "Join a team",
    body: "Browse public teams. The owner sees the details you agree to share, then accepts or declines.",
    Icon: Users,
    accent: "bg-white/10 text-white ring-white/20",
  },
] as const;

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
  const solo = track !== "team";
  const subtitle =
    stage === "thanks"
      ? `You applied with ${title}. Hang tight while we set up your next step.`
      : team
        ? `You applied with ${title}. You are on ${team.name}.`
        : solo
          ? `You applied with ${title}. We review on a rolling basis and will email you.`
          : `You applied with ${title}. Teams are optional and hold up to ${MAX_TEAM_SIZE} people.`;

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
          <motion.h1
            layout="position"
            transition={spring}
            initial={celebrate ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="font-display mt-6 text-4xl font-semibold text-white md:text-5xl"
          >
            Thank you{firstName ? `, ${firstName}` : ""}!
          </motion.h1>
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
              className="relative mt-12 w-full max-w-3xl"
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
              ) : solo ? (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-sm text-white/60">
                    <span className="font-medium text-white/85">
                      Want to hack with friends?
                    </span>{" "}
                    Optional. Teams hold up to {MAX_TEAM_SIZE} people.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {CHOICES.map(({ href, title: label, Icon, accent }) => (
                      <Link
                        key={href}
                        href={href}
                        className="group flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <span
                          className={`flex size-8 items-center justify-center rounded-lg ring-1 ${accent}`}
                        >
                          <Icon className="size-4" aria-hidden />
                        </span>
                        {label}
                        <ArrowRight
                          className="ml-auto size-4 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white/80"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {CHOICES.map(({ href, title: label, body, Icon, accent }) => (
                    <motion.div key={href} variants={fadeUp}>
                      <Link
                        href={href}
                        className="group flex h-full min-h-11 flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:p-8"
                      >
                        <span
                          className={`flex size-12 items-center justify-center rounded-xl ring-1 ${accent}`}
                        >
                          <Icon className="size-6" aria-hidden />
                        </span>
                        <span className="font-display text-2xl font-semibold text-white">
                          {label}
                        </span>
                        <span className="text-white/60">{body}</span>
                        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-white/80">
                          Continue
                          <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-1"
                            aria-hidden
                          />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              <p className="mt-10 text-center text-sm text-white/50">
                {!solo && "Teams are optional. "}
                <Link
                  href="/applications/hacker/review"
                  className="text-white/80 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
