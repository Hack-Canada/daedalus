"use client";

import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useHackathonPhase } from "@/hooks/useHackathonPhase";

type Props = {
  callbackUrl?: string;
  mode: "sign-in" | "sign-up";
};

const OAuthButtons = ({ callbackUrl = "/", mode }: Props) => {
  const { features } = useHackathonPhase();
  const allowed =
    features.oauthSignIn && (mode === "sign-in" || features.userRegistration);

  const handleOAuthSignIn = (
    e: React.MouseEvent<HTMLButtonElement>,
    provider: "google" | "github",
  ) => {
    e.preventDefault();
    if (!allowed) {
      toast.error(
        features.oauthSignIn
          ? "User registration is currently disabled."
          : "Sign-in with Google and GitHub is currently disabled.",
      );
      return false;
    }
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={(e) => handleOAuthSignIn(e, "google")}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
          !allowed && "cursor-not-allowed opacity-50",
        )}
        aria-label="Continue with Google"
        disabled={!allowed}
      >
        <FcGoogle size={22} />
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        onClick={(e) => handleOAuthSignIn(e, "github")}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
          !allowed && "cursor-not-allowed opacity-50",
        )}
        aria-label="Continue with GitHub"
        disabled={!allowed}
      >
        <FaGithub size={22} />
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
};

export default OAuthButtons;
