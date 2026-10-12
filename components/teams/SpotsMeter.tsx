import { MAX_TEAM_SIZE } from "@/config/apply";
import { cn } from "@/lib/utils";

export function SpotsMeter({
  memberCount,
  className,
}: {
  memberCount: number;
  className?: string;
}) {
  const spotsLeft = Math.max(0, MAX_TEAM_SIZE - memberCount);
  return (
    <p
      className={cn("flex items-center gap-3 text-sm text-white/70", className)}
    >
      <span className="flex gap-1.5" aria-hidden>
        {Array.from({ length: MAX_TEAM_SIZE }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-2.5 rounded-full",
              index < memberCount ? "bg-sky-300" : "ring-1 ring-white/30",
            )}
          />
        ))}
      </span>
      <span>
        {memberCount} of {MAX_TEAM_SIZE}
        {spotsLeft > 0
          ? ` · ${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} open`
          : " · full"}
      </span>
    </p>
  );
}
