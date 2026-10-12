"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export async function postTeam(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;
  if (!result || typeof result.message !== "string") {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
  return { success: Boolean(result.success), message: result.message };
}

export function useTeamAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(
    task: () => Promise<{ success: boolean; message: string }>,
  ) {
    setPending(true);
    setMessage(null);
    try {
      const result = await task();
      setMessage(result.message);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
      return result.success;
    } catch {
      const failure = "Something went wrong. Please try again.";
      setMessage(failure);
      toast.error(failure);
      return false;
    } finally {
      setPending(false);
    }
  }

  return { pending, message, run };
}
