"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { fetcher } from "@/lib/utils";
import { ForgotPasswordSchema } from "@/lib/validations/forgot-password";
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

type Props = {};

const ForgotPasswordForm = ({}: Props) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: { email: string }) => {
    try {
      startTransition(async () => {
        const res = await fetcher("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({
            email: values.email,
          }),
        });

        if (res.success) {
          toast.success(res.message);
          router.push("/sign-in");
        } else {
          toast.error(res.message);
          setError(res.message);
        }
      });
    } catch (error) {
      toast.error(
        "Something went wrong. Please try again or contact us if the error persists.",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-md border border-error/50 bg-error/10 p-2">
            <p className="text-sm text-error">{error}</p>
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
          {isPending ? "Sending Email..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
