import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { authenticatePassword } from "./lib/security/credentials";
import { LoginSchema } from "./lib/validations/login";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // GitHub appends iss=https://github.com/login/oauth. This Auth.js
      // version otherwise checks that value against https://authjs.dev.
      issuer: "https://github.com/login/oauth",
    }),
    Credentials({
      async authorize(credentials, request) {
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) return null;
        return authenticatePassword(
          validated.data.email,
          validated.data.password,
          request,
        );
      },
    }),
  ],
} satisfies NextAuthConfig;
