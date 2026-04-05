import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const sequencesRouter = Router();
sequencesRouter.use(requireAuth);

// ── Sequences ──────────────────────────────────────────────

// GET /api/sequences
sequencesRouter.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const where: any = { agencyId: req.auth!.agencyId };
    if (status) where.status = status;

    const sequences = await prisma.sequence.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    });

    res.json({ sequences });
  } catch (err) {
    console.error("List sequences error:", err);
    res.status(500).json({ error: "Failed to list sequences" });
  }
});

// GET /api/sequences/:id
sequencesRouter.get("/:id", async (req, res) => {
  try {
    const sequence = await prisma.sequence.findFirst({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      include: {
        enrollments: {
          include: {
            prospect: { select: { id: true, name: true, contactEmail: true } },
            enrolledBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!sequence) {
      res.status(404).json({ error: "Sequence not found" });
      return;
    }

    res.json(sequence);
  } catch (err) {
    console.error("Get sequence error:", err);
    res.status(500).json({ error: "Failed to get sequence" });
  }
});

// POST /api/sequences
sequencesRouter.post("/", async (req, res) => {
  try {
    const { name, steps } = req.body;

    const sequence = await prisma.sequence.create({
      data: {
        agencyId: req.auth!.agencyId,
        name,
        steps: steps || [],
      },
    });

    res.status(201).json(sequence);
  } catch (err) {
    console.error("Create sequence error:", err);
    res.status(500).json({ error: "Failed to create sequence" });
  }
});

// PATCH /api/sequences/:id
sequencesRouter.patch("/:id", async (req, res) => {
  try {
    const { name, steps, status } = req.body;

    const result = await prisma.sequence.updateMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
      data: {
        ...(name !== undefined && { name }),
        ...(steps !== undefined && { steps }),
        ...(status !== undefined && { status }),
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Sequence not found" });
      return;
    }

    const updated = await prisma.sequence.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    console.error("Update sequence error:", err);
    res.status(500).json({ error: "Failed to update sequence" });
  }
});

// DELETE /api/sequences/:id
sequencesRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.sequence.deleteMany({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Sequence not found" });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("Delete sequence error:", err);
    res.status(500).json({ error: "Failed to delete sequence" });
  }
});

// ── Enrollments ────────────────────────────────────────────

// POST /api/sequences/:id/enroll
sequencesRouter.post("/:id/enroll", async (req, res) => {
  try {
    const { prospectId } = req.body;

    const sequence = await prisma.sequence.findFirst({
      where: { id: req.params.id, agencyId: req.auth!.agencyId },
    });
    if (!sequence) {
      res.status(404).json({ error: "Sequence not found" });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        sequenceId: req.params.id,
        prospectId,
        enrolledById: req.auth!.userId,
        nextSendAt: new Date(),
      },
    });

    res.status(201).json(enrollment);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Prospect already enrolled in this sequence" });
      return;
    }
    console.error("Enroll error:", err);
    res.status(500).json({ error: "Failed to enroll prospect" });
  }
});

// POST /api/sequences/:id/advance/:enrollmentId
sequencesRouter.post("/:id/advance/:enrollmentId", async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: req.params.enrollmentId, sequenceId: req.params.id },
      include: { sequence: true, prospect: true },
    });

    if (!enrollment) {
      res.status(404).json({ error: "Enrollment not found" });
      return;
    }

    const steps = enrollment.sequence.steps as any[];
    const nextStep = enrollment.currentStep + 1;

    if (nextStep >= steps.length) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", lastSentAt: new Date() },
      });
      res.json({ status: "COMPLETED", message: "Sequence finished" });
      return;
    }

    const delayDays = steps[nextStep]?.delayDays || 1;
    const nextSendAt = new Date(Date.now() + delayDays * 86400000);

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        currentStep: nextStep,
        lastSentAt: new Date(),
        nextSendAt,
      },
    });

    // Render template
    const step = steps[nextStep];
    const rendered = {
      subject: renderTemplate(step.subject, enrollment.prospect),
      body: renderTemplate(step.body, enrollment.prospect),
    };

    res.json({ step: nextStep, rendered, nextSendAt });
  } catch (err) {
    console.error("Advance error:", err);
    res.status(500).json({ error: "Failed to advance enrollment" });
  }
});

// PATCH /api/sequences/:id/enrollments/:enrollmentId
sequencesRouter.patch("/:id/enrollments/:enrollmentId", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error("Update enrollment error:", err);
    res.status(500).json({ error: "Failed to update enrollment" });
  }
});

// GET /api/sequences/stats
sequencesRouter.get("/stats/overview", async (req, res) => {
  try {
    const agencyId = req.auth!.agencyId;

    // Get sequences owned by this agency
    const sequences = await prisma.sequence.findMany({
      where: { agencyId },
      select: { id: true },
    });
    const sequenceIds = sequences.map((s) => s.id);

    const [totalEnrollments, byStatus] = await Promise.all([
      prisma.enrollment.count({ where: { sequenceId: { in: sequenceIds } } }),
      prisma.enrollment.groupBy({
        by: ["status"],
        where: { sequenceId: { in: sequenceIds } },
        _count: true,
      }),
    ]);

    res.json({
      totalSequences: sequences.length,
      totalEnrollments,
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count })),
    });
  } catch (err) {
    console.error("Sequence stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

function renderTemplate(template: string, prospect: any): string {
  if (!template) return "";
  return template
    .replace(/\{\{name\}\}/g, prospect.name || "")
    .replace(/\{\{contactName\}\}/g, prospect.contactName || "there")
    .replace(/\{\{contactEmail\}\}/g, prospect.contactEmail || "")
    .replace(/\{\{industry\}\}/g, prospect.industry || "your industry")
    .replace(/\{\{location\}\}/g, prospect.location || "your area");
}
