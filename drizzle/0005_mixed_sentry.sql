ALTER TABLE "address" DROP CONSTRAINT "address_restaurantId_restaurants_id_fk";
--> statement-breakpoint
ALTER TABLE "address" DROP COLUMN "restaurantId";