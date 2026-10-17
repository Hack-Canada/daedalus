import { eq } from "drizzle-orm";

import { db } from "..";
import { users } from "../schema";

// Authentication must never fall back to retained claims after a failed read.
export const getUserById = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
};

export const getUserAcceptedTime = async (userId: string) => {
  try {
    const [user] = await db
      .select({ acceptedAt: users.acceptedAt })
      .from(users)
      .where(eq(users.id, userId));

    return user.acceptedAt;
  } catch (error) {
    console.error("Error fetching user accepted time: ", error);
    return null;
  }
};

export const updateUserHackerApplicationStatus = async (
  userId: string,
  status: ApplicationStatus,
) => {
  try {
    const [user] = await db
      .update(users)
      .set({ applicationStatus: status })
      .where(eq(users.id, userId))
      .returning();
    return user;
  } catch (error) {
    console.error("Error updating user hacker application status: ", error);
    return null;
  }
};

export const isUserEmailVerified = async (email: string) => {
  try {
    const [user] = await db
      .select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return false;
    }

    return user.emailVerified !== null;
  } catch (error) {
    console.error("Error checking email verification status: ", error);
    return false;
  }
};
