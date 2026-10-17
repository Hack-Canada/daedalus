ALTER TABLE "user" ADD COLUMN "sessionVersion" integer NOT NULL DEFAULT 0;
ALTER TABLE "emailVerificationToken" ADD COLUMN "attempts" integer NOT NULL DEFAULT 0;
ALTER TABLE "hackerApplication" ADD COLUMN "revision" integer NOT NULL DEFAULT 0;
ALTER TABLE "hackerApplication" ADD COLUMN "submittedAt" timestamp;
ALTER TABLE "hackerApplication" ADD COLUMN "teamSnapshot" jsonb;
ALTER TABLE "team" ADD COLUMN "essayRevision" integer NOT NULL DEFAULT 0;
ALTER TABLE "teamMember" ADD COLUMN "membershipId" text NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE "teamMember" ADD COLUMN "marsRevision" integer NOT NULL DEFAULT 0;
CREATE TABLE "authRateLimit" ("key" text PRIMARY KEY, "count" integer NOT NULL, "resetAt" timestamp NOT NULL);
CREATE INDEX "authRateLimit_expiry" ON "authRateLimit" ("resetAt");
CREATE TABLE "teamAnswerHistory" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "teamId" text NOT NULL, "entity" text NOT NULL, "operation" text NOT NULL,
  "record" jsonb NOT NULL, "recordedAt" timestamp NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX "teamAnswerHistory_team_time" ON "teamAnswerHistory" ("teamId", "recordedAt");
-- Preserve the state that exists at migration time before enabling change history.
INSERT INTO "teamAnswerHistory" ("teamId", "entity", "operation", "record") SELECT "id", 'team', 'BASELINE', to_jsonb(t) FROM "team" t;
INSERT INTO "teamAnswerHistory" ("teamId", "entity", "operation", "record") SELECT "teamId", 'member', 'BASELINE', to_jsonb(m) FROM "teamMember" m;
CREATE FUNCTION retain_team_answer_history() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE snapshot jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN snapshot := to_jsonb(OLD); ELSE snapshot := to_jsonb(NEW); END IF;
  INSERT INTO "teamAnswerHistory" ("teamId", "entity", "operation", "record")
    VALUES (CASE WHEN TG_TABLE_NAME = 'team' THEN snapshot->>'id' ELSE snapshot->>'teamId' END,
      CASE WHEN TG_TABLE_NAME = 'team' THEN 'team' ELSE 'member' END, TG_OP, snapshot);
  RETURN NULL;
END;
$$;
CREATE TRIGGER team_history AFTER INSERT OR UPDATE OR DELETE ON "team" FOR EACH ROW EXECUTE FUNCTION retain_team_answer_history();
CREATE TRIGGER member_history AFTER INSERT OR UPDATE OR DELETE ON "teamMember" FOR EACH ROW EXECUTE FUNCTION retain_team_answer_history();
