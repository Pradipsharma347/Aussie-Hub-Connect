import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import {
  users, news, events, jobs, rooms, embassy, bookmarks,
  type User, type InsertUser, type News, type Event, type Job, type Room, type Embassy, type Bookmark
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const db = drizzle(process.env.DATABASE_URL);

export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllNews(): Promise<News[]> {
  return db.select().from(news).orderBy(desc(news.createdAt));
}

export async function getNewsById(id: string): Promise<News | undefined> {
  const [item] = await db.select().from(news).where(eq(news.id, id));
  return item;
}

export async function createNews(data: any): Promise<News> {
  const [item] = await db.insert(news).values(data).returning();
  return item;
}

export async function updateNews(id: string, data: any): Promise<News | undefined> {
  const [item] = await db.update(news).set(data).where(eq(news.id, id)).returning();
  return item;
}

export async function deleteNews(id: string): Promise<void> {
  await db.delete(news).where(eq(news.id, id));
}

export async function getAllEvents(): Promise<Event[]> {
  return db.select().from(events).orderBy(desc(events.createdAt));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const [item] = await db.select().from(events).where(eq(events.id, id));
  return item;
}

export async function createEvent(data: any): Promise<Event> {
  const [item] = await db.insert(events).values(data).returning();
  return item;
}

export async function updateEvent(id: string, data: any): Promise<Event | undefined> {
  const [item] = await db.update(events).set(data).where(eq(events.id, id)).returning();
  return item;
}

export async function deleteEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}

export async function getAllJobs(): Promise<Job[]> {
  return db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: string): Promise<Job | undefined> {
  const [item] = await db.select().from(jobs).where(eq(jobs.id, id));
  return item;
}

export async function createJob(data: any): Promise<Job> {
  const [item] = await db.insert(jobs).values(data).returning();
  return item;
}

export async function updateJob(id: string, data: any): Promise<Job | undefined> {
  const [item] = await db.update(jobs).set(data).where(eq(jobs.id, id)).returning();
  return item;
}

export async function deleteJob(id: string): Promise<void> {
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function getAllRooms(): Promise<Room[]> {
  return db.select().from(rooms).orderBy(desc(rooms.createdAt));
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  const [item] = await db.select().from(rooms).where(eq(rooms.id, id));
  return item;
}

export async function createRoom(data: any): Promise<Room> {
  const [item] = await db.insert(rooms).values(data).returning();
  return item;
}

export async function updateRoom(id: string, data: any): Promise<Room | undefined> {
  const [item] = await db.update(rooms).set(data).where(eq(rooms.id, id)).returning();
  return item;
}

export async function deleteRoom(id: string): Promise<void> {
  await db.delete(rooms).where(eq(rooms.id, id));
}

export async function getAllEmbassy(): Promise<Embassy[]> {
  return db.select().from(embassy).orderBy(desc(embassy.createdAt));
}

export async function getEmbassyById(id: string): Promise<Embassy | undefined> {
  const [item] = await db.select().from(embassy).where(eq(embassy.id, id));
  return item;
}

export async function createEmbassy(data: any): Promise<Embassy> {
  const [item] = await db.insert(embassy).values(data).returning();
  return item;
}

export async function updateEmbassy(id: string, data: any): Promise<Embassy | undefined> {
  const [item] = await db.update(embassy).set(data).where(eq(embassy.id, id)).returning();
  return item;
}

export async function deleteEmbassy(id: string): Promise<void> {
  await db.delete(embassy).where(eq(embassy.id, id));
}

export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  return db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
}

export async function addBookmark(userId: string, itemType: string, itemId: string): Promise<Bookmark> {
  const [item] = await db.insert(bookmarks).values({ userId, itemType, itemId }).returning();
  return item;
}

export async function removeBookmark(userId: string, itemType: string, itemId: string): Promise<void> {
  await db.delete(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.itemType, itemType), eq(bookmarks.itemId, itemId))
  );
}
