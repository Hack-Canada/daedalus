"use client";

import { type ReactNode } from "react";

import { type HackathonPhase } from "@/config/phases";
import { useHackathonPhase } from "@/hooks/useHackathonPhase";

// ============================================================================
// PhaseGuard Component
// ============================================================================

interface PhaseGuardProps {
  /** Array of phases in which to show children */
  phases: HackathonPhase[];
  /** Content to render when phase matches */
  children: ReactNode;
  /** Optional fallback content when phase doesn't match */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the current hackathon phase
 *
 * @example
 * <PhaseGuard phases={["during-event", "post-event"]}>
 *   <ProjectsCard />
 * </PhaseGuard>
 */
export function PhaseGuard({
  phases,
  children,
  fallback = null,
}: PhaseGuardProps) {
  const { isPhase } = useHackathonPhase();

  if (isPhase(...phases)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// ============================================================================
// PhaseContent Component
// ============================================================================

interface PhaseContentProps {
  /** Map of phases to their respective content */
  phases: Partial<Record<HackathonPhase, ReactNode>>;
  /** Optional fallback content if current phase not in map */
  fallback?: ReactNode;
}

/**
 * Renders different content based on the current hackathon phase
 *
 * @example
 * <PhaseContent
 *   phases={{
 *     "pre-event": <CountdownSection />,
 *     "during-event": <LiveUpdates />,
 *     "post-event": <ThankYouMessage />
 *   }}
 * />
 */
export function PhaseContent({ phases, fallback = null }: PhaseContentProps) {
  const { phase } = useHackathonPhase();

  const content = phases[phase];

  if (content !== undefined) {
    return <>{content}</>;
  }

  return <>{fallback}</>;
}

// ============================================================================
// FeatureGuard Component
// ============================================================================

interface FeatureGuardProps {
  /** Name of the feature to check */
  feature: string;
  /** Content to render when feature is enabled */
  children: ReactNode;
  /** Optional fallback content when feature is disabled */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on whether a feature is enabled
 *
 * @example
 * <FeatureGuard feature="showCountdown">
 *   <CountdownTimer />
 * </FeatureGuard>
 */
export function FeatureGuard({
  feature,
  children,
  fallback = null,
}: FeatureGuardProps) {
  const { isFeatureEnabled } = useHackathonPhase();

  if (isFeatureEnabled(feature as any)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
