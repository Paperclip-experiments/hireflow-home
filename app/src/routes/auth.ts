import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { requireAuth, signToken } from "../middleware/auth";

export const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name, agencyName } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const agency = await prisma.agency.create({
      data: { name: agencyName },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
        agencyId: agency.id,
      },
    });

    const token = signToken({
      userId: user.id,
      agencyId: agency.id,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      agency: { id: agency.id, name: agency.name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { agency: true },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      agency: { id: user.agency.id, name: user.agency.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      include: { agency: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      agency: { id: user.agency.id, name: user.agency.name, plan: user.agency.plan },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/auth/invite
authRouter.post("/invite", requireAuth, async (req, res) => {
  try {
    if (req.auth!.role !== "ADMIN") {
      res.status(403).json({ error: "Only admins can invite users" });
      return;
    }

    const { email, name, role } = req.body;
    const passwordHash = await bcrypt.hash("changeme123", 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || "BD_REP",
        agencyId: req.auth!.agencyId,
      },
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to invite user" });
  }
});
