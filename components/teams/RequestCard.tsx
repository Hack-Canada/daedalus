"use client";

import { RequestCardView } from "@/lib/apply/team-types";
import { Button } from "@/components/ui/button";

import { SHARE_FIELDS, ShareValue } from "./ShareValue";
import { postTeam, useTeamAction } from "./use-team-action";

export function RequestCard({
  request,
  open,
}: {
  request: RequestCardView;
  open: boolean;
}) {
  const { pending, message, run } = useTeamAction();

  return (
    <article className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-white">
          {request.profile.name || "Applicant"}
        </h3>
        <p className="text-xs text-white/50">
          {request.via === "link"
            ? "From your team link"
            : "From the public list"}
          {" · "}
          {new Date(request.createdAt).toLocaleString("en-US", {
            timeZone: "America/Toronto",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      {request.message && (
        <p className="text-sm text-white/80">{request.message}</p>
      )}
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {SHARE_FIELDS.map((field) => (
          <div key={field.key}>
            <dt className="text-white/45">{field.label}</dt>
            <dd className="text-white">
              <ShareValue value={request.profile[field.key]} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          disabled={!open || pending}
          onClick={() =>
            void run(() =>
              postTeam("/api/teams/requests/decide", {
                requestId: request.id,
                decision: "accept",
              }),
            )
          }
        >
          Accept
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={!open || pending}
          onClick={() =>
            void run(() =>
              postTeam("/api/teams/requests/decide", {
                requestId: request.id,
                decision: "decline",
              }),
            )
          }
        >
          Decline
        </Button>
      </div>
      {message && (
        <p role="status" className="text-sm text-white">
          {message}
        </p>
      )}
    </article>
  );
}
