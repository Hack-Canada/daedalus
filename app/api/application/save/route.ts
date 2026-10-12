import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { ApiResponse } from "@/types/api";
import { toApplicationRow } from "@/lib/apply/payload";
import {
  createOrUpdateApplication,
  getHackerApplicationByUserId,
} from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import { getPhaseState } from "@/lib/phase";
import { ownsResumeKey } from "@/lib/storage/resume-key";
import { HackerApplicationDraftSchema } from "@/lib/validations/application";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json({
        success: false,
        message: "You must be logged in to save an application",
      });
    }

    if (currentUser.role !== "unassigned" || currentUser.status !== "not_applied") {
      return NextResponse.json({
        success: false,
        message: "You must not have submitted or been accepted to save an application",
      });
    }

    const { features } = await getPhaseState();
    if (!features.applicationSaving) {
      return NextResponse.json({
        success: false,
        message: "Application saving is not available at this time",
      });
    }

    const existing = await getHackerApplicationByUserId(currentUser.id);
    if (existing?.submissionStatus === "submitted") {
      return NextResponse.json({
        success: false,
        message: "This application has already been submitted",
      });
    }

    const validationResult = HackerApplicationDraftSchema.safeParse(
      await req.json(),
    );
    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors,
      )
        .flat()
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application data",
          error: errorMessages,
        },
        { status: 400 },
      );
    }

    if (
      validationResult.data.resumeUrl &&
      !ownsResumeKey(currentUser.id, validationResult.data.resumeUrl)
    ) {
      return NextResponse.json(
        { success: false, message: "Upload your resume again before saving." },
        { status: 400 },
      );
    }

    const team = await getTeamForUser(currentUser.id);
    const updatedApplication = await createOrUpdateApplication({
      ...toApplicationRow(
        validationResult.data,
        currentUser.id,
        currentUser.email || "",
        Boolean(team),
      ),
      submissionStatus: "draft",
    });

    if (!updatedApplication.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to save application. Please try again.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Application saved successfully",
    });
  } catch (error) {
    console.error("Save application error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to save application. Please try again.",
    });
  }
}
