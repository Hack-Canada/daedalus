export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function requireSameOriginJson(request: Request) {
  const configured = [
    process.env.AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  if (process.env.NODE_ENV !== "production")
    configured.push("http://localhost:3001", "http://127.0.0.1:3001");
  const allowed = configured.filter(Boolean).map((url) => new URL(url!).origin);
  if (!allowed.length)
    throw new RequestError("Authentication is temporarily unavailable.", 503);
  if (
    !allowed.includes(request.headers.get("origin") || "") ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new RequestError("Please sign in from this website.", 403);
  }
  // This non-simple request cannot be submitted by a cross-site HTML form.
  // Do not enable cross-origin CORS for these custom auth endpoints.
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    throw new RequestError("Expected a JSON request.", 415);
  }
}

export async function readLimitedBody(request: Request, limit: number) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > limit) throw new RequestError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Request body is required.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RequestError("Request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, size);
}

export async function readAuthJson(request: Request) {
  requireSameOriginJson(request);
  try {
    return JSON.parse(
      (await readLimitedBody(request, 16 * 1024)).toString("utf8"),
    );
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError("Invalid JSON request.", 400);
  }
}
