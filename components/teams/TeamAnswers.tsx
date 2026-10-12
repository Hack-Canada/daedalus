"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import {
  ESSAY_WORD_LIMIT,
  MARS_WORD_LIMIT,
  TEAM_PROMPTS,
} from "@/config/apply";
import { MyTeamView } from "@/lib/apply/team-types";
import { wordCount } from "@/lib/apply/words";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { WordCount } from "@/components/apply/WordCount";

import { postTeam, useTeamAction } from "./use-team-action";

function editedLabel(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TeamAnswers({
  team,
  open,
}: {
  team: MyTeamView;
  open: boolean;
}) {
  const { pending, run } = useTeamAction();
  const mine = team.members.find((member) => member.isMe);
  const savedMars = mine?.marsAnswer ?? "";
  const [mars, setMars] = useState(savedMars);
  const [essay, setEssay] = useState(team.essay);
  const [synced, setSynced] = useState({ mars: savedMars, essay: team.essay });

  if (synced.mars !== savedMars || synced.essay !== team.essay) {
    if (synced.mars !== savedMars) setMars(savedMars);
    if (synced.essay !== team.essay) setEssay(team.essay);
    setSynced({ mars: savedMars, essay: team.essay });
  }

  const marsOver = wordCount(mars) > MARS_WORD_LIMIT;
  const essayOver = wordCount(essay) > ESSAY_WORD_LIMIT;
  const marsDirty = mars !== (mine?.marsAnswer ?? "");
  const essayDirty = essay !== team.essay;
  const locked = team.answersLocked;
  const canEdit = open && !locked;

  return (
    <section
      aria-labelledby="team-answers-title"
      className="space-y-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <h2
            id="team-answers-title"
            className="font-display flex items-center gap-2 text-2xl text-white"
          >
            Team answers
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-2 py-0.5 font-sans text-xs text-amber-100">
                <Lock className="size-3" aria-hidden />
                Locked
              </span>
            )}
          </h2>
          <p className="text-sm text-white/55">
            Your Mars answer is yours. The shared answer is one for the whole
            team.
          </p>
        </div>
        {team.isOwner ? (
          <label
            htmlFor="lock-answers"
            className="flex min-h-11 items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-2"
          >
            <span className="text-sm text-white">
              Lock answers
              <span id="lock-answers-why" className="block text-white/45">
                Stops teammates from editing. Unlock any time before
                applications close.
              </span>
            </span>
            <Switch
              id="lock-answers"
              checked={locked}
              disabled={!open || pending}
              aria-describedby="lock-answers-why"
              onCheckedChange={(value) =>
                void run(() =>
                  postTeam("/api/teams/lock", { locked: value === true }),
                )
              }
            />
          </label>
        ) : (
          locked && (
            <p role="status" className="text-sm text-white/55">
              The owner locked these answers.
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="mars-answer" className="block text-white">
          {TEAM_PROMPTS.mars}
        </label>
        <Textarea
          id="mars-answer"
          value={mars}
          disabled={!canEdit || pending}
          rows={4}
          aria-describedby="mars-count"
          onChange={(event) => setMars(event.target.value)}
        />
        <div className="flex min-h-11 items-center justify-between gap-3">
          <WordCount id="mars-count" value={mars} limit={MARS_WORD_LIMIT} />
          {canEdit && (
            <Button
              type="button"
              variant={marsDirty ? "default" : "outline"}
              className="min-h-11"
              disabled={pending || marsOver || !marsDirty}
              onClick={() =>
                void run(() =>
                  postTeam("/api/teams/mars", { marsAnswer: mars }),
                )
              }
            >
              {marsDirty || !mine?.marsAnswer ? "Save" : "Saved"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="team-essay" className="block text-white">
          {TEAM_PROMPTS.essay}
        </label>
        <p id="essay-hint" className="text-sm text-white/50">
          One answer for the whole team.
          {team.essayUpdatedAt &&
            ` Last edited by ${team.essayUpdatedByName || "a teammate"}, ${editedLabel(team.essayUpdatedAt)}.`}
        </p>
        <Textarea
          id="team-essay"
          value={essay}
          disabled={!canEdit || pending}
          rows={6}
          aria-describedby="essay-hint essay-count"
          onChange={(event) => setEssay(event.target.value)}
        />
        <div className="flex min-h-11 items-center justify-between gap-3">
          <WordCount id="essay-count" value={essay} limit={ESSAY_WORD_LIMIT} />
          {canEdit && (
            <Button
              type="button"
              variant={essayDirty ? "default" : "outline"}
              className="min-h-11"
              disabled={pending || essayOver || !essayDirty}
              onClick={() =>
                void run(() => postTeam("/api/teams/essay", { essay }))
              }
            >
              {essayDirty || !team.essay ? "Save" : "Saved"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
