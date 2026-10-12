"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  PartyPopper,
  Sparkles,
} from "lucide-react";

import { Confetti } from "@/components/ui/confetti";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const floatAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const timelineSteps = [
  {
    icon: Mail,
    title: "Confirmation Email",
    description: "Check your inbox for a confirmation",
    status: "done",
  },
  {
    icon: Clock,
    title: "Application Review",
    description: "Our team will review your application",
    status: "current",
  },
  {
    icon: Bell,
    title: "Decision Notification",
    description: "You'll receive an email with our decision",
    status: "upcoming",
  },
  {
    icon: CalendarCheck,
    title: "RSVP & Prepare",
    description: "Confirm attendance and get ready to hack!",
    status: "upcoming",
  },
];

export default function SubmissionSuccess() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full grow flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:min-h-svh xl:px-10">
      <Confetti
        className="confetti-container pointer-events-none absolute inset-0 h-svh w-full"
        options={{
          particleCount: 100,
          spread: 70,
          origin: { y: 0.3 },
        }}
      />

      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 size-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 size-64 rounded-full bg-sky-400/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1/4 top-1/4 size-48 rounded-full bg-primaryLight/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 lg:gap-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Icon & Header */}
        <motion.div
          className="flex flex-col items-center text-center"
          variants={itemVariants}
        >
          {/* Animated success badge */}
          <motion.div
            className="relative mb-6"
            variants={scaleVariants}
            animate={pulseAnimation}
          >
            <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25 sm:size-28 md:size-32">
              <CheckCircle2 className="size-12 text-white sm:size-14 md:size-16" />
              <motion.div
                className="absolute -right-2 -top-2"
                animate={floatAnimation}
              >
                <PartyPopper className="size-8 text-yellow-400 drop-shadow-lg sm:size-10" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-3"
                animate={{
                  ...floatAnimation,
                  transition: { ...floatAnimation.transition, delay: 0.5 },
                }}
              >
                <Sparkles className="size-6 text-primary drop-shadow-lg sm:size-8" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="mb-4">
            <h1 className="bg-gradient-to-r from-primary via-sky-400 to-primaryLight bg-clip-text font-rubik text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
              Application Submitted!
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-lg text-base text-white/60 sm:text-lg md:text-xl"
          >
            You&apos;re one step closer to joining Hack Canada! We&apos;ve
            received your application and can&apos;t wait to review it.
          </motion.p>
        </motion.div>

        {/* Beaver mascot */}
        <motion.div
          variants={scaleVariants}
          animate={floatAnimation}
          className="relative"
        >
          <Image
            src="/logo-circle.png"
            alt="Hack Canada"
            width={140}
            height={140}
            className="rounded-full drop-shadow-xl"
          />
        </motion.div>

        {/* What's Next Timeline */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm sm:p-8"
        >
          <h2 className="mb-6 text-center text-lg font-semibold text-white sm:text-xl">
            What Happens Next?
          </h2>

          <div className="space-y-4">
            {timelineSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className={`group relative flex items-start gap-4 rounded-xl p-3 transition-all duration-300 sm:p-4 ${
                  step.status === "done"
                    ? "bg-green-500/10"
                    : step.status === "current"
                      ? "bg-primary/10"
                      : "hover:bg-white/5"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                {/* Step icon */}
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors sm:size-12 ${
                    step.status === "done"
                      ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : step.status === "current"
                        ? "bg-primary text-white shadow-[0_0_15px_rgba(30,144,255,0.3)]"
                        : "bg-white/10 text-white/50"
                  }`}
                >
                  <step.icon className="size-5 sm:size-6" />
                </div>

                {/* Step content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium sm:text-lg ${
                        step.status === "done"
                          ? "text-green-400"
                          : step.status === "current"
                            ? "text-primary"
                            : "text-white/70"
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.status === "done" && (
                      <CheckCircle2 className="size-4 text-green-500" />
                    )}
                    {step.status === "current" && (
                      <motion.span
                        className="rounded-full border border-primary/30 bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        In Progress
                      </motion.span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/50">
                    {step.description}
                  </p>
                </div>

                {/* Connecting line */}
                {index < timelineSteps.length - 1 && (
                  <div className="absolute bottom-0 left-[1.4rem] h-4 w-0.5 translate-y-full bg-white/10 sm:left-[1.65rem]" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <motion.a
            href="/"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(30,144,255,0.4)] sm:w-auto sm:px-10 sm:py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
          </motion.a>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/apply"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white/80 transition-all duration-300 hover:border-primary/50 hover:bg-white/10 hover:text-primary hover:shadow-[0_0_15px_rgba(30,144,255,0.2)] sm:w-auto sm:px-8 sm:py-4"
            >
              <ExternalLink className="size-5" />
              <span>Review Application</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Pro tip */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-5 py-3 text-sm text-white/80"
        >
          <Sparkles className="size-4 shrink-0 text-primary" />
          <span>
            <strong className="text-primary">Pro tip:</strong> Add{" "}
            <span className="font-medium text-primaryLight">no-reply@hackcanada.org</span> to your
            contacts to avoid missing updates!
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
