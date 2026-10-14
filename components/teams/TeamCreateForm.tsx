"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LOOKING_FOR_LIMIT } from "@/config/apply";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SpotsMeter } from "./SpotsMeter";
import { postTeam, useTeamAction } from "./use-team-action";

const VISIBILITY = [
  {
    value: true,
    label: "Public",
    hint: "Anyone can find it on Browse teams.",
  },
  {
    value: false,
    label: "Link only",
    hint: "Only people with your link can find it.",
  },
];

export function TeamCreateForm({ open }: { open: boolean }) {
  const router = useRouter();
  const { pending, run } = useTeamAction();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [lookingFor, setLookingFor] = useState("");
  const disabled = !open || pending;

  return (
    <form
      className="grid gap-12 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16"
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
      <div className="space-y-10">
        <div>
          <label htmlFor="team-name" className="text-sm text-white/60">
            Team name
          </label>
          <Input
            id="team-name"
            value={name}
            maxLength={60}
            required
            autoFocus
            placeholder="Let us cook"
            disabled={disabled}
            onChange={(event) => setName(event.target.value)}
            className="font-display mt-1 h-auto rounded-none border-0 border-b border-white/20 bg-transparent px-0 pb-2 text-4xl shadow-none placeholder:text-white/20 focus-visible:border-[#85B7F1] focus-visible:ring-0 focus-visible:ring-offset-0 md:text-5xl"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="looking-for" className="text-sm text-white/60">
              Who are you looking for?{" "}
              <span className="text-white/35">Optional</span>
            </label>
            <span className="text-xs text-white/35 tabular-nums">
              {lookingFor.length}/{LOOKING_FOR_LIMIT}
            </span>
          </div>
          <Textarea
            id="looking-for"
            value={lookingFor}
            maxLength={LOOKING_FOR_LIMIT}
            rows={4}
            placeholder="A designer who likes hardware, or anyone keen on ML."
            disabled={disabled}
            onChange={(event) => setLookingFor(event.target.value)}
            className="mt-2 resize-none rounded-xl border-white/15 bg-white/[0.03] px-4 py-3 shadow-none focus-visible:border-[#85B7F1] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <fieldset>
          <legend className="text-sm text-white/60">Who can find it</legend>
          <div
            role="radiogroup"
            aria-label="Who can find it"
            className="mt-2 inline-flex rounded-full bg-white/[0.06] p-1"
          >
            {VISIBILITY.map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isPublic === option.value}
                disabled={disabled}
                onClick={() => setIsPublic(option.value)}
                className={cn(
                  "min-h-10 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  isPublic === option.value
                    ? "bg-white text-[#043251]"
                    : "text-white/70 hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-white/45">
            {VISIBILITY.find((option) => option.value === isPublic)?.hint}
          </p>
        </fieldset>

        <Button
          type="submit"
          loading={pending}
          disabled={!open || !name.trim()}
          className="h-12 rounded-full bg-[#85B7F1] px-8 font-semibold text-[#043251] hover:bg-[#a3c9f5]"
        >
          Create team
        </Button>
      </div>

      <aside aria-label="Preview" className="md:sticky md:top-24 md:self-start">
        <p className="text-sm text-white/45">How it shows on Browse teams</p>
        <div
          className={cn(
            "mt-3 rounded-3xl bg-linear-to-b from-[#0d426d] via-[#062f52] to-[#031b31] p-6 transition-opacity duration-300",
            !isPublic && "opacity-40",
          )}
        >
          <p className="font-display text-3xl break-words text-white">
            {name.trim() || "Your team"}
          </p>
          <SpotsMeter memberCount={1} className="mt-2" />
          <p
            className={cn(
              "mt-4 text-sm break-words",
              lookingFor.trim() ? "text-white/80" : "text-white/40 italic",
            )}
          >
            {lookingFor.trim() || "No note on who you need yet."}
          </p>
          <p className="mt-4 text-sm text-white/45">With you</p>
        </div>
        {!isPublic && (
          <p className="mt-3 text-sm text-white/45">Hidden from Browse teams.</p>
        )}
      </aside>
    </form>
  );
}
