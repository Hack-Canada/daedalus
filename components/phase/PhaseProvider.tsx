"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PhaseSnapshot } from "@/config/phases";

const PhaseContext = createContext<PhaseSnapshot | null>(null);

export function PhaseProvider({
  value,
  children,
}: {
  value: PhaseSnapshot;
  children: ReactNode;
}) {
  return (
    <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>
  );
}

export function usePhaseSnapshot() {
  const value = useContext(PhaseContext);
  if (!value) {
    throw new Error("PhaseProvider is missing");
  }
  return value;
}
