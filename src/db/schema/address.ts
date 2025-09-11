import { pgTable, uuid, text, doublePrecision, timestamp, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './user';
import { isNull } from 'drizzle-orm';


export const address = pgTable('address', {
    addrresId: uuid('addrresId').defaultRandom().primaryKey(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    userId: uuid('user_id').references(():AnyPgColumn => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
}, (address) => [
     uniqueIndex('unique_address')
            .on(address.addrresId, address.address).where(isNull(address.archivedAt))
]);