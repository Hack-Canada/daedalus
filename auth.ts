import { cache } from "react";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { CredentialsSignin, DefaultSession } from "next-auth";

import authConfig from "./auth.config";
import { db } from "./lib/db";
import {
  createVerificationToken,
  getVerificationTokenByEmail,
} from "./lib/db/queries/email-verification-tokens";
import { getUserByEmail, getUserById } from "./lib/db/queries/user";
import { sendWelcomeEmail } from "./lib/emails/ses";
import { getPhaseState } from "./lib/phase";
import { refreshSessionToken } from "./lib/security/session";

declare module "next-auth" {
  interface User {
    sessionVersion?: number;
  }
  interface Session {
    user: {
      role: UserRole;
      status: ApplicationStatus;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
    },
  },
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "credentials") {
        const { features } = await getPhaseState();
        if (!features.oauthSignIn) return false;

        const email = user.email;
        if (!email) return false;

        const existingUser = await getUserByEmail(email);
        if (!existingUser && !features.userRegistration) return false;

        return true;
      }

      // From here on: credentials users only
      if (!user.id) return false;

      const existingUser = await getUserById(user.id);

      if (!existingUser || !existingUser.email) {
        return false;
      }

      if (user.sessionVersion !== existingUser.sessionVersion) return false;

      if (!existingUser.emailVerified) {
        const [existingToken] = await getVerificationTokenByEmail(
          existingUser.email,
        );

        if (existingToken) {
          return `/email-verification?token=${existingToken.id}&email=${existingUser.email}`;
        }

        const { tokenId, code } = await createVerificationToken(
          existingUser.email,
        );

        const result = await sendWelcomeEmail({
          name: existingUser.name,
          email: existingUser.email,
          subject: "Verify your email address for Hack Canada",
          token: tokenId,
          verificationCode: code,
        });

        if (!result.success) {
          console.error("Error sending verification email:", result.error);
          return false;
        }

        return `/email-verification?token=${tokenId}&email=${existingUser.email}`;
      }

      return true;
    },

    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role as UserRole;
        }

        if (token.status) {
          session.user.status = token.status as ApplicationStatus;
        }

        session.user.name = token.name;
      }

      return session;
    },
    async jwt({ token, user, account }) {
      if (!token.sub) return null;
      const existingUser = await getUserById(token.sub);
      const authenticatedVersion = user
        ? account?.provider === "credentials"
          ? user.sessionVersion
          : existingUser?.sessionVersion
        : undefined;
      const refreshed = refreshSessionToken(
        token,
        existingUser,
        authenticatedVersion,
      );
      if (user && !refreshed) throw new CredentialsSignin();
      return refreshed;
    },
  },
  ...authConfig,
});

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
});
