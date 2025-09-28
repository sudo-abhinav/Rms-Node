DROP INDEX "dises_idx";--> statement-breakpoint
DROP INDEX "unique_address";--> statement-breakpoint
DROP INDEX "restaurants_idx";--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "restaurantId" uuid;--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "updateAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_restaurantId_restaurants_id_fk" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dishes_idx" ON "dishes" USING btree ("name","restaurant_id") WHERE "dishes"."archived_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_address" ON "address" USING btree ("id","address") WHERE "address"."archived_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "restaurants_idx" ON "restaurants" USING btree ("name","id") WHERE "restaurants"."archived_at" is null;--> statement-breakpoint
ALTER TABLE "address" DROP COLUMN "addrresId";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "restaurants" DROP COLUMN "longitude";