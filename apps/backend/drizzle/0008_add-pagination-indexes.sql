ALTER TABLE "follow" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "follow_followingId_createdAt_idx" ON "follow" USING btree ("following_id","created_at");--> statement-breakpoint
CREATE INDEX "follow_followerId_createdAt_idx" ON "follow" USING btree ("follower_id","created_at");--> statement-breakpoint
CREATE INDEX "comment_postId_id_idx" ON "comment" USING btree ("post_id","id");--> statement-breakpoint
CREATE INDEX "post_userId_id_idx" ON "post" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX "story_expiresAt_userId_idx" ON "story" USING btree ("expires_at","userId");