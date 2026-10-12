"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Copy, Inbox } from "lucide-react";

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

const panel = "rounded-2xl border border-white/10 bg-white/[0.02] p-5";

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

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="space-y-4">
        {!open && (
          <p className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65">
            Applications are closed, so the team can no longer change.
          </p>
        )}
        <TeamAnswers team={team} open={open} />
      </div>

      <aside className="space-y-4" aria-label="Team tools">
        {team.isOwner && (
          <button
            type="button"
            onClick={openRequests}
            className={`${panel} group flex min-h-11 w-full items-center gap-3 text-left transition-colors hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`}
            aria-label={
              unseen > 0
                ? `Join requests, ${team.pendingCount} waiting, ${unseen} new`
                : `Join requests, ${team.pendingCount} waiting`
            }
          >
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06]">
              <Inbox className="size-5 text-white/80" aria-hidden />
              {unseen > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex size-3"
                  aria-hidden
                >
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300 opacity-75 motion-reduce:animate-none" />
                  <span className="relative size-3 rounded-full border-2 border-[#0a0a0f] bg-sky-300" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-white">
                Join requests
              </span>
              <span className="block text-sm text-white/55">
                {team.pendingCount === 0
                  ? "No one is waiting"
                  : unseen > 0
                    ? `${unseen} new · ${team.pendingCount} waiting`
                    : `${team.pendingCount} waiting`}
              </span>
            </span>
            <ChevronDown
              className="size-4 -rotate-90 text-white/40 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        )}

        <section
          aria-labelledby="invite-title"
          className={`${panel} space-y-4`}
        >
          <div className="space-y-1">
            <h2 id="invite-title" className="font-medium text-white">
              Invite people
            </h2>
            <p className="text-sm text-white/55">
              Anyone with the link can ask to join.{" "}
              {team.isOwner
                ? "You accept or decline each request."
                : "The owner accepts or declines."}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] py-1 pr-1 pl-3">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/70">
              {team.invitePath}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              aria-label={copied ? "Link copied" : "Copy team link"}
              onClick={copyLink}
            >
              {copied ? (
                <Check className="size-4 text-emerald-300" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
            </Button>
          </div>
          <ShareTeamCard
            teamName={team.name}
            invitePath={team.invitePath}
            lookingFor={team.lookingFor}
            spotsLeft={MAX_TEAM_SIZE - team.members.length}
            isOwner={team.isOwner}
          />
          {team.isOwner && (
            <button
              type="button"
              className="text-xs text-white/45 underline-offset-4 transition-colors hover:text-white hover:underline disabled:opacity-50"
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

        <section
          aria-labelledby="members-title"
          className={`${panel} space-y-3`}
        >
          <h2
            id="members-title"
            className="flex items-baseline justify-between font-medium text-white"
          >
            Members
            <span className="text-sm font-normal text-white/45">
              {team.members.length} of {MAX_TEAM_SIZE}
            </span>
          </h2>
          <ul className="divide-y divide-white/[0.06]">
            {team.members.map((member, index) => (
              <li
                key={member.userId ?? `${member.firstName}-${index}`}
                className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-300/15 text-sm font-medium text-sky-100"
                  aria-hidden
                >
                  {member.firstName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white">
                    {member.firstName}
                    {member.isMe && (
                      <span className="text-white/45"> (you)</span>
                    )}
                  </span>
                  {member.isOwner && (
                    <span className="block text-xs text-white/45">Owner</span>
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
          </ul>
        </section>

        {team.isOwner && (
          <details className={`${panel} group/settings`}>
            <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
              Team settings
              <ChevronDown
                className="size-4 text-white/45 transition-transform duration-200 group-open/settings:rotate-180"
                aria-hidden
              />
            </summary>
            <form
              className="mt-4 space-y-4"
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
                  {lookingFor.length}/{LOOKING_FOR_LIMIT}. Shown on Browse teams
                  and, if you choose, on your share card.
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

        <div className="px-1 pt-2">
          <button
            type="button"
            className="text-sm text-red-300/80 underline-offset-4 transition-colors hover:text-red-300 hover:underline disabled:opacity-50"
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
