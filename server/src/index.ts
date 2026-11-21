import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { TriageController } from './controllers/TriageController';
import { ModelClient } from './services/ModelClient';
import { PromptBuilder } from './services/PromptBuilder';
import { ResponseValidator } from './services/ResponseValidator';

const validator = new ResponseValidator();
const controller = new TriageController(new PromptBuilder(), new ModelClient(), validator);

const app = express();
app.disable('x-powered-by');

app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json({ limit: '6mb' }));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 20, // requests per minute per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a minute.' },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/triage', controller.handleTriage);

// Last resort (bad JSON, body too large, anything unexpected): safe advice, never a stack trace.
app.use((_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.warn('[server] request failed; returning fallback');
  if (res.headersSent) return;
  res.status(200).json(validator.fallback());
});

app.listen(config.port, () => {
  console.log(`[server] MediGo triage proxy on http://localhost:${config.port} (model: ${config.model}, images: ${config.enableImages ? 'on' : 'off'})`);
});
