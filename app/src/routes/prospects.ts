import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const prospectsRouter = Router();
prospectsRouter.use(requireAuth);

// GET /api/prospects
prospectsRouter.get("/", async (req, res) => {
  try {
    const { status, industry, minScore, sortBy, order, limit, offset } = req.query;

    const where: any = { agencyId: req.auth!.agencyId };
    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (minScore) where.score = { gte: parseFloat(minScore as string) };

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: { [String(sortBy || "score")]: order === "asc" ? "asc" : "desc" },
      take: Math.min(parseInt(String(limit || "50")), 100),
      skip: parseInt(String(offset || "0")),
      include: { _count: { select: { signals: true, deals: true } } },
    });

    const total = await prisma.prospect.count({ where });

    res.json({ prospects, total });
  } catch (err) {
    console.error("List prospects error:", err);
    res.status(500).json({ error: "Failed to list prospects" });
  }
});

// GET /api/prospects/:id
prospectsRouter.get("/:id", async (req, res) => {
  try {
    const prospect = await prisma.prospect.findFirst({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      include: {
        signals: { orderBy: { detectedAt: "desc" }, take: 20 },
        deals: { orderBy: { updatedAt: "desc" } },
      },
    });

    if (!prospect) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    res.json(prospect);
  } catch (err) {
    console.error("Get prospect error:", err);
    res.status(500).json({ error: "Failed to get prospect" });
  }
});

// POST /api/prospects
prospectsRouter.post("/", async (req, res) => {
  try {
    const { name, domain, industry, size, location, website, contactName, contactEmail, contactTitle, contactPhone, notes } = req.body;

    const prospect = await prisma.prospect.create({
      data: {
        agencyId: req.auth!.agencyId,
        name,
        domain,
        industry,
        size,
        location,
        website,
        contactName,
        contactEmail,
        contactTitle,
        contactPhone,
        notes,
      },
    });

    res.status(201).json(prospect);
  } catch (err) {
    console.error("Create prospect error:", err);
    res.status(500).json({ error: "Failed to create prospect" });
  }
});

// PATCH /api/prospects/:id
prospectsRouter.patch("/:id", async (req, res) => {
  try {
    const { name, domain, industry, size, location, website, status, contactName, contactEmail, contactTitle, contactPhone, notes } = req.body;

    const prospect = await prisma.prospect.updateMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      data: {
        ...(name !== undefined && { name }),
        ...(domain !== undefined && { domain }),
        ...(industry !== undefined && { industry }),
        ...(size !== undefined && { size }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(status !== undefined && { status }),
        ...(contactName !== undefined && { contactName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactTitle !== undefined && { contactTitle }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(notes !== undefined && { notes }),
      },
    });

    if (prospect.count === 0) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    const updated = await prisma.prospect.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    console.error("Update prospect error:", err);
    res.status(500).json({ error: "Failed to update prospect" });
  }
});

// DELETE /api/prospects/:id
prospectsRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.prospect.deleteMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Prospect not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete prospect error:", err);
    res.status(500).json({ error: "Failed to delete prospect" });
  }
});

// POST /api/prospects/batch-import
prospectsRouter.post("/batch-import", async (req, res) => {
  try {
    const { prospects } = req.body;
    if (!Array.isArray(prospects)) {
      res.status(400).json({ error: "prospects must be an array" });
      return;
    }

    const created = await prisma.prospect.createMany({
      data: prospects.map((p: any) => ({
        agencyId: req.auth!.agencyId,
        name: p.name,
        domain: p.domain,
        industry: p.industry,
        size: p.size,
        location: p.location,
        website: p.website,
        contactName: p.contactName,
        contactEmail: p.contactEmail,
        contactTitle: p.contactTitle,
        contactPhone: p.contactPhone,
        notes: p.notes,
      })),
    });

    res.status(201).json({ imported: created.count });
  } catch (err) {
    console.error("Batch import error:", err);
    res.status(500).json({ error: "Failed to import prospects" });
  }
});
