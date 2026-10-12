"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LOOKING_FOR_LIMIT } from "@/config/apply";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { postTeam, useTeamAction } from "./use-team-action";

export function TeamCreateForm({ open }: { open: boolean }) {
  const router = useRouter();
  const { pending, run } = useTeamAction();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [lookingFor, setLookingFor] = useState("");

  return (
    <form
      className="max-w-xl space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void run(async () => {
          const result = await postTeam("/api/teams", {
            name,
            isPublic,
            lookingFor,
          });
          if (result.success) router.push("/apply/teams");
          return result;
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="team-name" className="block text-white">
          Team name
        </label>
        <Input
          id="team-name"
          value={name}
          maxLength={60}
          required
          autoFocus
          placeholder="Let us cook"
          disabled={!open || pending}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="looking-for" className="block text-white">
          Who are you looking for?{" "}
          <span className="text-white/45">(optional)</span>
        </label>
        <Textarea
          id="looking-for"
          value={lookingFor}
          maxLength={LOOKING_FOR_LIMIT}
          rows={4}
          placeholder="A designer who likes hardware, or anyone keen on ML."
          disabled={!open || pending}
          aria-describedby="looking-for-hint"
          onChange={(event) => setLookingFor(event.target.value)}
        />
        <p id="looking-for-hint" className="text-xs text-white/40">
          {lookingFor.length}/{LOOKING_FOR_LIMIT}. Shown on Browse teams and, if
          you choose, on your share card.
        </p>
      </div>
      <label
        htmlFor="team-public"
        className="flex min-h-11 items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3"
      >
        <span className="text-sm text-white">
          List on Browse teams
          <span className="block text-white/45">
            Off means only people with your link can find you.
          </span>
        </span>
        <Switch
          id="team-public"
          checked={isPublic}
          disabled={!open || pending}
          onCheckedChange={setIsPublic}
        />
      </label>
      <Button
        type="submit"
        className="min-h-11 w-full sm:w-auto"
        loading={pending}
        disabled={!open || !name.trim()}
      >
        Create team
      </Button>
    </form>
  );
}
