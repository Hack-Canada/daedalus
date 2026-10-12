"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { safeCallbackUrl } from "@/lib/apply/callback";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth-errors";
import { fetcher } from "@/lib/utils";
import { LoginSchema } from "@/lib/validations/login";
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

import OAuthButtons from "../OAuthButtons";

type Props = {};

const SignInForm = ({}: Props) => {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authError = searchParams.get("error");
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  useEffect(() => {
    if (!authError) return;

    toast.error(AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.default);

    const next =
      callbackUrl === "/"
        ? "/sign-in"
        : `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    router.replace(next);
  }, [authError, callbackUrl, router]);

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: { email: string; password: string }) => {
    try {
      startTransition(async () => {
        const res = await fetcher<{ redirect?: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(values),
        });

        if (res.data?.redirect) {
          // Handle email verification redirect
          toast.info(res.message);
          router.push(res.data.redirect);
        } else if (res.success) {
          window.location.href = callbackUrl;
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
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
              <FormLabel className="font-medium text-white/90">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus={true}
                  placeholder="you@example.com"
                  className="flex h-11 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white lowercase shadow-lg shadow-black/20 backdrop-blur-md transition-all file:font-medium placeholder:text-white/40 placeholder:capitalize focus-visible:border-white/50 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-white/90">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter your password"
                  className="flex h-11 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all file:font-medium placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <Button
          variant="auth"
          type="submit"
          className="mt-1 h-11 w-full cursor-pointer text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? "Signing In..." : "Login"}
        </Button>
      </form>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-white/20" />
        <span className="shrink-0 text-sm text-white/50">or</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      <OAuthButtons mode="sign-in" callbackUrl={callbackUrl} />
    </Form>
  );
};

export default SignInForm;
