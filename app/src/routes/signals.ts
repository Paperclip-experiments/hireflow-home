import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const signalsRouter = Router();
signalsRouter.use(requireAuth);

// ── Signal Sources ─────────────────────────────────────────

// GET /api/signals/sources
signalsRouter.get("/sources", async (req, res) => {
  try {
    const sources = await prisma.signalSource.findMany({
      where: { agencyId: req.auth!.agencyId },
      include: { _count: { select: { signals: true, scanRuns: true } } },
    });
    res.json({ sources });
  } catch (err) {
    console.error("List sources error:", err);
    res.status(500).json({ error: "Failed to list sources" });
  }
});

// POST /api/signals/sources
signalsRouter.post("/sources", async (req, res) => {
  try {
    const { name, type, config } = req.body;
    const source = await prisma.signalSource.create({
      data: { agencyId: req.auth!.agencyId, name, type, config },
    });
    res.status(201).json(source);
  } catch (err) {
    console.error("Create source error:", err);
    res.status(500).json({ error: "Failed to create source" });
  }
});

// PATCH /api/signals/sources/:id
signalsRouter.patch("/sources/:id", async (req, res) => {
  try {
    const { name, config, active } = req.body;
    const result = await prisma.signalSource.updateMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      data: {
        ...(name !== undefined && { name }),
        ...(config !== undefined && { config }),
        ...(active !== undefined && { active }),
      },
    });
    if (result.count === 0) {
      res.status(404).json({ error: "Source not found" });
      return;
    }
    const updated = await prisma.signalSource.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    console.error("Update source error:", err);
    res.status(500).json({ error: "Failed to update source" });
  }
});

// DELETE /api/signals/sources/:id
signalsRouter.delete("/sources/:id", async (req, res) => {
  try {
    const deleted = await prisma.signalSource.deleteMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
    });
    if (deleted.count === 0) {
      res.status(404).json({ error: "Source not found" });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete source error:", err);
    res.status(500).json({ error: "Failed to delete source" });
  }
});

// ── Signals ────────────────────────────────────────────────

// GET /api/signals
signalsRouter.get("/", async (req, res) => {
  try {
    const { prospectId, sourceId, type, limit } = req.query;

    const where: any = { agencyId: req.auth!.agencyId };
    if (prospectId) where.prospectId = prospectId;
    if (sourceId) where.sourceId = sourceId;
    if (type) where.type = type;

    const signals = await prisma.signal.findMany({
      where,
      orderBy: { detectedAt: "desc" },
      take: Math.min(parseInt(String(limit || "50")), 200),
      include: {
        prospect: { select: { id: true, name: true } },
        source: { select: { id: true, name: true, type: true } },
      },
    });

    res.json({ signals });
  } catch (err) {
    console.error("List signals error:", err);
    res.status(500).json({ error: "Failed to list signals" });
  }
});

// POST /api/signals
signalsRouter.post("/", async (req, res) => {
  try {
    const { prospectId, sourceId, type, title, detail, strength, rawData } = req.body;

    const signal = await prisma.signal.create({
      data: {
        agencyId: req.auth!.agencyId,
        prospectId,
        sourceId,
        type,
        title,
        detail,
        strength: strength || 0.5,
        rawData,
      },
    });

    res.status(201).json(signal);
  } catch (err) {
    console.error("Create signal error:", err);
    res.status(500).json({ error: "Failed to create signal" });
  }
});

// POST /api/signals/batch-import
signalsRouter.post("/batch-import", async (req, res) => {
  try {
    const { signals } = req.body;
    if (!Array.isArray(signals)) {
      res.status(400).json({ error: "signals must be an array" });
      return;
    }

    const created = await prisma.signal.createMany({
      data: signals.map((s: any) => ({
        agencyId: req.auth!.agencyId,
        prospectId: s.prospectId,
        sourceId: s.sourceId,
        type: s.type,
        title: s.title,
        detail: s.detail,
        strength: s.strength || 0.5,
        rawData: s.rawData,
      })),
    });

    res.status(201).json({ imported: created.count });
  } catch (err) {
    console.error("Batch import signals error:", err);
    res.status(500).json({ error: "Failed to import signals" });
  }
});

// ── Scoring ────────────────────────────────────────────────

const SIGNAL_WEIGHTS: Record<string, number> = {
  JOB_POSTING: 10,
  FUNDING_ROUND: 25,
  EXPANSION: 20,
  LEADERSHIP_HIRE: 15,
  LAYOFF_RECOVERY: 12,
  CONTRACT_WIN: 18,
};

// POST /api/signals/rescore/:prospectId
signalsRouter.post("/rescore/:prospectId", async (req, res) => {
  try {
    const signals = await prisma.signal.findMany({
      where: { prospectId: req.params.prospectId, agencyId: req.auth!.agencyId },
    });

    const now = Date.now();
    let score = 0;
    for (const s of signals) {
      const weight = SIGNAL_WEIGHTS[s.type] || 10;
      const ageMs = now - s.detectedAt.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recencyDecay = Math.max(0, 1 - ageDays / 90);
      score += weight * s.strength * recencyDecay;
    }

    score = Math.min(100, Math.round(score * 10) / 10);

    await prisma.prospect.updateMany({
      where: { id: req.params.prospectId, agencyId: req.auth!.agencyId },
      data: { score },
    });

    res.json({ prospectId: req.params.prospectId, score, signalCount: signals.length });
  } catch (err) {
    console.error("Rescore error:", err);
    res.status(500).json({ error: "Failed to rescore prospect" });
  }
});

// ── Scan Runs ──────────────────────────────────────────────

// GET /api/signals/scans
signalsRouter.get("/scans", async (req, res) => {
  try {
    const scans = await prisma.scanRun.findMany({
      where: { agencyId: req.auth!.agencyId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { source: { select: { id: true, name: true, type: true } } },
    });
    res.json({ scans });
  } catch (err) {
    console.error("List scans error:", err);
    res.status(500).json({ error: "Failed to list scans" });
  }
});

// POST /api/signals/scans
signalsRouter.post("/scans", async (req, res) => {
  try {
    const { sourceId } = req.body;

    const scan = await prisma.scanRun.create({
      data: {
        agencyId: req.auth!.agencyId,
        sourceId,
        status: "PENDING",
      },
    });

    // In a real system, this would queue a background job.
    // For MVP, we mark it completed immediately.
    await prisma.scanRun.update({
      where: { id: scan.id },
      data: { status: "COMPLETED", startedAt: new Date(), finishedAt: new Date() },
    });

    res.status(201).json({ ...scan, status: "COMPLETED" });
  } catch (err) {
    console.error("Create scan error:", err);
    res.status(500).json({ error: "Failed to create scan" });
  }
});

// ── Stats ──────────────────────────────────────────────────

// GET /api/signals/stats
signalsRouter.get("/stats", async (req, res) => {
  try {
    const agencyId = req.auth!.agencyId;

    const [totalSignals, totalSources, totalScans, byType] = await Promise.all([
      prisma.signal.count({ where: { agencyId } }),
      prisma.signalSource.count({ where: { agencyId, active: true } }),
      prisma.scanRun.count({ where: { agencyId } }),
      prisma.signal.groupBy({
        by: ["type"],
        where: { agencyId },
        _count: true,
      }),
    ]);

    res.json({
      totalSignals,
      totalSources,
      totalScans,
      byType: byType.map((g) => ({ type: g.type, count: g._count })),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});
