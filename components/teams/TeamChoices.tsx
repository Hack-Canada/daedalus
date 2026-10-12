import Link from "next/link";
import { ArrowRight, Plus, Users } from "lucide-react";

const CHOICES = [
  {
    href: "/apply/teams/new",
    icon: Plus,
    title: "Start a team",
    body: "Name it, say who you need, and share the link.",
  },
  {
    href: "/apply/teams/browse",
    icon: Users,
    title: "Browse teams",
    body: "Find a team with open spots and ask to join.",
  },
];

export function TeamChoices() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CHOICES.map(({ href, icon: Icon, title, body }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white motion-reduce:hover:translate-y-0"
        >
          <span className="grid size-11 place-items-center rounded-full bg-sky-300/15 text-sky-200">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="font-display mt-5 text-3xl text-white">{title}</span>
          <span className="mt-1 text-white/60">{body}</span>
          <span className="mt-6 ml-auto grid size-10 place-items-center rounded-full bg-[#043251] text-white ring-1 ring-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}
