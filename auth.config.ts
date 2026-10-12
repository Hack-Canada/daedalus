import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { getUserByEmail } from "./lib/db/queries/user";
import { LoginSchema } from "./lib/validations/login";
import GitHub from "next-auth/providers/github"

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
      async authorize(credentials) {
        const validatedCredentials = LoginSchema.safeParse(credentials);

        if (!validatedCredentials.success) {
          return null;
        }

        const { email } = validatedCredentials.data;
        const user = await getUserByEmail(email);

        if (!user) return null;

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (passwordsMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
  
} satisfies NextAuthConfig;
