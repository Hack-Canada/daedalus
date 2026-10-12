"use client";

import { Info } from "lucide-react";

import { MAX_TEAM_SIZE, MIN_TEAM_APPLY } from "@/config/apply";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const POINTS = [
  `Teams have ${MIN_TEAM_APPLY} to ${MAX_TEAM_SIZE} people, including you.`,
  "Everyone submits their own application on the Team track. Your team is attached to it.",
  "The team stays open until applications close. People can join or leave, and answers can change.",
  "The owner can lock the team answers so no one edits them, and unlock them any time.",
  "Finish the team answers before applications close. Nothing can change after that.",
];

export function TeamHowItWorks() {
  return (
    <Popover>
      <PopoverTrigger
        className="grid size-7 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white data-[state=open]:bg-white/10 data-[state=open]:text-white"
        aria-label="How teams work"
      >
        <Info className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-sm">
        <p className="font-medium text-white">How teams work</p>
        <ul className="mt-2 space-y-2 text-white/70">
          {POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span
                className="mt-2 size-1 shrink-0 rounded-full bg-sky-300"
                aria-hidden
              />
              {point}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
