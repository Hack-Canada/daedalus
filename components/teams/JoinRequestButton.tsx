"use client";

import { useState } from "react";
import Link from "next/link";

import { REQUEST_NOTE_LIMIT } from "@/config/apply";
import { ApplicantShare } from "@/lib/apply/team-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { SHARE_FIELDS, ShareValue } from "./ShareValue";
import { postTeam, useTeamAction } from "./use-team-action";

export function JoinRequestButton({
  teamName,
  share,
  open,
  teamId,
  token,
  requestStatus,
  requestId,
  cooldownUntil,
  full,
  mine,
}: {
  teamName: string;
  share: ApplicantShare;
  open: boolean;
  teamId?: string;
  token?: string;
  requestStatus: "pending" | null;
  requestId: string | null;
  cooldownUntil: string | null;
  full: boolean;
  mine: boolean;
}) {
  const { pending, message, run } = useTeamAction();
  const [shown, setShown] = useState(false);
  const [consent, setConsent] = useState(false);
  const [note, setNote] = useState("");
  const fieldId = teamId ?? token ?? "team";

  if (mine) {
    return <p className="text-sm text-white/60">This is your team.</p>;
  }

  if (requestStatus === "pending" && requestId) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-white/75">
          <span className="size-2 rounded-full bg-sky-300" aria-hidden />
          Request sent
        </p>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          disabled={!open || pending}
          onClick={() =>
            void run(() =>
              postTeam("/api/teams/requests/cancel", { requestId }),
            )
          }
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (full) {
    return <p className="text-sm text-white/60">This team is full.</p>;
  }

  if (cooldownUntil) {
    return (
      <p className="text-sm text-white/60">
        You can ask this team again in 24 hours.
      </p>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="min-h-11"
        disabled={!open}
        onClick={() => setShown(true)}
      >
        Request to join
      </Button>
      <Dialog open={shown} onOpenChange={setShown}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-white">
              Ask to join {teamName}
            </DialogTitle>
            <DialogDescription>
              The owner sees only the details below. They can accept or decline.
              Nothing is shared until you agree.
            </DialogDescription>
          </DialogHeader>
          {!share.ready && (
            <p className="text-sm text-white">
              Save your name, school, and level of study on your application
              first.{" "}
              <Link href="/apply" className="underline">
                Go to your application
              </Link>
            </p>
          )}
          <dl className="max-h-52 space-y-2 overflow-y-auto text-sm">
            {SHARE_FIELDS.map((field) => (
              <div key={field.key} className="grid grid-cols-[9rem_1fr] gap-2">
                <dt className="text-white/50">{field.label}</dt>
                <dd className="text-white">
                  <ShareValue value={share.profile[field.key]} />
                </dd>
              </div>
            ))}
          </dl>
          <label
            htmlFor={`join-note-${fieldId}`}
            className="text-sm text-white"
          >
            Note for the owner (optional)
          </label>
          <Textarea
            id={`join-note-${fieldId}`}
            value={note}
            maxLength={REQUEST_NOTE_LIMIT}
            rows={3}
            onChange={(event) => setNote(event.target.value)}
          />
          <p className="text-xs text-white/40">
            {note.length}/{REQUEST_NOTE_LIMIT}
          </p>
          <div className="flex items-start gap-3">
            <Checkbox
              id={`join-consent-${fieldId}`}
              checked={consent}
              onCheckedChange={(value) => setConsent(value === true)}
            />
            <label
              htmlFor={`join-consent-${fieldId}`}
              className="text-sm text-white"
            >
              I agree the owner of {teamName} can see the details listed above.
            </label>
          </div>
          {message && (
            <p role="status" className="text-sm text-white">
              {message}
            </p>
          )}
          <Button
            type="button"
            className="min-h-11"
            disabled={!open || pending || !consent || !share.ready}
            onClick={() =>
              void run(async () => {
                const result = await postTeam("/api/teams/requests", {
                  ...(token ? { token } : { teamId }),
                  consent: true,
                  message: note,
                });
                if (result.success) setShown(false);
                return result;
              })
            }
          >
            Send request
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
