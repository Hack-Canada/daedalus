"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { ApplicantShare, PublicTeamCard } from "@/lib/apply/team-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { JoinRequestButton } from "./JoinRequestButton";
import { SpotsMeter } from "./SpotsMeter";

export function PublicTeamsBrowser({
  teams,
  share,
  open,
}: {
  teams: PublicTeamCard[];
  share: ApplicantShare;
  open: boolean;
}) {
  const [query, setQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(true);
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return teams.filter((team) => {
      if (openOnly && team.spotsLeft <= 0) return false;
      if (!needle) return true;
      return `${team.name} ${team.lookingFor}`.toLowerCase().includes(needle);
    });
  }, [teams, query, openOnly]);

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <Image
          src="/scenes/boat.webp"
          alt=""
          width={1000}
          height={345}
          className="motion-safe:animate-bob h-14 w-auto"
        />
        <p className="font-display mt-4 text-2xl text-white">
          No public teams yet
        </p>
        <p className="mt-1 max-w-sm text-white/60">
          Be the first. Start a team and others will find it here.
        </p>
        <Button asChild className="mt-6 min-h-11">
          <Link href="/apply/teams/new">Start a team</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-sm sm:flex-1">
          <label htmlFor="team-search" className="sr-only">
            Search teams
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40"
            aria-hidden
          />
          <Input
            id="team-search"
            type="search"
            value={query}
            placeholder="Search names or skills"
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 pl-9"
          />
        </div>
        <label
          htmlFor="open-spots"
          className="flex min-h-11 items-center gap-3 text-sm text-white"
        >
          <Switch
            id="open-spots"
            checked={openOnly}
            onCheckedChange={setOpenOnly}
          />
          Open spots only
        </label>
        <p
          className="text-sm text-white/45 sm:ml-auto"
          role="status"
          aria-live="polite"
        >
          {shown.length} {shown.length === 1 ? "team" : "teams"}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="border-y border-white/10 py-10 text-center text-white/60">
          No teams match. Try another word
          {openOnly ? " or include full teams" : ""}.
        </p>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {shown.map((team, index) => (
            <li
              key={team.id}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              className="animate-in fill-mode-both fade-in grid gap-4 py-6 duration-300 motion-reduce:animate-none md:grid-cols-[minmax(0,1fr)_16rem] md:gap-10"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <h2 className="font-display text-2xl break-words text-white">
                    {team.name}
                  </h2>
                  <SpotsMeter memberCount={team.memberCount} />
                </div>
                <p
                  className={cn(
                    "mt-2 line-clamp-3 max-w-2xl",
                    team.lookingFor ? "text-white/75" : "text-white/40 italic",
                  )}
                >
                  {team.lookingFor || "No note on who they need yet."}
                </p>
                <p className="mt-2 truncate text-sm text-white/45">
                  With {team.memberFirstNames.join(", ")}
                </p>
              </div>
              <div className="md:pt-1">
                <JoinRequestButton
                  teamName={team.name}
                  share={share}
                  open={open}
                  teamId={team.id}
                  requestStatus={team.requestStatus}
                  requestId={team.requestId}
                  cooldownUntil={team.cooldownUntil}
                  full={team.spotsLeft <= 0}
                  mine={team.mine}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
