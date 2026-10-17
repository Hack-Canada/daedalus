import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import EmbeddedPostgres from "embedded-postgres";
import { Pool } from "pg";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  completeApplicationSubmission,
  getHackerApplicationByUserId,
  setApplicationTrack,
  writeApplication,
} from "@/lib/db/queries/application";
import {
  createVerificationToken,
  verifyEmailCode,
} from "@/lib/db/queries/email-verification-tokens";
import { consumePasswordReset } from "@/lib/db/queries/password-reset";
import {
  createTeam,
  leaveTeam,
  removeMember,
  saveMarsAnswer,
  saveTeamEssay,
  setAnswersLocked,
  transferOwnership,
} from "@/lib/db/queries/team";
import * as schema from "@/lib/db/schema";
import { authenticatePassword } from "@/lib/security/credentials";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { readLimitedBody, requireSameOriginJson } from "@/lib/security/request";
import { refreshSessionToken } from "@/lib/security/session";
import {
  DELETE as removeResume,
  POST as upload,
} from "@/app/api/upload/resume/route";

const state = vi.hoisted(() => ({
  db: null as unknown as ReturnType<typeof drizzle<typeof schema>>,
  user: {
    id: "u1",
    email: "one@example.test",
    role: "unassigned",
    status: "not_applied",
  },
  uploads: [] as Buffer[],
}));
vi.mock("@/lib/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@/auth", () => ({ getCurrentUser: async () => state.user }));
vi.mock("@/lib/storage/resume", () => ({
  putPendingResume: async (_id: string, bytes: Buffer) => {
    state.uploads.push(bytes);
    return "pending/u1/new.pdf";
  },
}));

let postgres: EmbeddedPostgres;
let pool: Pool;
let directory: string;
const app = (name = "Original") => ({
  userId: "u1",
  firstName: name,
  applicationType: "quick",
});
const expectedEssay = { teamId: "t1", revision: 0 };
const require = createRequire(import.meta.url);

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "daedalus-test-"));
  const port = await new Promise<number>((resolve) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
  });
  postgres = new EmbeddedPostgres({
    databaseDir: join(directory, "pg"),
    user: "postgres",
    password: "local-test-only",
    port,
    persistent: false,
    postgresFlags: ["-h", "127.0.0.1", "-c", "timezone=UTC"],
    onLog: () => {},
    onError: () => {},
  });
  await postgres.initialise();
  await postgres.start();
  pool = new Pool({
    host: "127.0.0.1",
    port,
    user: "postgres",
    password: "local-test-only",
    database: "postgres",
    max: 10,
  });
  state.db = drizzle(pool, { schema });
  // Recreate the pre-change schema, then run the actual additive migration.
  const { generateDrizzleJson, generateMigration } = require("drizzle-kit/api");
  const before = generateDrizzleJson(schema);
  delete before.tables["public.authRateLimit"];
  delete before.tables["public.teamAnswerHistory"];
  for (const [table, columns] of Object.entries({
    user: ["sessionVersion"],
    emailVerificationToken: ["attempts"],
    hackerApplication: ["revision", "submittedAt", "teamSnapshot"],
    team: ["essayRevision"],
    teamMember: ["membershipId", "marsRevision"],
  })) {
    for (const column of columns)
      delete before.tables[`public.${table}`].columns[column];
  }
  for (const statement of await generateMigration(
    generateDrizzleJson({}),
    before,
  ))
    await pool.query(statement);
  await pool.query(
    await readFile("drizzle/0009_application-integrity.sql", "utf8"),
  );
  process.env.AUTH_URL = "https://portal.example.test";
}, 60_000);

afterAll(async () => {
  await pool?.end();
  await postgres?.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
});
beforeEach(async () => {
  await pool.query(
    'TRUNCATE "user", "teamAnswerHistory", "authRateLimit", "passwordResetToken", "emailVerificationToken" CASCADE',
  );
  await state.db.insert(schema.users).values([
    { id: "u1", name: "One", email: "one@example.test" },
    { id: "u2", name: "Two", email: "two@example.test" },
    { id: "u3", name: "Three", email: "three@example.test" },
  ]);
  state.uploads = [];
});

async function team() {
  await state.db
    .insert(schema.teams)
    .values({
      id: "t1",
      name: "Team",
      inviteToken: "invite",
      createdBy: "u1",
      essay: "Shared original answer",
    });
  await state.db.insert(schema.teamMembers).values([
    {
      teamId: "t1",
      userId: "u1",
      marsAnswer: "One's Mars answer",
      membershipId: "m1",
    },
    {
      teamId: "t1",
      userId: "u2",
      marsAnswer: "Two's Mars answer",
      membershipId: "m2",
    },
  ]);
}

// Separate connections actually contend for locks; these are not query mocks.
describe("PostgreSQL application invariants", () => {
  it("rejects older save, track change, and submit after submission", async () => {
    await writeApplication(app(), 0);
    await writeApplication(app("Submitted"), 1, true);
    await completeApplicationSubmission("u1");
    await expect(writeApplication(app("Late draft"), 1)).rejects.toThrow(
      /submitted/,
    );
    await expect(setApplicationTrack("u1", "normal", 1)).rejects.toThrow(
      /tracks/,
    );
    await expect(
      writeApplication(app("Should not replace"), 1, true),
    ).rejects.toThrow(/submitted/);
    expect((await getHackerApplicationByUserId("u1"))?.firstName).toBe(
      "Submitted",
    );
  });
  it("preserves submitted answers while the existing second submission stage is incomplete", async () => {
    const first = await writeApplication(app("Committed answers"), 0, true);
    await expect(writeApplication(app("Late draft"), 1)).rejects.toThrow(
      /submitted/,
    );
    await expect(setApplicationTrack("u1", "normal", 1)).rejects.toThrow(
      /tracks/,
    );
    const retry = await writeApplication(
      app("Different retry answers"),
      0,
      true,
    );
    expect(retry.application.firstName).toBe("Committed answers");
    expect(retry.application.revision).toBe(first.application.revision);
    expect(
      (
        await state.db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, "u1"))
      )[0].applicationStatus,
    ).toBe("not_applied");
    await completeApplicationSubmission("u1");
    expect((await getHackerApplicationByUserId("u1"))?.firstName).toBe(
      "Committed answers",
    );
    expect(
      (
        await state.db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, "u1"))
      )[0].applicationStatus,
    ).toBe("pending");
  });
  it("allows only one concurrent first save and rejects stale tabs", async () => {
    const results = await Promise.allSettled([
      writeApplication(app("A"), 0),
      writeApplication(app("B"), 0),
    ]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect((await getHackerApplicationByUserId("u1"))?.revision).toBe(1);
    await expect(writeApplication(app("stale"), 0)).rejects.toThrow(
      /another tab/,
    );
    await expect(
      writeApplication(app("missing revision"), undefined as unknown as number),
    ).rejects.toThrow();
  });

  it("serializes team creation with a concurrent first application save", async () => {
    await Promise.all([
      writeApplication(app(), 0),
      createTeam("u1", "New team", false, ""),
    ]);
    expect((await getHackerApplicationByUserId("u1"))?.isTeam).toBe(true);
  });

  it("keeps submitted team snapshot and history after removal and team deletion", async () => {
    await team();
    const { application } = await writeApplication(
      { ...app(), applicationType: "team" },
      0,
      true,
    );
    expect(application.teamSnapshot).toMatchObject({
      teamId: "t1",
      essay: "Shared original answer",
    });
    await removeMember("u1", "u2");
    await leaveTeam("u1");
    expect(await state.db.select().from(schema.teams)).toHaveLength(0);
    expect((await getHackerApplicationByUserId("u1"))?.teamSnapshot).toEqual(
      application.teamSnapshot,
    );
    const history = await state.db.select().from(schema.teamAnswerHistory);
    expect(
      history.some(
        (row) =>
          row.operation === "DELETE" &&
          row.entity === "member" &&
          JSON.stringify(row.record).includes("Two's Mars answer"),
      ),
    ).toBe(true);
    expect(
      history.some(
        (row) => row.operation === "DELETE" && row.entity === "team",
      ),
    ).toBe(true);
  });
});

describe("PostgreSQL team conflicts", () => {
  it("keeps one concurrent shared answer and rejects the other revision", async () => {
    await team();
    const results = await Promise.all([
      saveTeamEssay("u1", "A", expectedEssay),
      saveTeamEssay("u2", "B", expectedEssay),
    ]);
    expect(results.filter((result) => result.success)).toHaveLength(1);
    expect(
      results.filter((result) => !result.success && result.conflict),
    ).toHaveLength(1);
  });
  it("rechecks lock state after waiting on another transaction", async () => {
    await team();
    const connection = await pool.connect();
    await connection.query("BEGIN");
    await connection.query(
      'UPDATE "team" SET "answersLocked" = true WHERE id = $1',
      ["t1"],
    );
    const saving = saveTeamEssay("u2", "must not save", expectedEssay);
    // Wait until PostgreSQL reports a blocked query, then release the lock.
    for (let i = 0; i < 100; i++) {
      const { rows } = await pool.query(
        "select pid from pg_stat_activity where wait_event_type = 'Lock'",
      );
      if (rows.length) break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    await connection.query("COMMIT");
    connection.release();
    expect((await saving).success).toBe(false);
    expect((await state.db.select().from(schema.teams))[0].essay).toBe(
      "Shared original answer",
    );
  });
  it("does not transfer ownership to a concurrently removed member", async () => {
    await team();
    await Promise.all([
      transferOwnership("u1", "u2"),
      removeMember("u1", "u2"),
    ]);
    const [current] = await state.db.select().from(schema.teams);
    const members = await state.db.select().from(schema.teamMembers);
    expect(members.some((member) => member.userId === current.createdBy)).toBe(
      true,
    );
  });
  it("rejects removed/rejoined membership and retains old Mars answer", async () => {
    await team();
    await removeMember("u1", "u2");
    await state.db
      .insert(schema.teamMembers)
      .values({ teamId: "t1", userId: "u2", membershipId: "new-membership" });
    const result = await saveMarsAnswer("u2", "stale", {
      teamId: "t1",
      membershipId: "m2",
      revision: 0,
    });
    expect(result.success).toBe(false);
    await setAnswersLocked("u1", true);
    expect(
      (
        await saveMarsAnswer("u1", "locked", {
          teamId: "t1",
          membershipId: "m1",
          revision: 0,
        })
      ).success,
    ).toBe(false);
  });
});

describe("PostgreSQL account security", () => {
  it("consumes a reset once and revokes existing sessions", async () => {
    await state.db
      .insert(schema.passwordResetTokens)
      .values({ token: "reset", userId: "u1" });
    const results = await Promise.all([
      consumePasswordReset("reset", "hash-a"),
      consumePasswordReset("reset", "hash-b"),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const [user] = await state.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, "u1"));
    expect(user.sessionVersion).toBe(1);
    expect(
      refreshSessionToken({ sub: "u1", sessionVersion: 0 }, user),
    ).toBeNull();
    expect(refreshSessionToken({ sub: "u1" }, user, 0)).toBeNull(); // login raced reset
    expect(refreshSessionToken({ sub: "u1" }, user, 1)).toMatchObject({
      sessionVersion: 1,
    });
    expect(
      refreshSessionToken({ sub: "u1", sessionVersion: 1 }, undefined),
    ).toBeNull();
    expect(refreshSessionToken({ sub: "u1" }, user)).toBeNull();
  });
  it("serializes different reset tokens for one account without deadlock", async () => {
    await state.db.insert(schema.passwordResetTokens).values([
      { token: "a", userId: "u1" },
      { token: "b", userId: "u1" },
    ]);
    const results = await Promise.all([
      consumePasswordReset("a", "a"),
      consumePasswordReset("b", "b"),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(
      await state.db.select().from(schema.passwordResetTokens),
    ).toHaveLength(0);
  });
  it("commits wrong-code attempts and caps parallel guesses at five", async () => {
    const { tokenId, code } = await createVerificationToken("one@example.test");
    const wrong = code === "000000" ? "111111" : "000000";
    await Promise.all(
      Array.from({ length: 8 }, () => verifyEmailCode(tokenId, wrong)),
    );
    expect(
      (await state.db.select().from(schema.emailVerificationTokens))[0]
        .attempts,
    ).toBe(5);
    expect(await verifyEmailCode(tokenId, code)).toBe(false);
  });
  it("consumes a correct code once, preserves email budget across resends", async () => {
    const { tokenId, code } = await createVerificationToken("one@example.test");
    const results = await Promise.all([
      verifyEmailCode(tokenId, code),
      verifyEmailCode(tokenId, code),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(
      await state.db.select().from(schema.emailVerificationTokens),
    ).toHaveLength(0);
    expect(
      (await state.db.select().from(schema.authRateLimits)).some((row) =>
        row.key.startsWith("verification-guess:"),
      ),
    ).toBe(true);
  });
  it("issues codes inside ten concurrent registration transactions without pool starvation", async () => {
    const issued = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        state.db.transaction(async (tx) => {
          const email = `registered-${i}@example.test`;
          await tx
            .insert(schema.users)
            .values({ id: `registered-${i}`, name: "Test", email });
          return createVerificationToken(
            email,
            tx as unknown as Parameters<typeof createVerificationToken>[1],
          );
        }),
      ),
    );
    expect(issued).toHaveLength(10);
    expect(issued.every((token) => /^\d{6}$/.test(token.code))).toBe(true);
  });
  it("retains the email guess budget when a code is replaced", async () => {
    const first = await createVerificationToken("one@example.test");
    await verifyEmailCode(
      first.tokenId,
      first.code === "000000" ? "111111" : "000000",
    );
    await state.db
      .update(schema.emailVerificationTokens)
      .set({ createdAt: new Date(Date.now() - 180_000) });
    const second = await createVerificationToken("one@example.test");
    expect(second.tokenId).not.toBe(first.tokenId);
    const limits = await state.db.select().from(schema.authRateLimits);
    expect(
      limits.find((row) => row.key.startsWith("verification-guess:"))?.count,
    ).toBe(1);
    expect(await verifyEmailCode(first.tokenId, first.code)).toBe(false);
  });
  it("has atomic distributed budgets", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 12 }, () =>
        consumeRateLimit("test", "identity", 4, 60),
      ),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(4);
    const [limit] = await state.db.select().from(schema.authRateLimits);
    expect(limit.count).toBe(4);
  });
  it("cleans expired budgets without deadlocking or deleting concurrently revived budgets", async () => {
    const key = (identity: string) =>
      `renew:${createHash("sha256").update(identity).digest("hex")}`;
    await state.db.insert(schema.authRateLimits).values(
      ["one", "two", "unused"].map((identity) => ({
        key: key(identity),
        count: 4,
        resetAt: new Date(Date.now() - 2 * 86400_000),
      })),
    );
    let arrived = 0;
    let release!: () => void;
    const bothUpdated = new Promise<void>((resolve) => {
      release = resolve;
    });
    await Promise.all(
      ["one", "two"].map((identity) =>
        state.db.transaction(async (tx) => {
          let first = true;
          const connection = {
            execute: (async (query) => {
              const result = await tx.execute(query);
              if (first) {
                first = false;
                if (++arrived === 2) release();
                await bothUpdated;
              }
              return result;
            }) as typeof state.db.execute,
          };
          await consumeRateLimit("renew", identity, 4, 60, connection);
        }),
      ),
    );
    const rows = await state.db.select().from(schema.authRateLimits);
    expect(rows.map((row) => row.key).sort()).toEqual(
      [key("one"), key("two")].sort(),
    );
    expect(
      rows.every((row) => row.count === 1 && row.resetAt > new Date()),
    ).toBe(true);
  });
  it("throttles the shared credentials function before password checking", async () => {
    await state.db
      .update(schema.users)
      .set({ password: await bcrypt.hash("FixturePassword1!", 4) })
      .where(eq(schema.users.id, "u1"));
    const request = new Request(
      "https://portal.example.test/api/auth/callback/credentials",
    );
    for (let i = 0; i < 15; i++)
      expect(
        await authenticatePassword("ONE@example.test", "wrong", request),
      ).toBeNull();
    await expect(
      authenticatePassword("one@example.test", "FixturePassword1!", request),
    ).rejects.toThrow(/Too many/);
  });
});

describe("request and form safety", () => {
  it("rejects cross-site/simple/missing-origin login and accepts same-origin JSON", () => {
    const make = (origin: string, type: string) =>
      new Request("https://portal.example.test/api/auth/login", {
        method: "POST",
        headers: { origin, "content-type": type },
      });
    expect(() =>
      requireSameOriginJson(make("https://evil.test", "text/plain")),
    ).toThrow();
    expect(() => requireSameOriginJson(make("", "application/json"))).toThrow();
    expect(() =>
      requireSameOriginJson(make("https://portal.example.test", "text/plain")),
    ).toThrow();
    expect(() =>
      requireSameOriginJson(
        make("https://portal.example.test", "application/json"),
      ),
    ).not.toThrow();
  });
  it("bounds an undeclared streamed request body", async () => {
    const request = new Request("https://portal.example.test", {
      method: "POST",
      body: "x".repeat(101),
    });
    await expect(readLimitedBody(request, 100)).rejects.toThrow(/too large/);
  });
  it("retains replacement and removed resume objects instead of deleting saved references", async () => {
    const form = new FormData();
    form.set(
      "file",
      new File(["%PDF-1.7\nfixture\n%%EOF"], "resume.pdf", {
        type: "application/pdf",
      }),
    );
    form.set("replaceKey", "pending/u1/old.pdf");
    expect(
      (
        await upload(
          new Request("https://portal.example.test", {
            method: "POST",
            body: form,
          }),
        )
      ).status,
    ).toBe(200);
    expect(state.uploads).toHaveLength(1);
    // Storage mock only exposes put. Any attempt to delete fails this test.
    expect(
      (
        await removeResume(
          new Request("https://portal.example.test", {
            method: "DELETE",
            body: JSON.stringify({ key: "pending/u1/old.pdf" }),
          }),
        )
      ).status,
    ).toBe(200);
  });
});
