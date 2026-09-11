import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { Orchestrator } from "./orchestrator.js";
import connectDB from "./config/db.js";

import loginSignupRouter from "./loginSignup.js";
import getAddHistoryRouter from './userHistory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RUNS_DIR = path.join(ROOT, "runs");

await fs.mkdir(RUNS_DIR, { recursive: true });

const app = express();

await connectDB();

app.use(cors());

app.use(
  express.json({
    limit: "2mb",
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.use("/api/auth", loginSignupRouter);
app.use("/api/userHistory", getAddHistoryRouter );
const upload = multer({
  dest: path.join(RUNS_DIR, "uploads"),
});

const createRunSchema = z.object({
  url: z.string().url(),

  intent: z.string().max(2000).optional(),

  headless: z.boolean().optional(),

  maxPages: z.number().int().min(1).max(50).optional(),
});

const runs = new Map();

const orchestrator = new Orchestrator({
  rootDir: RUNS_DIR,
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "autonomous-test-orchestrator",
  });
});

app.post("/api/test-runs", async (req, res) => {
  const parsed = createRunSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  const id = uuid();

  const run = {
    id,

    status: "queued",

    createdAt: new Date().toISOString(),

    input: parsed.data,

    events: [],
  };

  runs.set(id, run);

  orchestrator
    .execute({
      runId: id,

      ...parsed.data,

      onEvent: (event) => {
        run.events.push({
          ...event,

          timestamp: new Date().toISOString(),
        });

        run.status = event.status || run.status;
      },
    })

    .then((result) => {
      run.status = result.status;

      run.result = result;

      run.completedAt = new Date().toISOString();
    })

    .catch((error) => {
      console.error("Test run failed:", error);

      run.status = "failed";

      run.error = error.message;

      run.completedAt = new Date().toISOString();
    });

  return res.status(202).json({
    runId: id,

    status: "queued",

    statusEndpoint: `/api/test-runs/${id}`,
  });
});

app.post(
  "/api/test-runs/:id/prd",
  upload.single("prd"),
  async (req, res) => {
    const run = runs.get(req.params.id);

    if (!run) {
      return res.status(404).json({
        error: "Run not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error:
          'Upload a PRD as multipart/form-data field "prd"',
      });
    }

    const content = await fs
      .readFile(req.file.path, "utf8")
      .catch(() => "");

    run.prd = {
      originalName: req.file.originalname,

      content: content.slice(0, 50000),
    };

    await fs.unlink(req.file.path).catch(() => {});

    return res.json({
      runId: run.id,

      prdAttached: true,
    });
  }
);

app.get("/api/test-runs/:id", (req, res) => {
  const run = runs.get(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "Run not found",
    });
  }

  return res.json(run);
});

app.get("/api/test-runs/:id/report", (req, res) => {
  const run = runs.get(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "Run not found",
    });
  }

  if (!run.result?.report) {
    return res.status(409).json({
      error: "Report not ready",

      status: run.status,
    });
  }

  return res.json(run.result.report);
});

app.get("/api/test-runs/:id/tests", (req, res) => {
  const run = runs.get(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "Run not found",
    });
  }

  return res.json({
    runId: run.id,

    tests: run.result?.tests ?? [],
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error",

    message: err.message,
  });
});

const port = Number(process.env.PORT || 5000);

app.listen(port, "0.0.0.0", () => {
  console.log(
    `Autonomous Test Orchestrator API listening on port ${port}`
  );
});