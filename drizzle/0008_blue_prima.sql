DROP INDEX "unique_address";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_address" ON "address" USING btree ("id","address") WHERE "address"."archived_at" is null;