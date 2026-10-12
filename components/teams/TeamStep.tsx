"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { MAX_TEAM_SIZE, MIN_TEAM_APPLY } from "@/config/apply";
import { MyRequestView, MyTeamView } from "@/lib/apply/team-types";

import { MyRequests } from "./MyRequests";
import { SpotsMeter } from "./SpotsMeter";
import { TeamAnswers } from "./TeamAnswers";
import { TeamChoices } from "./TeamChoices";
import { TeamHowItWorks } from "./TeamHowItWorks";

export function TeamStep({
  team,
  requests,
  open,
}: {
  team: MyTeamView | null;
  requests: MyRequestView[];
  open: boolean;
}) {
  if (team) {
    const ready = team.members.length >= MIN_TEAM_APPLY;
    return (
      <div className="space-y-6">
        <div
          className={
            ready
              ? "flex flex-wrap items-start gap-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.06] p-5"
              : "flex flex-wrap items-start gap-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.05] p-5"
          }
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white">
            <Users className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-1">
              <p className="font-medium text-white" role="status">
                {ready
                  ? `You are applying as ${team.name}.`
                  : `${team.name} needs ${MIN_TEAM_APPLY - team.members.length === 1 ? "1 more person" : `${MIN_TEAM_APPLY - team.members.length} more people`} to apply as a team.`}
              </p>
              <TeamHowItWorks />
            </div>
            <SpotsMeter memberCount={team.members.length} />
            <p className="text-sm text-white/65">
              {ready
                ? "Submit team application below sends your application. The team stays open until applications close, so people can still join and answers can still change."
                : "Teams stay open until applications close. Share your team link, then come back here to submit."}
            </p>
          </div>
          <Link
            href="/apply/teams"
            className="group inline-flex min-h-11 items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {ready ? "Manage team" : "Invite people"}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
        <TeamAnswers team={team} open={open} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="max-w-xl text-white/70">
        A team application needs a team of {MIN_TEAM_APPLY} to {MAX_TEAM_SIZE},
        including you. Start one or ask to join one. The owner accepts you
        before you are on it.
      </p>
      <TeamChoices />
      <MyRequests requests={requests} open={open} />
    </div>
  );
}
