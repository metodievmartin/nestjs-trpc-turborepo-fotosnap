CREATE TABLE "feed_post_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"post_id" integer NOT NULL,
	"source_user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"published_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_story_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"story_id" integer NOT NULL,
	"source_user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"published_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "follower_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "feed_post_item" ADD CONSTRAINT "feed_post_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_item" ADD CONSTRAINT "feed_post_item_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_item" ADD CONSTRAINT "feed_post_item_source_user_id_user_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_story_item" ADD CONSTRAINT "feed_story_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_story_item" ADD CONSTRAINT "feed_story_item_story_id_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."story"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_story_item" ADD CONSTRAINT "feed_story_item_source_user_id_user_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_post_item_userId_createdAt_id_idx" ON "feed_post_item" USING btree ("user_id","created_at","id");--> statement-breakpoint
CREATE INDEX "feed_post_item_sourceUserId_userId_idx" ON "feed_post_item" USING btree ("source_user_id","user_id");--> statement-breakpoint
CREATE INDEX "feed_story_item_userId_expiresAt_createdAt_id_idx" ON "feed_story_item" USING btree ("user_id","expires_at","created_at","id");--> statement-breakpoint
CREATE INDEX "feed_story_item_sourceUserId_userId_idx" ON "feed_story_item" USING btree ("source_user_id","user_id");--> statement-breakpoint
CREATE INDEX "feed_story_item_expiresAt_idx" ON "feed_story_item" USING btree ("expires_at");