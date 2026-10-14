/** Private resume keys. No object ACL — bucket-owner enforced keeps them private. */

export function isStoredResumeKey(key: string) {
  if (!key || key.includes("..") || key.startsWith("/")) return false;
  const [prefix, owner, file] = key.split("/");
  if (!owner || !file || key.split("/").length !== 3) return false;
  return prefix === "pending" || prefix === "resumes";
}

export function ownsResumeKey(userId: string, key: string) {
  if (!userId || !key || key.includes("..") || key.startsWith("/")) return false;
  return (
    key.startsWith(`pending/${userId}/`) || key.startsWith(`resumes/${userId}/`)
  );
}

export function pendingResumeKey(userId: string) {
  return `pending/${userId}/${crypto.randomUUID()}.pdf`;
}

export function finalizedResumeKey(userId: string, pendingKey: string) {
  const prefix = `pending/${userId}/`;
  if (!ownsResumeKey(userId, pendingKey) || !pendingKey.startsWith(prefix)) return null;
  return `resumes/${userId}/${pendingKey.slice(prefix.length)}`;
}

function selfCheck() {
  const id = "user-1";
  const pending = `pending/${id}/abc.pdf`;
  if (!ownsResumeKey(id, pending)) throw new Error("own pending");
  if (ownsResumeKey(id, `pending/other/abc.pdf`)) throw new Error("foreign");
  if (ownsResumeKey(id, `pending/${id}/../x.pdf`)) throw new Error("traversal");
  if (finalizedResumeKey(id, pending) !== `resumes/${id}/abc.pdf`) {
    throw new Error("finalize path");
  }
  if (finalizedResumeKey(id, `pending/${id}/../x.pdf`) !== null) {
    throw new Error("finalize traversal");
  }
  if (!isStoredResumeKey(pending)) throw new Error("stored shape");
  if (isStoredResumeKey(`resumes/${id}/../x.pdf`)) throw new Error("stored traversal");
}

selfCheck();
