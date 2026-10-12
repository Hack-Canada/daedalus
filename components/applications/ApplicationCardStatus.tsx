import { type HackathonPhase } from "@/config/phases";
import { cn } from "@/lib/utils";

interface ApplicationCardStatusProps {
  status: "open" | "closed" | "coming soon";
  deadline?: string;
  phase: HackathonPhase;
}

export const ApplicationCardStatus = ({
  status,
  deadline,
  phase,
}: ApplicationCardStatusProps) => {
  // Dynamic message based on phase when status is closed
  const getClosedMessage = () => {
    if (phase === "post-event") {
      return "Hackathon concluded";
    }
    return "Applications closed";
  };

  return (
    <div className="relative z-10 flex gap-2 max-sm:flex-col sm:justify-between">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            status === "open" &&
              "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
            status === "closed" &&
              "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]",
            status === "coming soon" &&
              "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
          )}
        />
        <span
          className={cn(
            "text-xs font-medium capitalize md:text-sm",
            status === "open" && "text-emerald-400",
            status === "closed" && "text-rose-400",
            status === "coming soon" && "text-amber-400",
          )}
        >
          {status}
        </span>
      </div>
      {status === "closed" ? (
        <span className="text-xs text-white/50 sm:text-right md:text-sm">
          {getClosedMessage()}
        </span>
      ) : deadline ? (
        <span className="text-xs text-white/50 sm:text-right md:text-sm">
          Deadline: {deadline}
        </span>
      ) : null}
    </div>
  );
};
