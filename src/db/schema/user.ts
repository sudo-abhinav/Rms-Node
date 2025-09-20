import { isNull } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").default("user"),
    adminApproved: boolean("admin_approved").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (users) => [
    uniqueIndex("user_idx").on(users.email).where(isNull(users.archivedAt)),
  ]
);
