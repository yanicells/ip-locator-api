import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const history = pgTable(
  "history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ip: varchar("ip", { length: 45 }).notNull(),
    city: varchar("city", { length: 255 }),
    region: varchar("region", { length: 255 }),
    country: varchar("country", { length: 255 }),
    loc: varchar("loc", { length: 100 }),
    hostname: varchar("hostname", { length: 255 }),
    org: varchar("org", { length: 255 }),
    postal: varchar("postal", { length: 20 }),
    timezone: varchar("timezone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("idx_user_created").on(table.userId, table.createdAt),
    uniqueUserIp: unique("unique_user_ip").on(table.userId, table.ip),
  })
);
