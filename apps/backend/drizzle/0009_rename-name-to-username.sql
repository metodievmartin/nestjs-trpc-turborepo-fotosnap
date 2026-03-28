ALTER TABLE "user" RENAME COLUMN "name" TO "username";--> statement-breakpoint
DROP INDEX "post_userId_id_idx";--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "post_userId_createdAt_id_idx" ON "post" USING btree ("user_id","createdAt","id");--> statement-breakpoint
CREATE INDEX "post_createdAt_id_idx" ON "post" USING btree ("createdAt","id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");