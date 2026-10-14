"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const noop = () => () => {};

export function ApplyMark() {
  const { data, status } = useSession();
  // False on the server and during hydration, so the first client paint matches.
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const email = data?.user?.email;

  if (!ready || status !== "authenticated") {
    return (
      <Image
        src="/logo-circle.png"
        alt="Hack Canada"
        width={40}
        height={40}
        className="pointer-events-none fixed top-4 left-4 z-20 h-10 w-10"
      />
    );
  }

  return (
    <div className="group fixed top-4 left-4 z-20">
      <Image
        src="/logo-circle.png"
        alt="Hack Canada"
        width={40}
        height={40}
        className="h-10 w-10 cursor-pointer"
      />
      <div className="pointer-events-none absolute top-full left-0 -translate-y-1 pt-2 opacity-0 transition duration-200 ease-out group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
        <div className="w-max max-w-64 rounded-2xl border border-white/10 bg-[#101017]/95 p-1 shadow-lg shadow-black/30 backdrop-blur-md">
          {email && (
            <p className="truncate px-3 pt-2 pb-1 text-xs text-white/45" title={email}>
              {email}
            </p>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white focus-visible:outline-none"
          >
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
