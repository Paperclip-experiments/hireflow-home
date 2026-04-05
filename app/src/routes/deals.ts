import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const dealsRouter = Router();
dealsRouter.use(requireAuth);

// GET /api/deals
dealsRouter.get("/", async (req, res) => {
  try {
    const { stage, ownerId } = req.query;

    const where: any = { agencyId: req.auth!.agencyId };
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        prospect: { select: { id: true, name: true, industry: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    res.json({ deals });
  } catch (err) {
    console.error("List deals error:", err);
    res.status(500).json({ error: "Failed to list deals" });
  }
});

// GET /api/deals/pipeline
dealsRouter.get("/pipeline", async (req, res) => {
  try {
    const stages = ["PROSPECT", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"];
    const pipeline: Record<string, any[]> = {};

    for (const stage of stages) {
      pipeline[stage] = await prisma.deal.findMany({
        where: { agencyId: req.auth!.agencyId, stage: stage as any },
        orderBy: { updatedAt: "desc" },
        include: {
          prospect: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true } },
        },
      });
    }

    const forecast = await prisma.deal.aggregate({
      where: {
        agencyId: req.auth!.agencyId,
        stage: { notIn: ["WON", "LOST"] },
      },
      _sum: { value: true },
      _avg: { probability: true },
    });

    res.json({ pipeline, forecast });
  } catch (err) {
    console.error("Pipeline error:", err);
    res.status(500).json({ error: "Failed to get pipeline" });
  }
});

// GET /api/deals/:id
dealsRouter.get("/:id", async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      include: {
        prospect: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!deal) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }

    res.json(deal);
  } catch (err) {
    console.error("Get deal error:", err);
    res.status(500).json({ error: "Failed to get deal" });
  }
});

// POST /api/deals
dealsRouter.post("/", async (req, res) => {
  try {
    const { prospectId, title, value, probability, stage, nextAction, nextActionAt, notes } = req.body;

    const deal = await prisma.deal.create({
      data: {
        agencyId: req.auth!.agencyId,
        prospectId,
        ownerId: req.auth!.userId,
        title,
        value: value || 0,
        probability: probability || 0,
        stage: stage || "PROSPECT",
        nextAction,
        nextActionAt: nextActionAt ? new Date(nextActionAt) : undefined,
        notes,
      },
      include: {
        prospect: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(deal);
  } catch (err) {
    console.error("Create deal error:", err);
    res.status(500).json({ error: "Failed to create deal" });
  }
});

// PATCH /api/deals/:id
dealsRouter.patch("/:id", async (req, res) => {
  try {
    const { stage, title, value, probability, nextAction, nextActionAt, notes, lostReason } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (value !== undefined) data.value = value;
    if (probability !== undefined) data.probability = probability;
    if (nextAction !== undefined) data.nextAction = nextAction;
    if (nextActionAt !== undefined) data.nextActionAt = new Date(nextActionAt);
    if (notes !== undefined) data.notes = notes;
    if (stage !== undefined) {
      data.stage = stage;
      if (stage === "WON") data.wonAt = new Date();
      if (stage === "LOST") {
        data.lostAt = new Date();
        data.lostReason = lostReason || null;
      }
    }

    const result = await prisma.deal.updateMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      data,
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }

    const updated = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        prospect: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Update deal error:", err);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

// DELETE /api/deals/:id
dealsRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.deal.deleteMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete deal error:", err);
    res.status(500).json({ error: "Failed to delete deal" });
  }
});
