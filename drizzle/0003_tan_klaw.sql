CREATE TABLE "teamMember" (
	"teamId" text NOT NULL,
	"userId" text NOT NULL,
	"marsAnswer" text,
	"joinedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "teamMember_teamId_userId_pk" PRIMARY KEY("teamId","userId"),
	CONSTRAINT "teamMember_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"joinCode" text NOT NULL,
	"essay" text,
	"essayUpdatedBy" text,
	"essayUpdatedAt" timestamp,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "team_joinCode_unique" UNIQUE("joinCode")
);
--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "applicationType" text;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "xUrl" text;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "needsTravelReimbursement" boolean;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "travelAmount" integer;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "travelFrom" text;--> statement-breakpoint
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_teamId_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_essayUpdatedBy_user_id_fk" FOREIGN KEY ("essayUpdatedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;