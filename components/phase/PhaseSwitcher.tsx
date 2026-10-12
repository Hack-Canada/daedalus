"use client";

import { useRouter } from "next/navigation";

import { HACKATHON_PHASES, PHASE_PREVIEW_COOKIE } from "@/config/phases";

import { usePhaseSnapshot } from "./PhaseProvider";

const optionStyle = { color: "#18181b", backgroundColor: "#ffffff" };

export function PhaseSwitcher() {
  const { preview } = usePhaseSnapshot();
  const router = useRouter();

  function apply(value: string) {
    document.cookie = `${PHASE_PREVIEW_COOKIE}=${value}; Path=/; SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-md border border-white/20 bg-black/80 px-2 py-1 text-xs text-white shadow-lg">
      Phase
      <select
        className="bg-transparent text-xs text-white outline-none"
        value={preview ?? "config"}
        onChange={(event) => apply(event.target.value)}
        aria-label="Preview hackathon phase"
      >
        <option value="config" style={optionStyle}>
          Use config
        </option>
        {HACKATHON_PHASES.map((phase) => (
          <option key={phase} value={phase} style={optionStyle}>
            {phase}
          </option>
        ))}
      </select>
    </label>
  );
}
