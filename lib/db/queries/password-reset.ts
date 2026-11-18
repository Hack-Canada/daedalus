import { and, eq, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";

export async function consumePasswordReset(
  token: string,
  hashedPassword: string,
) {
  const [candidate] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
  if (!candidate) return false;
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, candidate.userId))
      .for("no key update");
    if (!user) return false;
    const [claimed] = await tx
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.userId, user.id),
          gt(
            passwordResetTokens.createdAt,
            sql`clock_timestamp() - interval '1 hour'`,
          ),
        ),
      )
      .returning();
    if (!claimed) return false;
    await tx
      .update(users)
      .set({
        password: hashedPassword,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    await tx
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));
    return true;
  });
}
