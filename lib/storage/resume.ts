import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  finalizedResumeKey,
  isStoredResumeKey,
  ownsResumeKey,
  pendingResumeKey,
} from "@/lib/storage/resume-key";
import { s3Client } from "@/lib/storage/s3";

function bucket() {
  const name = process.env.AWS_S3_BUCKET_NAME;
  if (!name) throw new Error("AWS_S3_BUCKET_NAME is not set");
  return name;
}

export async function putPendingResume(userId: string, body: Buffer) {
  const key = pendingResumeKey(userId);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: "application/pdf",
    }),
  );
  return key;
}

export async function deletePendingResume(userId: string, key: string) {
  if (!ownsResumeKey(userId, key) || !key.startsWith("pending/")) {
    throw new Error("Cannot delete this resume");
  }
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

async function objectExists(key: string) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a pending upload to resumes/. Does not delete the pending object;
 * retain pending objects until a separate reference-aware cleanup proves they
 * are unreferenced. A saved draft may reference an old pending upload.
 */
export async function finalizeResume(userId: string, key: string) {
  if (key.startsWith(`resumes/${userId}/`) && ownsResumeKey(userId, key)) {
    return key;
  }
  const dest = finalizedResumeKey(userId, key);
  if (!dest) throw new Error("Invalid resume");

  const encoded = key.split("/").map(encodeURIComponent).join("/");
  try {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket(),
        CopySource: `${bucket()}/${encoded}`,
        Key: dest,
      }),
    );
  } catch (error) {
    if (!(await objectExists(dest))) throw error;
  }
  return dest;
}

async function readObject(key: string) {
  const obj = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
  );
  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes) throw new Error("Empty resume");
  return bytes;
}

export async function readStoredResume(key: string) {
  if (!isStoredResumeKey(key)) throw new Error("Invalid resume");
  return readObject(key);
}
