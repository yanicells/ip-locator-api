import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const DEFAULT_USER = {
  email: "admin@example.com",
  password: "password123",
  name: "Admin User",
};

async function seed() {
  try {
    console.log("Starting seed...");

    const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, DEFAULT_USER.email));

    if (existingUser.length > 0) {
      console.log(`User ${DEFAULT_USER.email} already exists. Skipping seed.`);
      return;
    }

    await db.insert(users).values({
      email: DEFAULT_USER.email,
      password: hashedPassword,
      name: DEFAULT_USER.name,
    });

    console.log(
      `Seed completed successfully. User created: ${DEFAULT_USER.email}`
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
