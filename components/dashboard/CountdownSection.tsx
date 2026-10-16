"use client";

import Image from "next/image";

import { useHackathonPhase } from "@/hooks/useHackathonPhase";

import { CountdownTimer } from "../ui/CountdownTimer";
import { Snowflakes } from "../ui/Snowflakes";

export const CountdownSection = () => {
  const { isFeatureEnabled, eventDate } = useHackathonPhase();

  // Hide countdown during and after the event
  if (!isFeatureEnabled("showCountdown")) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm md:p-8 lg:col-span-2 xl:p-12">
      <Snowflakes />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <CountdownTimer targetDate={eventDate} />

        {/* Bottom left decorative section */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative size-16">
            <Image
              src="/hack-canada-logo.png"
              alt="Hack Canada"
              fill
              className="rounded-full object-contain"
              sizes="64px"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-rubik font-bold text-white md:text-lg">
              The Magic Begins Soon!
            </p>
            <p className="md:text-lg">
              <span className="text-white/60">
                Get ready to hack, create, and innovate!
              </span>{" "}
              🗻
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
