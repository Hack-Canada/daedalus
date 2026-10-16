ALTER TABLE "hackerApplication" ADD COLUMN "travelDecision" text;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "travelApprovedAmount" integer;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "travelReviewedBy" text;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD COLUMN "travelReviewedAt" timestamp;--> statement-breakpoint
ALTER TABLE "hackerApplication" ADD CONSTRAINT "hackerApplication_travelReviewedBy_user_id_fk" FOREIGN KEY ("travelReviewedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;