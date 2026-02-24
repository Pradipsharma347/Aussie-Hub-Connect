import bcrypt from "bcryptjs";
import { db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
  const [existing] = await db.select().from(users).where(eq(users.username, "admin"));
  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      username: "admin",
      email: "admin@kaamapp.com",
      password: hashedPassword,
      fullName: "Kaam Admin",
      role: "admin",
      city: "Sydney",
    });
    console.log("Admin user seeded: username=admin, password=admin123");
  }
}
