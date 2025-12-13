import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { db } from "./db/index.js";
import { users, history } from "./db/schema.js";

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }
    req.user = user;
    next();
  });
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

app.post("/api/signup", async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.errors });
      return;
    }

    const { name, email, password } = parsed.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    const user = result[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.errors });
      return;
    }

    const { email, password } = parsed.data;
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const historyRecords = await db
      .select({
        id: history.id,
        ip: history.ip,
        city: history.city,
        region: history.region,
        country: history.country,
        loc: history.loc,
        hostname: history.hostname,
        org: history.org,
        postal: history.postal,
        timezone: history.timezone,
        createdAt: history.createdAt,
      })
      .from(history)
      .where(eq(history.userId, userId))
      .orderBy(desc(history.createdAt))
      .limit(limit);

    res.json({
      history: historyRecords.map((record) => ({
        id: record.id,
        ip: record.ip,
        city: record.city,
        region: record.region,
        country: record.country,
        loc: record.loc,
        hostname: record.hostname,
        org: record.org,
        postal: record.postal,
        timezone: record.timezone,
        created_at: record.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
});

const historySchema = z.object({
  ip: z.string().min(1, "IP is required"),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  loc: z.string().optional(),
  hostname: z.string().optional(),
  org: z.string().optional(),
  postal: z.string().optional(),
  timezone: z.string().optional(),
});

app.post("/api/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = historySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid IP address format",
      });
      return;
    }

    const data = parsed.data;

    const existingRecord = await db
      .select()
      .from(history)
      .where(and(eq(history.userId, userId), eq(history.ip, data.ip)))
      .limit(1);

    let record;

    if (existingRecord.length > 0) {
      const updated = await db
        .update(history)
        .set({ createdAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(history.id, existingRecord[0].id))
        .returning();
      record = updated[0];
    } else {
      const inserted = await db
        .insert(history)
        .values({
          userId,
          ip: data.ip,
          city: data.city || null,
          region: data.region || null,
          country: data.country || null,
          loc: data.loc || null,
          hostname: data.hostname || null,
          org: data.org || null,
          postal: data.postal || null,
          timezone: data.timezone || null,
        })
        .returning();
      record = inserted[0];

      const allRecords = await db
        .select({ id: history.id })
        .from(history)
        .where(eq(history.userId, userId))
        .orderBy(desc(history.createdAt));

      if (allRecords.length > 10) {
        const idsToDelete = allRecords.slice(10).map((r) => r.id);
        await db.delete(history).where(inArray(history.id, idsToDelete));
      }
    }

    res.status(201).json({
      id: record.id,
      ip: record.ip,
      city: record.city,
      region: record.region,
      country: record.country,
      loc: record.loc,
      hostname: record.hostname,
      org: record.org,
      postal: record.postal,
      timezone: record.timezone,
      created_at: record.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Add history error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
});

const deleteHistorySchema = z.object({
  ips: z.array(z.string()).min(1, "At least one IP is required"),
});

app.delete("/api/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = deleteHistorySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid request body",
      });
      return;
    }

    const { ips } = parsed.data;

    await db
      .delete(history)
      .where(and(eq(history.userId, userId), inArray(history.ip, ips)));

    res.status(204).send();
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
});

app.delete("/api/history/all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.delete(history).where(eq(history.userId, userId));

    res.status(204).send();
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
