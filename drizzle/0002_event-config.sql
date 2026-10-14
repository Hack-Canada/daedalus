CREATE TABLE "eventConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"phase" text,
	"registrationOpen" timestamp with time zone NOT NULL,
	"registrationClose" timestamp with time zone NOT NULL,
	"eventStart" timestamp with time zone NOT NULL,
	"eventEnd" timestamp with time zone NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO "eventConfig" ("id", "phase", "registrationOpen", "registrationClose", "eventStart", "eventEnd")
VALUES (
  'default',
  NULL,
  '2026-02-05T00:00:00-05:00',
  '2026-02-28T23:59:59-05:00',
  '2026-03-06T16:00:00-05:00',
  '2026-03-08T16:00:00-05:00'
);
