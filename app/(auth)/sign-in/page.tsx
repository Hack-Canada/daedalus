import type { Metadata } from "next";

import { AuthSwitcher } from "@/components/auth/AuthSwitcher";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Hack Canada to start, finish, or check on your application.",
  keywords: [
    "Hack Canada login",
    "HC login",
    "Hack Canada sign in",
    "hacker portal login",
    "HC portal sign in",
  ],
};

const SignInPage = () => {
  return <AuthSwitcher />;
};

export default SignInPage;
