import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import session from "express-session";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import {
  insertUserSchema, loginSchema,
  insertNewsSchema, insertEventSchema, insertJobSchema,
  insertRoomSchema, insertEmbassySchema,
} from "@shared/schema";
import * as storage from "./storage";

const PgSession = connectPg(session);

function requireAuth(req: Request, res: Response, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "kaam-app-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      req.session.userId = user.id;
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user.isBlocked) {
        return res.status(403).json({ message: "Account is blocked" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { fullName, phone, city, bio, email } = req.body;
      const user = await storage.updateUser(req.session.userId!, { fullName, phone, city, bio, email });
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Update failed" });
    }
  });

  // NEWS
  app.get("/api/news", async (_req: Request, res: Response) => {
    const items = await storage.getAllNews();
    res.json(items);
  });

  app.get("/api/news/:id", async (req: Request, res: Response) => {
    const item = await storage.getNewsById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/news", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertNewsSchema.parse(req.body);
      const item = await storage.createNews(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/news/:id", requireAdmin, async (req: Request, res: Response) => {
    const item = await storage.updateNews(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/news/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteNews(req.params.id);
    res.json({ message: "Deleted" });
  });

  // EVENTS
  app.get("/api/events", async (_req: Request, res: Response) => {
    const items = await storage.getAllEvents();
    res.json(items);
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    const item = await storage.getEventById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/events", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const item = await storage.createEvent(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req: Request, res: Response) => {
    const item = await storage.updateEvent(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/events/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteEvent(req.params.id);
    res.json({ message: "Deleted" });
  });

  // JOBS
  app.get("/api/jobs", async (_req: Request, res: Response) => {
    const items = await storage.getAllJobs();
    res.json(items);
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    const item = await storage.getJobById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/jobs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertJobSchema.parse(req.body);
      const item = await storage.createJob(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/jobs/:id", requireAdmin, async (req: Request, res: Response) => {
    const item = await storage.updateJob(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/jobs/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteJob(req.params.id);
    res.json({ message: "Deleted" });
  });

  // ROOMS
  app.get("/api/rooms", async (_req: Request, res: Response) => {
    const items = await storage.getAllRooms();
    res.json(items);
  });

  app.get("/api/rooms/:id", async (req: Request, res: Response) => {
    const item = await storage.getRoomById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/rooms", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertRoomSchema.parse(req.body);
      const item = await storage.createRoom(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/rooms/:id", requireAdmin, async (req: Request, res: Response) => {
    const item = await storage.updateRoom(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/rooms/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteRoom(req.params.id);
    res.json({ message: "Deleted" });
  });

  // EMBASSY
  app.get("/api/embassy", async (_req: Request, res: Response) => {
    const items = await storage.getAllEmbassy();
    res.json(items);
  });

  app.get("/api/embassy/:id", async (req: Request, res: Response) => {
    const item = await storage.getEmbassyById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post("/api/embassy", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = insertEmbassySchema.parse(req.body);
      const item = await storage.createEmbassy(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/embassy/:id", requireAdmin, async (req: Request, res: Response) => {
    const item = await storage.updateEmbassy(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/embassy/:id", requireAdmin, async (req: Request, res: Response) => {
    await storage.deleteEmbassy(req.params.id);
    res.json({ message: "Deleted" });
  });

  // BOOKMARKS
  app.get("/api/bookmarks", requireAuth, async (req: Request, res: Response) => {
    const items = await storage.getUserBookmarks(req.session.userId!);
    res.json(items);
  });

  app.post("/api/bookmarks", requireAuth, async (req: Request, res: Response) => {
    const { itemType, itemId } = req.body;
    const item = await storage.addBookmark(req.session.userId!, itemType, itemId);
    res.json(item);
  });

  app.delete("/api/bookmarks", requireAuth, async (req: Request, res: Response) => {
    const { itemType, itemId } = req.body;
    await storage.removeBookmark(req.session.userId!, itemType, itemId);
    res.json({ message: "Removed" });
  });

  // ADMIN - users
  app.get("/api/admin/users", requireAdmin, async (_req: Request, res: Response) => {
    const allUsers = await storage.getAllUsers();
    const safeUsers = allUsers.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.put("/api/admin/users/:id/block", requireAdmin, async (req: Request, res: Response) => {
    const user = await storage.updateUser(req.params.id, { isBlocked: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/admin/users/:id/unblock", requireAdmin, async (req: Request, res: Response) => {
    const user = await storage.updateUser(req.params.id, { isBlocked: false });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/admin/users/:id/role", requireAdmin, async (req: Request, res: Response) => {
    const { role } = req.body;
    const user = await storage.updateUser(req.params.id, { role });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // ADMIN DASHBOARD STATS
  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response) => {
    const allUsers = await storage.getAllUsers();
    const allNews = await storage.getAllNews();
    const allEvents = await storage.getAllEvents();
    const allJobs = await storage.getAllJobs();
    const allRooms = await storage.getAllRooms();
    res.json({
      totalUsers: allUsers.length,
      totalNews: allNews.length,
      totalEvents: allEvents.length,
      totalJobs: allJobs.length,
      totalRooms: allRooms.length,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
