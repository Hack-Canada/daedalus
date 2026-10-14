import type { Metadata } from "next";

import { AuthSwitcher } from "@/components/auth/AuthSwitcher";

export const metadata: Metadata = {
  title: "Sign Up - Join Hack Canada",
  description: "Create your Hack Canada Hacker Portal account. Register for HC, apply to the hackathon, and join Canada's premier student hacker community.",
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
