"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function Tabs() {
  const pathname = usePathname();
  const isSignIn = pathname?.includes("sign-in");
  const isSignUp = pathname?.includes("sign-up");

  return (
    <div className="relative flex w-fit rounded-full bg-white/[0.06] p-1">
      {/* Animated background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#85B7F1]"
        initial={false}
        animate={{ x: isSignUp ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      />

      <Link
        href="/sign-in"
        className={cn(
          "relative z-10 cursor-pointer px-5 py-2 text-sm font-medium transition-colors duration-500 md:px-6 md:text-base",
          isSignIn ? "text-[#043251]" : "text-white/60 hover:text-white/80",
        )}
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className={cn(
          "relative z-10 cursor-pointer px-5 py-2 text-sm font-medium transition-colors duration-500 md:px-6 md:text-base",
          isSignUp ? "text-[#043251]" : "text-white/60 hover:text-white/80",
        )}
      >
        Sign Up
      </Link>
    </div>
  );
}
