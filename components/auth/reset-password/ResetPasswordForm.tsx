"use client";

import { useState, useTransition } from "react";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { fetcher } from "@/lib/utils";
import {
  ResetPasswordInput,
  ResetPasswordSchema,
} from "@/lib/validations/reset-password";
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

type ResetPasswordParamsProps = {
  token: string;
};

const ResetPasswordForm = ({ token }: ResetPasswordParamsProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token,
    },
  });

  const onSubmit = (values: ResetPasswordInput) => {
    try {
      startTransition(async () => {
        if (values.password !== values["confirmPassword"]) {
          setError("Passwords entered must be the same!");
          return;
        }

        const res = await fetcher("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            password: values.password,
            confirmPassword: values.confirmPassword,
            token,
          }),
        });

        if (res.success) {
          toast.success(
            "Password reset successful. Please sign in with your new password.",
          );
          redirect("/");
        } else {
          toast.error(res.message);
          setError(res.message);
        }
      });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Something bad happened.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && <p className="text-red-300 text-sm">{error}</p>}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white/90 font-medium">New Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter new password"
                  className="h-11"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-white/90 font-medium">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm new password"
                  className="h-11"
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
          disabled={isPending}
        >
          {isPending ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
