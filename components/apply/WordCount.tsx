import { wordCount } from "@/lib/apply/words";
import { cn } from "@/lib/utils";

export function WordCount({
  id,
  value,
  limit,
  className,
}: {
  id?: string;
  className?: string;
  value: string;
  limit: number;
}) {
  const count = wordCount(value);
  const over = count > limit;

  return (
    <span
      id={id}
      className={cn(
        "block text-sm",
        over ? "text-error" : "text-white/50",
        className,
      )}
    >
      {count} / {limit} words{over ? ". Over the word limit." : ""}
    </span>
  );
}
