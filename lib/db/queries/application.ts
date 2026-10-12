import { eq } from "drizzle-orm";

import { db } from "..";
import {
  hackerApplications,
  HackerApplicationsInsertData,
  HackerApplicationsSelectData,
  users,
} from "../schema";

export const getHackerApplicationByUserId = async (userId: string) => {
  try {
    const [application] = await db
      .select()
      .from(hackerApplications)
      .where(eq(hackerApplications.userId, userId));
    return application;
  } catch (error) {
    console.error(
      "Error fetching application in getApplicationByID function: ",
      error,
    );
    return null;
  }
};

export const createOrUpdateApplication = async (
  data: HackerApplicationsInsertData,
) => {
  try {
    const [application] = await db
      .insert(hackerApplications)
      .values(data)
      .onConflictDoUpdate({
        target: [hackerApplications.userId],
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { success: true, data: application };
  } catch (error) {
    console.error("Error in createOrUpdateApplication:", error);
    return { success: false, errors: [error] };
  }
};

export const submitApplication = async (
  application: HackerApplicationsSelectData,
) => {
  try {
    const { userId } = application;

    const result = await db.transaction(async (tx) => {
      // Update application
      const [updatedApplication] = await tx
        .update(hackerApplications)
        .set({
          ...application,
          updatedAt: new Date(),
        })
        .where(eq(hackerApplications.userId, userId))
        .returning();

      // Update user status
      await tx
        .update(users)
        .set({
          applicationStatus: "pending",
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return updatedApplication;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in submitApplication:", error);
    return { success: false, errors: [error] };
  }
};
