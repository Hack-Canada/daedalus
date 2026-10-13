import Link from "next/link";
import { ArrowRight } from "lucide-react";

// [left %, top %, size px, delay s]
const STARS = [
  [12, 14, 2, 0],
  [30, 8, 3, 1.2],
  [50, 20, 2, 0.6],
  [68, 10, 2, 2.1],
  [86, 22, 3, 0.3],
  [22, 34, 2, 2.6],
  [60, 36, 2, 1],
  [92, 40, 2, 1.7],
] as const;

const panel =
  "group relative flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-3xl p-8 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:min-h-[19rem] md:p-10";

function PanelCopy({
  title,
  body,
  button,
}: {
  title: string;
  body: string;
  button: string;
}) {
  return (
    <span className="relative block">
      <span className="font-display block text-4xl leading-none transition-transform duration-500 ease-out group-hover:-translate-y-1 md:text-5xl">
        {title}
      </span>
      <span className="mt-3 block max-w-sm text-white/80">{body}</span>
      <span
        className={`mt-8 flex size-12 items-center justify-center rounded-full shadow-lg transition-transform duration-500 ease-out group-hover:scale-110 ${button}`}
      >
        <ArrowRight
          className="size-5 -rotate-45 transition-transform duration-500 ease-out group-hover:rotate-0"
          aria-hidden
        />
      </span>
    </span>
  );
}

export function TeamChoices() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link
        href="/apply/teams/new"
        className={`${panel} bg-linear-to-b from-[#5f9be2] via-[#3c7bcc] to-[#1c58a1]`}
      >
        <PanelCopy
          title="Start a team"
          body="Name it, say who you need, and share the link."
          button="bg-white text-[#043251]"
        />
      </Link>

      <Link
        href="/apply/teams/browse"
        className={`${panel} bg-linear-to-b from-[#0d426d] via-[#062f52] to-[#031b31]`}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {STARS.map(([left, top, size, delay]) => (
            <span
              key={`${left}-${top}`}
              className="motion-safe:animate-twinkle absolute rounded-full bg-white"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </span>
        <PanelCopy
          title="Browse teams"
          body="Find a team with open spots and ask to join."
          button="bg-[#85B7F1] text-[#043251]"
        />
      </Link>
    </div>
  );
}
