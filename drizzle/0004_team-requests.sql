CREATE TABLE "teamRequest" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"userId" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"via" text NOT NULL,
	"message" text,
	"consentAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"decidedAt" timestamp,
	"decidedBy" text
);
--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "inviteToken" text;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "lookingFor" text;--> statement-breakpoint
UPDATE "team" SET "inviteToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '') WHERE "inviteToken" IS NULL;--> statement-breakpoint
ALTER TABLE "team" ALTER COLUMN "inviteToken" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teamRequest" ADD CONSTRAINT "teamRequest_teamId_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teamRequest" ADD CONSTRAINT "teamRequest_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teamRequest" ADD CONSTRAINT "teamRequest_decidedBy_user_id_fk" FOREIGN KEY ("decidedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "teamRequest_pending_unique" ON "teamRequest" USING btree ("teamId","userId") WHERE "teamRequest"."status" = 'pending';--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_inviteToken_unique" UNIQUE("inviteToken");