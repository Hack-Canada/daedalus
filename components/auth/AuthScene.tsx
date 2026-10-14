"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { hackathonYear } from "@/config/site";
import { Cloud } from "@/components/apply/ApplyPicker";

type Scene = "sign-in" | "sign-up" | "forgot";

function sceneFor(pathname: string): Scene {
  if (pathname === "/sign-in") return "sign-in";
  if (pathname === "/forgot-password" || pathname.startsWith("/reset-password"))
    return "forgot";
  return "sign-up";
}

const COPY: Record<Scene, { title: React.ReactNode; line: string }> = {
  "sign-in": { title: "Welcome back", line: "Good to see you again." },
  "sign-up": {
    title: (
      <>
        Hack Canada
        <br />
        {hackathonYear}
      </>
    ),
    line: "Apply solo or bring your crew.",
  },
  forgot: {
    title: (
      <>
        Lost your
        <br />
        password?
      </>
    ),
    line: "Happens to the best of us. We'll send a bottle your way.",
  },
};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: "easeInOut" as const },
  },
};

// Same sky on every auth page; only the heading and one accent change.
export function AuthScene() {
  const scene = sceneFor(usePathname());

  return (
    <aside
      aria-hidden
      className="relative hidden flex-1 overflow-hidden bg-linear-to-b from-[#c4defb] via-[#9cc5f4] to-[#5f9be2] lg:block"
    >
      <Cloud className="motion-safe:animate-drift absolute top-[10%] right-[8%] w-36 text-white/80" />
      <Cloud className="motion-safe:animate-drift absolute top-[52%] left-[8%] w-24 text-white/60 [animation-delay:-8s]" />
      <Cloud className="motion-safe:animate-drift absolute top-[56%] right-[18%] w-28 text-white/40 [animation-delay:-15s]" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scene}
          variants={fade}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          <div className="absolute top-[18%] left-12 xl:left-16">
            <p className="font-display text-7xl leading-[0.9] text-[#043251] xl:text-8xl">
              {COPY[scene].title}
            </p>
            <p className="mt-5 max-w-xs text-lg text-[#043251]/70">
              {COPY[scene].line}
            </p>
          </div>

          {scene === "sign-up" && (
            <div className="motion-safe:animate-bob absolute top-[42%] right-[14%]">
              <Image
                src="/paper-plane.svg"
                alt=""
                width={200}
                height={150}
                className="h-32 w-auto drop-shadow-[0_12px_18px_rgba(4,50,81,0.18)]"
              />
            </div>
          )}
          {scene === "forgot" && (
            <div className="motion-safe:animate-bob absolute top-[40%] right-[14%]">
              <Image
                src="/scenes/bottle.png"
                alt=""
                width={346}
                height={277}
                className="h-32 w-auto -rotate-12 drop-shadow-[0_12px_18px_rgba(4,50,81,0.18)]"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sign in zooms the island and sinks it past the edge so only the top of the ice shows. */}
      <motion.div
        className="absolute left-1/2 origin-bottom -translate-x-1/2"
        initial={false}
        animate={
          scene === "sign-in"
            ? { scale: 2, bottom: "0%", y: 180 }
            : { scale: 1, bottom: "8%", y: 0 }
        }
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="motion-safe:animate-bob relative flex flex-col items-center [animation-delay:-2s]">
          <AnimatePresence initial={false}>
            {scene === "sign-in" && (
              <motion.div
                key="beaver"
                variants={fade}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute bottom-[76%] left-[28%] w-36"
              >
                <Image
                  src="/scenes/beaver-flag.webp"
                  alt=""
                  width={1050}
                  height={764}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Image
            src="/glacier-small.svg"
            alt=""
            width={193}
            height={115}
            className="h-40 w-auto"
          />
          <span className="mt-2 h-2.5 w-3/4 rounded-full bg-[#043251]/15 blur-sm" />
        </div>
      </motion.div>
    </aside>
  );
}
