ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_credentialID_pk" PRIMARY KEY("credentialID");--> statement-breakpoint
ALTER TABLE "verificationToken" ADD CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");