"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { RequestCardView } from "@/lib/apply/team-types";
import { Button } from "@/components/ui/button";

import { RequestCard } from "./RequestCard";

export function RequestPane({
  shown,
  requests,
  open,
  onClose,
}: {
  shown: boolean;
  requests: RequestCardView[];
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shown) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [shown, onClose]);

  if (!shown) return null;

  // Portal: an animated ancestor keeps a transform, which would trap a fixed child.
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="animate-in fade-in absolute inset-0 bg-black/60 duration-300 motion-reduce:animate-none"
        aria-label="Close requests"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="requests-pane-title"
        className="animate-in slide-in-from-right-8 fade-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-[#12121a] shadow-2xl duration-300 ease-out motion-reduce:animate-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2
              id="requests-pane-title"
              className="font-display text-2xl text-white"
            >
              Requests
            </h2>
            <p className="text-sm text-white/55">
              {requests.length === 0
                ? "No one is waiting."
                : `${requests.length} waiting. You only see what they agreed to share.`}
            </p>
          </div>
          <Button
            ref={closeRef}
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {requests.length === 0 ? (
            <p className="text-sm text-white/60">
              New requests will show up here.
            </p>
          ) : (
            requests.map((request) => (
              <RequestCard key={request.id} request={request} open={open} />
            ))
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
