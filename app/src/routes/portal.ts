import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const portalRouter = Router();

// ── Authenticated routes (agency users) ────────────────────

// POST /api/portal/invite
portalRouter.post("/invite", requireAuth, async (req, res) => {
  try {
    const { email, prospectId } = req.body;

    const invite = await prisma.portalInvite.create({
      data: {
        agencyId: req.auth!.agencyId,
        email,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 86400000), // 7 days
      },
    });

    // In production, send email with magic link here
    res.status(201).json({
      invite: { id: invite.id, email: invite.email, token: invite.token, expiresAt: invite.expiresAt },
    });
  } catch (err) {
    console.error("Create invite error:", err);
    res.status(500).json({ error: "Failed to create invite" });
  }
});

// GET /api/portal/invites
portalRouter.get("/invites", requireAuth, async (req, res) => {
  try {
    const invites = await prisma.portalInvite.findMany({
      where: { agencyId: req.auth!.agencyId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ invites });
  } catch (err) {
    console.error("List invites error:", err);
    res.status(500).json({ error: "Failed to list invites" });
  }
});

// POST /api/portal/submissions
portalRouter.post("/submissions", requireAuth, async (req, res) => {
  try {
    const { prospectId, type, title, body } = req.body;

    const submission = await prisma.submission.create({
      data: {
        agencyId: req.auth!.agencyId,
        prospectId,
        type,
        title,
        body,
      },
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("Create submission error:", err);
    res.status(500).json({ error: "Failed to create submission" });
  }
});

// GET /api/portal/submissions
portalRouter.get("/submissions", requireAuth, async (req, res) => {
  try {
    const prospectId = req.query.prospectId as string | undefined;
    const status = req.query.status as string | undefined;
    const where: any = { agencyId: req.auth!.agencyId };
    if (prospectId) where.prospectId = prospectId;
    if (status) where.status = status;

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { prospect: { select: { id: true, name: true } } },
    });

    res.json({ submissions });
  } catch (err) {
    console.error("List submissions error:", err);
    res.status(500).json({ error: "Failed to list submissions" });
  }
});

// PATCH /api/portal/submissions/:id
portalRouter.patch("/submissions/:id", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;

    const result = await prisma.submission.updateMany({
      where: { id, agencyId: req.auth!.agencyId },
      data: { status },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const updated = await prisma.submission.findUnique({ where: { id } });
    res.json(updated);
  } catch (err) {
    console.error("Update submission error:", err);
    res.status(500).json({ error: "Failed to update submission" });
  }
});

// ── Public portal routes (via magic link token) ────────────

// GET /api/portal/access/:token
portalRouter.get("/access/:token", async (req, res) => {
  try {
    const invite = await prisma.portalInvite.findUnique({
      where: { token: req.params.token },
    });

    if (!invite) {
      res.status(404).json({ error: "Invalid invite link" });
      return;
    }

    if (invite.expiresAt < new Date()) {
      res.status(410).json({ error: "Invite link expired" });
      return;
    }

    // Mark as used
    if (!invite.usedAt) {
      await prisma.portalInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });
    }

    res.json({ valid: true, agencyId: invite.agencyId, email: invite.email });
  } catch (err) {
    console.error("Access portal error:", err);
    res.status(500).json({ error: "Failed to access portal" });
  }
});

// GET /api/portal/view/:token/submissions
portalRouter.get("/view/:token/submissions", async (req, res) => {
  try {
    const invite = await prisma.portalInvite.findUnique({
      where: { token: req.params.token },
    });

    if (!invite || invite.expiresAt < new Date()) {
      res.status(403).json({ error: "Invalid or expired access" });
      return;
    }

    const submissions = await prisma.submission.findMany({
      where: { agencyId: invite.agencyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        status: true,
        feedback: true,
        feedbackAt: true,
        createdAt: true,
      },
    });

    res.json({ submissions });
  } catch (err) {
    console.error("View submissions error:", err);
    res.status(500).json({ error: "Failed to view submissions" });
  }
});

// POST /api/portal/view/:token/feedback/:submissionId
portalRouter.post("/view/:token/feedback/:submissionId", async (req, res) => {
  try {
    const invite = await prisma.portalInvite.findUnique({
      where: { token: req.params.token },
    });

    if (!invite || invite.expiresAt < new Date()) {
      res.status(403).json({ error: "Invalid or expired access" });
      return;
    }

    const { feedback } = req.body;

    const result = await prisma.submission.updateMany({
      where: { id: req.params.submissionId, agencyId: invite.agencyId },
      data: { feedback, feedbackAt: new Date(), status: "REVIEWED" },
    });

    if (result.count === 0) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json({ updated: true });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});
