import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { getHackerApplicationByUserId } from "@/lib/db/queries/application";
import { mintResumeGrant } from "@/lib/storage/resume-grant";
import { ownsResumeKey } from "@/lib/storage/resume-key";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json(
      { message: "You must be logged in" },
      { status: 401 },
    );
  }

  const application = await getHackerApplicationByUserId(currentUser.id);
  const key = application?.resumeUrl || "";
  if (!ownsResumeKey(currentUser.id, key)) {
    return NextResponse.json({ message: "Resume not found" }, { status: 404 });
  }

  const token = mintResumeGrant(key);
  return NextResponse.json({
    url: `/api/resume/open?token=${encodeURIComponent(token)}`,
  });
}
