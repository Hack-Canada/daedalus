"use client";

import { useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Inbox,
  LogOut,
  Plus,
  Settings2,
} from "lucide-react";

import { LOOKING_FOR_LIMIT, MAX_TEAM_SIZE } from "@/config/apply";
import { MyTeamView } from "@/lib/apply/team-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { RequestPane } from "./RequestPane";
import { ShareTeamCard } from "./ShareTeamCard";
import { TeamAnswers } from "./TeamAnswers";
import { postTeam, useTeamAction } from "./use-team-action";

const SEEN_REQUESTS_KEY = "hc-seen-team-requests";

const SEEN_EVENT = "hc-seen-team-requests";

function readSeenRaw() {
  try {
    return localStorage.getItem(SEEN_REQUESTS_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseSeen(raw: string) {
  try {
    const ids = raw ? JSON.parse(raw) : [];
    return new Set<string>(
      Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [],
    );
  } catch {
    return new Set<string>();
  }
}

function subscribeSeen(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SEEN_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SEEN_EVENT, onChange);
  };
}

// Pastels from the main site, read on the dark background
const AVATAR_COLORS = [
  "bg-[#85B7F1]",
  "bg-[#F4B9A8]",
  "bg-[#B9E3C6]",
  "bg-[#F6DC8C]",
];

export function TeamManage({
  team,
  open,
}: {
  team: MyTeamView;
  open: boolean;
}) {
  const { pending, run } = useTeamAction();
  const [name, setName] = useState(team.name);
  const [isPublic, setIsPublic] = useState(team.isPublic);
  const [lookingFor, setLookingFor] = useState(team.lookingFor);
  const [copied, setCopied] = useState(false);
  const [pane, setPane] = useState(false);
  const seenRaw = useSyncExternalStore(subscribeSeen, readSeenRaw, () => null);
  const unseen =
    seenRaw === null
      ? 0
      : (() => {
          const seen = parseSeen(seenRaw);
          return team.requests.filter((request) => !seen.has(request.id))
            .length;
        })();
  const settingsDirty =
    name !== team.name ||
    isPublic !== team.isPublic ||
    lookingFor !== team.lookingFor;

  const savedSettings = `${team.name}\n${team.isPublic}\n${team.lookingFor}`;
  const [syncedSettings, setSyncedSettings] = useState(savedSettings);
  if (syncedSettings !== savedSettings) {
    setSyncedSettings(savedSettings);
    setName(team.name);
    setIsPublic(team.isPublic);
    setLookingFor(team.lookingFor);
  }

  function openRequests() {
    const seen = parseSeen(readSeenRaw());
    for (const request of team.requests) seen.add(request.id);
    // ponytail: last 200 ids. Older seen ids can pulse once more if they are still pending.
    try {
      localStorage.setItem(
        SEEN_REQUESTS_KEY,
        JSON.stringify([...seen].slice(-200)),
      );
      window.dispatchEvent(new Event(SEEN_EVENT));
    } catch {
      // private mode can block storage; the pane still opens
    }
    setPane(true);
  }

  function copyLink() {
    void navigator.clipboard.writeText(
      `${window.location.origin}${team.invitePath}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const openSpots = Math.max(0, MAX_TEAM_SIZE - team.members.length);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        {!open && (
          <p className="rounded-xl bg-white/[0.04] px-4 py-3 text-white/70">
            Applications are closed, so the team can no longer change.
          </p>
        )}
        <TeamAnswers team={team} open={open} />
      </div>

      <aside className="space-y-8" aria-label="Team tools">
        <section
          aria-labelledby="invite-title"
          className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#5f9be2] via-[#3c7bcc] to-[#1c58a1] p-6 text-white"
        >
          <h2 id="invite-title" className="font-display text-3xl leading-none">
            {openSpots > 0 ? "Invite people" : "Team is full"}
          </h2>
          <p className="mt-2 text-white/80">
            {openSpots > 0
              ? `${openSpots} ${openSpots === 1 ? "spot" : "spots"} open. Anyone with the link can ask to join, and ${team.isOwner ? "you" : "the owner"} decide${team.isOwner ? "" : "s"} who gets in.`
              : `You have all ${MAX_TEAM_SIZE} people.`}
          </p>
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? "Link copied" : "Copy team link"}
            className="mt-5 flex w-full items-center gap-2 rounded-xl bg-[#043251]/40 py-2.5 pr-3 pl-4 text-left ring-1 ring-white/15 transition-colors hover:bg-[#043251]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-white/85">
              {team.invitePath}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
              {copied ? (
                <Check className="size-4 text-emerald-200" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
          <div className="mt-3">
            <ShareTeamCard
              teamName={team.name}
              invitePath={team.invitePath}
              lookingFor={team.lookingFor}
              spotsLeft={openSpots}
              isOwner={team.isOwner}
            />
          </div>
          {team.isOwner && (
            <button
              type="button"
              className="mt-4 text-sm text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline disabled:opacity-50"
              disabled={!open || pending}
              onClick={() => {
                if (
                  !window.confirm(
                    "Reset the link? The current link and any shared cards will stop working.",
                  )
                )
                  return;
                void run(() => postTeam("/api/teams/invite/reset"));
              }}
            >
              Reset link
            </button>
          )}
        </section>

        <section aria-labelledby="members-title" className="space-y-3">
          <h2
            id="members-title"
            className="font-display flex items-baseline justify-between text-2xl text-white"
          >
            Members
            <span className="font-sans text-sm text-white/45">
              {team.members.length} of {MAX_TEAM_SIZE}
            </span>
          </h2>
          <ul className="space-y-2">
            {team.members.map((member, index) => (
              <li
                key={member.userId ?? `${member.firstName}-${index}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5"
              >
                <span
                  className={`font-display grid size-10 shrink-0 place-items-center rounded-full text-lg text-[#043251] ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                  aria-hidden
                >
                  {member.firstName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-white">
                    {member.firstName}
                    {member.isMe && (
                      <span className="text-white/45"> (you)</span>
                    )}
                  </span>
                  {member.isOwner && (
                    <span className="block text-sm text-white/45">Owner</span>
                  )}
                </span>
                {team.isOwner && member.userId && !member.isMe && (
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-9 px-2 text-xs"
                      disabled={!open || pending}
                      onClick={() => {
                        if (
                          !window.confirm(`Make ${member.firstName} the owner?`)
                        )
                          return;
                        void run(() =>
                          postTeam("/api/teams/members/transfer", {
                            userId: member.userId,
                          }),
                        );
                      }}
                    >
                      Make owner
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-9 px-2 text-xs hover:text-red-300"
                      disabled={!open || pending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Remove ${member.firstName} from the team?`,
                          )
                        )
                          return;
                        void run(() =>
                          postTeam("/api/teams/members/remove", {
                            userId: member.userId,
                          }),
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </span>
                )}
              </li>
            ))}
            {Array.from({ length: openSpots }, (_, index) => (
              <li
                key={`open-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 px-3 py-2.5 text-white/40"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-white/20"
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
                Open spot
              </li>
            ))}
          </ul>
          {team.isOwner && (
            <button
              type="button"
              onClick={openRequests}
              className={`group flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${team.pendingCount > 0 ? "text-[#85B7F1]" : "text-white/55"}`}
            >
              <span className="relative">
                <Inbox className="size-4" aria-hidden />
                {unseen > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex size-2"
                    aria-hidden
                  >
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300 opacity-75 motion-reduce:animate-none" />
                    <span className="relative size-2 rounded-full bg-sky-300" />
                  </span>
                )}
              </span>
              {team.pendingCount === 0
                ? "No join requests yet"
                : `${team.pendingCount} join ${team.pendingCount === 1 ? "request" : "requests"}${unseen > 0 ? `, ${unseen} new` : ""}`}
              {team.pendingCount > 0 && (
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              )}
            </button>
          )}
        </section>

        <div className="space-y-1 border-t border-white/10 pt-4">
          {team.isOwner && (
            <details className="group/settings">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <Settings2 className="size-4" aria-hidden />
                  Team settings
                </span>
                <ChevronDown
                  className="size-4 text-white/45 transition-transform duration-200 group-open/settings:rotate-180"
                  aria-hidden
                />
              </summary>
              <form
                className="space-y-4 pt-2 pb-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() =>
                    postTeam("/api/teams/settings", {
                      name,
                      isPublic,
                      lookingFor,
                    }),
                  );
                }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="settings-name"
                    className="block text-sm text-white"
                  >
                    Team name
                  </label>
                  <Input
                    id="settings-name"
                    value={name}
                    maxLength={60}
                    disabled={!open || pending}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="settings-looking"
                    className="block text-sm text-white"
                  >
                    What you are looking for
                  </label>
                  <Textarea
                    id="settings-looking"
                    value={lookingFor}
                    maxLength={LOOKING_FOR_LIMIT}
                    rows={4}
                    disabled={!open || pending}
                    aria-describedby="settings-looking-count"
                    onChange={(event) => setLookingFor(event.target.value)}
                  />
                  <p
                    id="settings-looking-count"
                    className="text-xs text-white/40"
                  >
                    {lookingFor.length}/{LOOKING_FOR_LIMIT}. Shown on Browse
                    teams and, if you choose, on your share card.
                  </p>
                </div>
                <label
                  htmlFor="settings-public"
                  className="flex min-h-11 items-center justify-between gap-4"
                >
                  <span className="text-sm text-white">
                    List on Browse teams
                    <span className="block text-white/45">
                      Off means only people with the link can find you.
                    </span>
                  </span>
                  <Switch
                    id="settings-public"
                    checked={isPublic}
                    disabled={!open || pending}
                    onCheckedChange={setIsPublic}
                  />
                </label>
                <Button
                  type="submit"
                  className="min-h-11 w-full"
                  disabled={!open || pending || !name.trim() || !settingsDirty}
                >
                  Save settings
                </Button>
              </form>
            </details>
          )}
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 text-red-300/75 transition-colors hover:text-red-300 disabled:opacity-50"
            disabled={!open || pending}
            onClick={() => {
              const prompt =
                team.members.length <= 1
                  ? "You are the last member. Leaving deletes the team and its answers."
                  : team.isOwner
                    ? "Leave this team? Ownership moves to the teammate who joined first."
                    : "Leave this team?";
              if (!window.confirm(prompt)) return;
              void run(() => postTeam("/api/teams/leave"));
            }}
          >
            <LogOut className="size-4" aria-hidden />
            Leave team
          </button>
        </div>
      </aside>

      {team.isOwner && (
        <RequestPane
          shown={pane}
          requests={team.requests}
          open={open}
          onClose={() => setPane(false)}
        />
      )}
    </div>
  );
}
