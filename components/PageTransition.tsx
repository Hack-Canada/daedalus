"use client";

import { usePathname } from "next/navigation";

// Keyed on the path so every client navigation replays the enter animation;
// a template.tsx only replays when its direct child segment changes.
// No fill-mode: a lingering transform would trap position:fixed children.
// Sign in and sign up share a key because AuthSwitcher animates between them.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div
      key={path === "/sign-up" ? "/sign-in" : path}
      className="animate-page-in h-full motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
