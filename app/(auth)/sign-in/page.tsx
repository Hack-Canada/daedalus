import type { Metadata } from "next";

import { AuthSwitcher } from "@/components/auth/AuthSwitcher";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Hack Canada Hacker Portal account. Access your dashboard, manage applications, and connect with the HC community.",
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
