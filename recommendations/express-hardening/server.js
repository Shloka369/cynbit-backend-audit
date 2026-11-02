import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const app = express();
app.disable("x-powered-by");
app.use((req, _res, next) => { req.id = randomUUID(); next(); });
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] } } }));
app.use(cors({ origin: ["https://cynbit.in"], methods: ["GET", "POST"] }));
app.use(express.json({ limit: "10kb" }));

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

app.post("/api/v1/contact", rateLimit({ windowMs: 60_000, max: 5 }), (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(422).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten(), requestId: req.id });
  // enqueue to a job queue / DB here
  res.status(202).json({ status: "received", requestId: req.id });
});

app.use((req, res) => res.status(404).json({ error: "NOT_FOUND", requestId: req.id }));
app.use((err, req, res, _next) => {
  console.error(req.id, err);
  res.status(err.status || 500).json({
    error: err.code || "INTERNAL_ERROR",
    message: err.expose ? err.message : "Something went wrong",
    requestId: req.id,
  });
});

app.listen(3000, () => console.log("listening on :3000"));
