import { createHash, timingSafeEqual } from "node:crypto";
import { start } from "workflow/api";
import { recordWorkflowRun } from "@/lib/airtable-sync";
import { airtableSyncWorkflow } from "@/workflows/airtable-sync";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function secretMatches(value: string | null, expectedHash: string) {
  if (!value) return false;
  const received = createHash("sha256").update(value).digest();
  const configured = Buffer.from(expectedHash, "hex");
  return received.length === configured.length && timingSafeEqual(received, configured);
}

export async function POST(request: Request) {
  const webhookSecretHash = process.env.AIRTABLE_SYNC_WEBHOOK_SECRET_HASH;
  if (!webhookSecretHash) return Response.json({ error: "Airtable sync webhook is not configured." }, { status: 503 });
  if (!secretMatches(request.headers.get("x-solas-airtable-sync-secret"), webhookSecretHash)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { type?: unknown; table?: unknown; schema?: unknown; record?: { id?: unknown } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const eventId = body.record?.id;
  if (body.type !== "INSERT" || body.table !== "airtable_sync_events" || body.schema !== "public" || typeof eventId !== "string" || !uuidPattern.test(eventId)) {
    return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  try {
    const run = await start(airtableSyncWorkflow, [{ eventId }]);
    await recordWorkflowRun(eventId, run.runId);
    return Response.json({ accepted: true, runId: run.runId }, { status: 202 });
  } catch {
    return Response.json({ error: "Airtable sync could not be started." }, { status: 503 });
  }
}
