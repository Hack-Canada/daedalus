"use client";

import { MyRequestView } from "@/lib/apply/team-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { postTeam, useTeamAction } from "./use-team-action";

export function MyRequests({
  requests,
  open,
}: {
  requests: MyRequestView[];
  open: boolean;
}) {
  const { pending, run } = useTeamAction();
  if (requests.length === 0) return null;

  return (
    <section aria-labelledby="my-requests-title" className="space-y-3">
      <h2 id="my-requests-title" className="font-display text-2xl text-white">
        Your requests
      </h2>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  request.status === "pending" ? "bg-sky-300" : "bg-white/25",
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {request.teamName}
                </p>
                <p className="text-sm text-white/55">
                  {request.status === "pending"
                    ? "Waiting on the owner"
                    : "Declined. You can ask again in 24 hours."}
                </p>
              </div>
            </div>
            {request.status === "pending" && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                disabled={!open || pending}
                onClick={() =>
                  void run(() =>
                    postTeam("/api/teams/requests/cancel", {
                      requestId: request.id,
                    }),
                  )
                }
              >
                Cancel request
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
