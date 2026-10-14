"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { fetcher } from "@/lib/utils";
import {
  EmailValidationSchema,
  EmailValidationType,
} from "@/lib/validations/email-verification";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function NewCodeForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const form = useForm<EmailValidationType>({
    resolver: zodResolver(EmailValidationSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: EmailValidationType) => {
    try {
      startTransition(async () => {
        const { data, success, message } = await fetcher<{
          tokenId: string;
        }>("/api/auth/email-verification/new-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!success || !data) {
          toast.error(message || "Failed to send new code");
          setError(message || "Failed to send new code");
          if (message.includes("Please wait")) {
            setCooldown(120); // 2 minutes
          }
          return;
        }

        const { tokenId } = data;
        form.reset();
        toast.success("New verification code sent!");
        router.push(
          `/email-verification?token=${tokenId}&email=${values.email}`,
        );
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send new code";
      console.error("Error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && (
          <div className="border-error/50 bg-error/10 rounded-md border p-2">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white/90 font-medium">Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="you@example.com"
                  className="h-11 lowercase"
                  disabled={isPending || cooldown > 0}
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <Button
          variant="auth"
          type="submit"
          className="mt-1 h-11 w-full text-base font-semibold"
          disabled={isPending || cooldown > 0}
        >
          {isPending
            ? "Sending..."
            : cooldown > 0
              ? `Try again in ${cooldown}s`
              : "Send New Code"}
        </Button>
      </form>
    </Form>
  );
}
