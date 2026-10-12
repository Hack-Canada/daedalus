import { NextRequest, NextResponse } from "next/server";

import { readStoredResume } from "@/lib/storage/resume";
import { takeResumeGrant } from "@/lib/storage/resume-grant";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const key = takeResumeGrant(token);
  if (!key) {
    return NextResponse.json({ message: "Resume not found" }, { status: 404 });
  }

  try {
    const bytes = await readStoredResume(key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error reading resume:", error);
    return NextResponse.json({ message: "Resume not found" }, { status: 404 });
  }
}
