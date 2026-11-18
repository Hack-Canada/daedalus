"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import AuthCardWrapper from "../AuthCardWrapper";
import AuthFooter from "../AuthFooter";

const POLLING_INTERVAL = 5000; // 5 seconds

export function EmailVerificationCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [autoVerifyFinished, setAutoVerifyFinished] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState("");
  const hasAttemptedAutoVerify = useRef(false);
  const otpRef = useRef<HTMLInputElement>(null);

  const token = searchParams.get("token");
  const code = searchParams.get("code");
  const email = searchParams.get("email");
  const isAutoVerifying = Boolean(token && code && !autoVerifyFinished);

  const verifyEmail = useCallback(
    async (verificationCode: string) => {
      if (!token) return false;

      try {
        const response = await fetch("/api/auth/email-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: verificationCode, token }),
        });

        if (!response.ok) {
          const failure = await response.json().catch(() => null);
          toast.error(
            failure?.error || "Could not verify the code. Please try again.",
          );
          return false;
        }

        toast.success("Email verified successfully!");
        router.push("/sign-in");
        return true;
      } catch (error) {
        return false;
      }
    },
    [token, router],
  );

  // Auto-verify when both token and code are present in URL
  useEffect(() => {
    if (token && code && !hasAttemptedAutoVerify.current) {
      hasAttemptedAutoVerify.current = true;
      verifyEmail(code).then((success) => {
        setAutoVerifyFinished(true);
        if (!success) {
          setError("Auto-verification failed. Please enter the code manually.");
        }
      });
    }
  }, [token, code, verifyEmail]);

  // Disabling the input during a check drops focus, so hand it back whenever it is usable again.
  useEffect(() => {
    if (!isLoading && !isAutoVerifying) otpRef.current?.focus();
  }, [isLoading, isAutoVerifying]);

  // Check if email has been verified elsewhere (polling)
  const checkVerificationStatus = useCallback(async () => {
    if (!email) return false;

    try {
      const response = await fetch(
        `/api/auth/email-verification?email=${encodeURIComponent(email)}`,
      );

      if (!response.ok) return false;

      const data = await response.json();

      if (data.verified) {
        toast.success("Email verified! Redirecting to sign in...");
        router.push("/sign-in");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  }, [email, router]);

  // Poll for verification status every 5 seconds
  useEffect(() => {
    if (!email || isAutoVerifying) return;

    const intervalId = setInterval(() => {
      checkVerificationStatus();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [email, isAutoVerifying, checkVerificationStatus]);

  const handleManualSubmit = async (submittedCode: string) => {
    if (!token) {
      setError("Invalid verification link provided.");
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await verifyEmail(submittedCode);

    if (!success) {
      setError("Invalid verification code. Please try again.");
      toast.error("Invalid verification code");
    }

    setIsLoading(false);
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    const verified = await checkVerificationStatus();
    if (!verified) {
      toast.info("Email not yet verified");
    }
    setIsCheckingStatus(false);
  };

  // Show loading state during auto-verification
  if (isAutoVerifying) {
    return (
      <AuthCardWrapper>
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="size-12 animate-spin text-[#85B7F1]" />
          <div className="space-y-2 text-center">
            <h1 className="font-display text-4xl text-white md:text-5xl">
              Verifying Email
            </h1>
            <p className="text-sm text-white/60 md:text-base">
              Please wait while we verify your email...
            </p>
          </div>
        </div>
      </AuthCardWrapper>
    );
  }

  return (
    <AuthCardWrapper>
      <div className="space-y-2 text-center">
        <h1 className="font-display text-4xl text-white md:text-5xl">
          Verify Your Email
        </h1>
        <p className="text-sm text-white/60 md:text-base">
          Enter the 6-digit code sent to{" "}
          <span className="lowercase">{email}</span>
        </p>
      </div>
      <div className="space-y-6">
        <InputOTP
          ref={otpRef}
          autoFocus
          maxLength={6}
          onComplete={handleManualSubmit}
          disabled={isLoading}
          pattern={REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup className="mx-auto">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="border-white/15 bg-white/[0.04] text-white"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && <p className="text-center text-sm text-red-300">{error}</p>}

        <div className="flex flex-col gap-2">
          <Button
            variant="auth"
            className="w-full text-sm"
            onClick={() => router.push("/email-verification/new-code")}
            disabled={isLoading || isCheckingStatus}
          >
            Need a new code?
          </Button>

          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={handleCheckStatus}
            disabled={isLoading || isCheckingStatus}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Already verified? Check status
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-white/40">
          Verified on another device? This page will automatically redirect when
          verification is detected.
        </p>
      </div>
      <hr className="border-white/20" />
      <AuthFooter showSignUp={false} showResetPassword={false} />
    </AuthCardWrapper>
  );
}
