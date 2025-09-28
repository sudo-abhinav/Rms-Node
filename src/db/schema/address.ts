import { pgTable, uuid, text, doublePrecision, timestamp, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';
// import { users } from './user';
import { isNull } from 'drizzle-orm';
import { restaurants , users } from '../export';


export const address = pgTable('address', {
    id: uuid('id').defaultRandom().primaryKey(),
    street: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    userId: uuid('user_id').references(():AnyPgColumn => users.id),
    restaurantId :uuid('restaurantId').references(():AnyPgColumn => restaurants.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    updatedAt :timestamp('updateAt' , {withTimezone : true})
}, (address) => [
     uniqueIndex('unique_address')
            .on(address.id, address.street).where(isNull(address.archivedAt))
]);