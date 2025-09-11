import {  pgEnum,  } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role_type', ['admin', 'sub-admin', 'user']);
