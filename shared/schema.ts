import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull().default(""),
  phone: text("phone").default(""),
  city: text("city").default(""),
  bio: text("bio").default(""),
  role: text("role").notNull().default("user"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("General"),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time").default(""),
  location: text("location").notNull(),
  category: text("category").notNull().default("General"),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  salary: text("salary").default(""),
  type: text("type").notNull().default("Full-time"),
  category: text("category").notNull().default("General"),
  description: text("description").notNull(),
  contactEmail: text("contact_email").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  location: text("location").notNull(),
  price: text("price").notNull(),
  availability: text("availability").notNull().default("Available"),
  description: text("description").notNull(),
  contactPhone: text("contact_phone").default(""),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const embassy = pgTable("embassy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").default(""),
  email: text("email").default(""),
  website: text("website").default(""),
  services: text("services").default(""),
  openingHours: text("opening_hours").default(""),
  mapUrl: text("map_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemType: text("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  phone: true,
  city: true,
  bio: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  category: true,
  imageUrl: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  time: true,
  location: true,
  category: true,
  imageUrl: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  location: true,
  salary: true,
  type: true,
  category: true,
  description: true,
  contactEmail: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  title: true,
  location: true,
  price: true,
  availability: true,
  description: true,
  contactPhone: true,
  imageUrl: true,
});

export const insertEmbassySchema = createInsertSchema(embassy).pick({
  name: true,
  address: true,
  phone: true,
  email: true,
  website: true,
  services: true,
  openingHours: true,
  mapUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type News = typeof news.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Embassy = typeof embassy.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
