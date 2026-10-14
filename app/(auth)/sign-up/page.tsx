import type { Metadata } from "next";

import { AuthSwitcher } from "@/components/auth/AuthSwitcher";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Hack Canada account to apply solo or with your team.",
  keywords: [
    "Hack Canada sign up",
    "HC registration",
    "Hack Canada register",
    "join Hack Canada",
    "HC sign up",
    "hacker portal registration",
  ],
};

const SignUpPage = () => {
  return <AuthSwitcher />;
};

export default SignUpPage;
