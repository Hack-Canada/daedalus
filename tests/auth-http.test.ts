import { NextRequest } from "next/server";
import { AuthError } from "next-auth";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { RequestError } from "@/lib/security/request";
import { fetcher } from "@/lib/utils";
import { POST } from "@/app/api/auth/login/route";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  getUser: vi.fn(),
  limitIp: vi.fn(),
  authenticate: vi.fn(),
  send: vi.fn(),
}));
vi.mock("next-auth", async () => ({
  AuthError: (await import("@auth/core/errors")).AuthError,
}));
vi.mock("@/auth", () => ({ signIn: mocks.signIn }));
vi.mock("@/lib/db/queries/user", () => ({ getUserByEmail: mocks.getUser }));
vi.mock("@/lib/security/rate-limit", () => ({ limitAuthIp: mocks.limitIp }));
vi.mock("@/lib/security/credentials", () => ({
  authenticatePassword: mocks.authenticate,
}));
vi.mock("@/lib/emails/ses", () => ({ sendWelcomeEmail: mocks.send }));
vi.mock("@/lib/db/queries/email-verification-tokens", () => ({
  getVerificationTokenByEmail: async () => [{ id: "verification" }],
  createVerificationToken: vi.fn(),
}));

const request = (
  origin = "https://portal.example.test",
  contentType = "application/json",
) =>
  new NextRequest("https://portal.example.test/api/auth/login", {
    method: "POST",
    headers: { origin, "content-type": contentType },
    body: JSON.stringify({
      email: "one@example.test",
      password: "FixturePassword1!",
    }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  process.env.AUTH_URL = "https://portal.example.test";
  mocks.getUser.mockResolvedValue({
    email: "one@example.test",
    name: "One",
    password: "hash",
    emailVerified: new Date(),
  });
  mocks.signIn.mockResolvedValue("https://portal.example.test");
  mocks.authenticate.mockResolvedValue({ id: "one" });
});
afterEach(() => vi.unstubAllGlobals());

it("rejects cross-site login before account, password, mail, or cookie work", async () => {
  expect((await POST(request("https://evil.test", "text/plain"))).status).toBe(
    403,
  );
  expect(mocks.getUser).not.toHaveBeenCalled();
  expect(mocks.signIn).not.toHaveBeenCalled();
  expect(mocks.send).not.toHaveBeenCalled();
});
it("keeps verified same-origin login working", async () => {
  expect((await (await POST(request())).json()).success).toBe(true);
  expect(mocks.signIn).toHaveBeenCalledTimes(1);
  expect(mocks.authenticate).not.toHaveBeenCalled(); // provider owns the password check
});
it("keeps unverified-login redirect while authenticating the password first", async () => {
  mocks.getUser.mockResolvedValue({
    email: "one@example.test",
    name: "One",
    password: "hash",
    emailVerified: null,
  });
  const body = await (await POST(request())).json();
  expect(mocks.authenticate).toHaveBeenCalledTimes(1);
  expect(body.data.redirect).toContain("email-verification");
  expect(mocks.signIn).not.toHaveBeenCalled();
});
it("preserves rate-limit errors wrapped by the Auth.js credentials callback", async () => {
  const failure = new AuthError("callback failed");
  failure.cause = { err: new RequestError("Wait before retrying", 429) };
  mocks.signIn.mockRejectedValueOnce(failure);
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect((await response.json()).message).toBe("Wait before retrying");
});
it.each([403, 429, 503])(
  "shows auth API %s response text through the form fetcher",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            message: "Please try again later.",
          }),
          { status },
        ),
    );
    expect(await fetcher("/api/auth/login")).toEqual({
      success: false,
      message: "Please try again later.",
    });
  },
);
it("returns recoverable network errors to auth forms", async () => {
  vi.stubGlobal("fetch", async () => {
    throw new Error("network down");
  });
  expect((await fetcher("/api/auth/login")).success).toBe(false);
});
