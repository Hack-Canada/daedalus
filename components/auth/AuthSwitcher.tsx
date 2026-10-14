"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";

import { siteConfig } from "@/config/site";

import AuthCardWrapper from "./AuthCardWrapper";
import AuthFooter from "./AuthFooter";
import SignInForm from "./sign-in/SignInForm";
import SignInHeader from "./sign-in/SignInHeader";
import SignUpForm from "./sign-up/SignUpForm";
import SignUpHeader from "./sign-up/SignUpHeader";

const easeOutCubic = [0.33, 1, 0.68, 1] as const;
const TITLES: Record<string, string> = {
  "/sign-in": "Sign In",
  "/sign-up": "Sign Up - Join Hack Canada",
};

// Opacity and transform only, so it stays on the compositor. The old form
// leaves quickly and the new one settles in, so the two never overlap.
const fade = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutCubic },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: "easeInOut" as const },
  },
};

// Sign in and sign up swap in place with pushState instead of a route change,
// so the pill and the forms animate together with no fetch.
export function AuthSwitcher() {
  const pathname = usePathname();
  const signUp = pathname === "/sign-up";

  useEffect(() => {
    if (TITLES[pathname]) {
      document.title = `${TITLES[pathname]} | ${siteConfig.title}`;
    }
  }, [pathname]);

  function onClickCapture(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (
      !anchor ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || !TITLES[url.pathname]) return;
    event.preventDefault();
    if (url.pathname === pathname) return;
    // Keep ?callbackUrl so switching tabs doesn't lose where to go after auth.
    window.history.pushState(null, "", url.pathname + window.location.search);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div onClickCapture={onClickCapture}>
        <AuthCardWrapper>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={signUp ? "up" : "in"}
              variants={fade}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {signUp ? (
                <>
                  <SignUpHeader />
                  <SignUpForm />
                  <AuthFooter
                    showResetPassword={false}
                    showContactUs={false}
                    showSignUp={false}
                  />
                </>
              ) : (
                <>
                  <SignInHeader />
                  <SignInForm />
                  <AuthFooter showSignIn={false} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </AuthCardWrapper>
      </div>
    </MotionConfig>
  );
}
