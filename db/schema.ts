import {
  boolean,
  bytea,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id_user: serial("id_user").primaryKey(),
  username: varchar("username", { length: 51 }).notNull().unique(),
  email: varchar("email", { length: 101 }).notNull(),
  fullname: varchar("fullname", { length: 101 }).notNull(),
  password: varchar("password", { length: 101 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const categoryNews = pgTable("category_news", {
  id_category_news: serial("id_category_news").primaryKey(),
  category: varchar("category", { length: 101 }).notNull(),
  description: varchar("description", { length: 255 }),
  img: bytea("img"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  id_news: serial("id_news").primaryKey(),
  id_category_news: integer("id_category_news")
    .notNull()
    .references(() => categoryNews.id_category_news, { onDelete: "cascade" }),
  img: bytea("img"),
  title: varchar("title", { length: 201 }).notNull(),
  excerpt: varchar("excerpt", { length: 350 }),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  views: integer("views").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CategoryNews = typeof categoryNews.$inferSelect;
export type NewsItem = typeof news.$inferSelect;
