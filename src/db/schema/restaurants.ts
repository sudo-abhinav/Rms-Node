import { isNull } from 'drizzle-orm';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user';
import { pgTable, uuid, varchar,doublePrecision, text, timestamp, index , pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core';



export const restaurants = pgTable('restaurants', {
    id :     uuid('id').defaultRandom().primaryKey(),
    name:    text('name').notNull(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    createdBy:         uuid('created_by').references(():AnyPgColumn => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
}, (restaurants)=>[
    uniqueIndex("restaurants_idx").on(restaurants.name , restaurants.address).where(isNull(restaurants.archivedAt))
])