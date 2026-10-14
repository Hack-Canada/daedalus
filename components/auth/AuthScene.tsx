"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import signInBeachAccent from "@/public/scenes/sign-in-beach-accent.png";
import signInBeach from "@/public/scenes/sign-in-beach.png";
import signUpBeach from "@/public/scenes/sign-up-beach-hc27.png";
import { AnimatePresence, motion } from "framer-motion";

import { Cloud } from "@/components/apply/ApplyPicker";

type Scene = "sign-in" | "sign-up" | "forgot";

function sceneFor(pathname: string): Scene {
  if (pathname === "/sign-in") return "sign-in";
  if (pathname === "/forgot-password" || pathname.startsWith("/reset-password"))
    return "forgot";
  return "sign-up";
}

const COPY: Record<"forgot", { title: React.ReactNode; line: string }> = {
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

// Sign in and sign up use beach artwork; password recovery keeps the sky scene.
export function AuthScene() {
  const scene = sceneFor(usePathname());

  if (scene === "sign-in" || scene === "sign-up") {
    const signIn = scene === "sign-in";
    return (
      <aside
        aria-hidden
        className="[container-type:size] relative hidden flex-1 overflow-hidden bg-[#d9ae73] lg:block"
      >
        {/* Anchor the lettering at the panel centre while the artwork covers its height. */}
        <div
          className={`absolute top-1/2 ${signIn ? "left-1/2 -translate-x-[49.5%] -translate-y-[52%]" : "left-[55%] -translate-x-1/2 -translate-y-1/2"}`}
          style={{
            width: signIn ? "max(100cqw, 197.12cqh)" : "max(100cqw, 148.74cqh)",
            aspectRatio: signIn ? "4096 / 2285.83203125" : "2539 / 1707",
          }}
        >
          <Image
            src={signIn ? signInBeach : signUpBeach}
            alt=""
            fill
            priority
            quality={95}
            unoptimized={!signIn}
            sizes="(min-width: 1024px) 110vw, 100vw"
            className="object-cover"
          />
          {signIn && (
            <Image
              src={signInBeachAccent}
              alt=""
              quality={95}
              sizes="28vw"
              className="absolute top-[63.295%] left-[73.548%] h-auto w-[25.323%]"
            />
          )}
        </div>
      </aside>
    );
  }

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

      <motion.div
        className="absolute left-1/2 origin-bottom -translate-x-1/2"
        initial={false}
        animate={{ scale: 1, bottom: "8%", y: 0 }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="motion-safe:animate-bob relative flex flex-col items-center [animation-delay:-2s]">
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
