import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

import { RequestError } from "./request";

export class RateLimitError extends RequestError {
  constructor() {
    super("Too many attempts. Please wait before trying again.", 429);
  }
}

export async function consumeRateLimit(
  scope: string,
  identity: string,
  limit: number,
  seconds: number,
  connection: Pick<typeof db, "execute"> = db,
) {
  const key = `${scope}:${createHash("sha256").update(identity.trim().toLowerCase()).digest("hex")}`;
  const result = await connection.execute(sql`
    insert into "authRateLimit" ("key", "count", "resetAt")
    values (${key}, 1, clock_timestamp() + ${seconds} * interval '1 second')
    on conflict ("key") do update set
      "count" = case when "authRateLimit"."resetAt" <= clock_timestamp() then 1 else "authRateLimit"."count" + 1 end,
      "resetAt" = case when "authRateLimit"."resetAt" <= clock_timestamp() then clock_timestamp() + ${seconds} * interval '1 second' else "authRateLimit"."resetAt" end
    where "authRateLimit"."resetAt" <= clock_timestamp() or "authRateLimit"."count" < ${limit}
    returning "count"`);
  if (!result.rows.length) throw new RateLimitError();
  // Bounded cleanup, with an indexed expiry column. No model/scheduler required.
  await connection.execute(sql`delete from "authRateLimit" where "resetAt" < clock_timestamp() - interval '1 day' and "key" in
    (select "key" from "authRateLimit" where "resetAt" < clock_timestamp() - interval '1 day' limit 100 for update skip locked)`);
}

export async function limitAuthIp(
  request: Request,
  scope = "auth-entry",
  limit = 100,
) {
  // Vercel overwrites X-Forwarded-For. Other hosts must explicitly configure a
  // header that their ingress overwrites, never one it merely appends to.
  const header = process.env.VERCEL
    ? "x-forwarded-for"
    : process.env.AUTH_TRUSTED_IP_HEADER;
  const ip = header
    ? request.headers.get(header)?.split(",")[0].trim()
    : undefined;
  if (ip && isIP(ip)) await consumeRateLimit(scope, ip, limit, 15 * 60);
  else if (process.env.NODE_ENV === "production")
    throw new RequestError("Authentication is temporarily unavailable.", 503);
  return ip && isIP(ip) ? ip : "local-development";
}
