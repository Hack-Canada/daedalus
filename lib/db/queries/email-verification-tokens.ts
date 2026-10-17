import { randomInt } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";

import { consumeRateLimit } from "@/lib/security/rate-limit";
import { RequestError } from "@/lib/security/request";

import { db } from "..";
import { emailVerificationTokens, users } from "../schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export const MAX_VERIFICATION_ATTEMPTS = 5;

export async function createVerificationToken(
  email: string,
  transaction?: Transaction,
) {
  const create = async (tx: Transaction) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.email, email))
      .for("no key update");
    if (!user || user.emailVerified)
      throw new RequestError("Unable to issue a verification code.", 400);
    const tokens = await tx
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.email, email));
    if (
      tokens.some((token) => token.createdAt.getTime() > Date.now() - 120_000)
    ) {
      throw new RequestError(
        "Please wait 2 minutes before requesting a new code.",
        429,
      );
    }
    await consumeRateLimit("verification-issuance", email, 5, 60 * 60, tx);
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await tx
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.email, email));
    const [token] = await tx
      .insert(emailVerificationTokens)
      .values({ email, code, expires: new Date(Date.now() + 60 * 60 * 1000) })
      .returning();
    return { tokenId: token.id, code };
  };
  return transaction ? create(transaction) : db.transaction(create);
}

export async function getVerificationTokenByEmail(email: string) {
  return db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.email, email),
        gt(emailVerificationTokens.expires, new Date()),
      ),
    );
}

export async function verifyEmailCode(token: string, code: string) {
  const [candidate] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, token));
  if (!candidate) return false;
  await consumeRateLimit("verification-guess", candidate.email, 20, 60 * 60);
  return db.transaction(async (tx) => {
    // Same lock order as issuance, so resending cannot resurrect an old code.
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.email, candidate.email))
      .for("no key update");
    if (!user || user.emailVerified) return false;
    const [attempt] = await tx
      .update(emailVerificationTokens)
      .set({ attempts: sql`${emailVerificationTokens.attempts} + 1` })
      .where(
        and(
          eq(emailVerificationTokens.id, token),
          gt(emailVerificationTokens.expires, new Date()),
          lt(emailVerificationTokens.attempts, MAX_VERIFICATION_ATTEMPTS),
        ),
      )
      .returning();
    // Return rather than throw: wrong guesses MUST commit the attempt count.
    if (!attempt || attempt.code !== code) return false;
    await tx
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id));
    await tx
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.email, user.email));
    return true;
  });
}

export async function deleteExpiredTokens(email: string) {
  return db
    .delete(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.email, email),
        lt(emailVerificationTokens.expires, new Date()),
      ),
    );
}
