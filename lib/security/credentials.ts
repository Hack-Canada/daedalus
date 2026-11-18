import bcrypt from "bcryptjs";

import { getUserByEmail } from "@/lib/db/queries/user";

import { consumeRateLimit, limitAuthIp } from "./rate-limit";

export async function authenticatePassword(
  email: string,
  password: string,
  request: Request,
) {
  const ip = await limitAuthIp(request, "password-ip", 100);
  await consumeRateLimit("password-account-ip", `${email}:${ip}`, 15, 15 * 60);
  const user = await getUserByEmail(email.trim().toLowerCase());
  if (!user?.password || !(await bcrypt.compare(password, user.password)))
    return null;
  return user;
}
