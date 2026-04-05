import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { prospectsRouter } from "./routes/prospects";
import { dealsRouter } from "./routes/deals";
import { signalsRouter } from "./routes/signals";
import { sequencesRouter } from "./routes/sequences";
import { portalRouter } from "./routes/portal";
import { errorHandler } from "./middleware/error";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "hireflow-api", version: "0.1.0" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/prospects", prospectsRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/signals", signalsRouter);
app.use("/api/sequences", sequencesRouter);
app.use("/api/portal", portalRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HireFlow API running on port ${PORT}`);
});

export default app;
