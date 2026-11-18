import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { ApiResponse } from "@/types/api";
import { putPendingResume } from "@/lib/storage/resume";
import { ownsResumeKey } from "@/lib/storage/resume-key";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "You must be logged in to upload a resume" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Validation error",
        error: "No file provided",
      },
      { status: 400 },
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Validation error",
        error: "Only PDF files are allowed",
      },
      { status: 400 },
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Validation error",
        error: "File size must be less than 5MB",
      },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await putPendingResume(currentUser.id, buffer);

    // The saved application can still reference the previous object. Retain it
    // until a separate reference-aware cleanup proves it is unreferenced.

    return NextResponse.json<ApiResponse<{ key: string }>>({
      success: true,
      message: "File uploaded successfully",
      data: { key },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
        error: "Failed to upload file",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "You must be logged in to delete a resume" },
      { status: 401 },
    );
  }

  const { key } = await request.json();

  if (!key || typeof key !== "string") {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Validation error",
        error: "Missing required field: key",
      },
      { status: 400 },
    );
  }

  try {
    if (!ownsResumeKey(currentUser.id, key)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Invalid resume" },
        { status: 403 },
      );
    }
    // Removing a form attachment does not change the durable draft reference.
    // Keep the object until the application is saved and cleanup can reconcile it.
    return NextResponse.json<ApiResponse>({
      success: true,
      message:
        "Save your application to remove this resume from your saved draft.",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
        error: "Failed to delete file",
      },
      { status: 500 },
    );
  }
}
