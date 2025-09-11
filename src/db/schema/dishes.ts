import { AnyPgColumn, doublePrecision, uniqueIndex } from "drizzle-orm/pg-core";
import { uuid , text,timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { isNull } from "drizzle-orm";
import { users } from "./user";


export const dishes = pgTable('dishes', {
    id : uuid('id').defaultRandom().primaryKey(),
    name : text('name').notNull(),
    price : doublePrecision('price').notNull(),
    restaurant_id : uuid('restaurant_id').references((): AnyPgColumn => restaurants.id),
    created_by : uuid('created_by').references(():AnyPgColumn => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),},
        (dishes)=>[
            uniqueIndex("dises_idx").on(dishes.name, dishes.restaurant_id).where(isNull(dishes.archivedAt))
        ])