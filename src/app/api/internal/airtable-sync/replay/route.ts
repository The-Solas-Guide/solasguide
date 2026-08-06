import { start } from "workflow/api";
import { getAirtableSyncEvent, recordWorkflowRun, resetAirtableSyncEvent } from "@/lib/airtable-sync";
import { airtableSyncWorkflow } from "@/workflows/airtable-sync";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const replaySecret = process.env.AIRTABLE_SYNC_REPLAY_SECRET;
  if (!replaySecret) return Response.json({ error: "Airtable sync recovery is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${replaySecret}`) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let eventId: unknown;
  try {
    eventId = (await request.json()).eventId;
  } catch {
    return Response.json({ error: "Invalid replay request." }, { status: 400 });
  }
  if (typeof eventId !== "string" || !uuidPattern.test(eventId)) return Response.json({ error: "Invalid replay request." }, { status: 400 });

  try {
    const event = await getAirtableSyncEvent(eventId);
    const staleProcessing = event?.status === "processing" && event.started_at && Date.now() - Date.parse(event.started_at) > 15 * 60 * 1000;
    if (!event || (event.status !== "failed" && event.status !== "pending" && !staleProcessing)) {
      return Response.json({ error: "This event is not available for replay." }, { status: 409 });
    }

    await resetAirtableSyncEvent(eventId);
    const run = await start(airtableSyncWorkflow, [{ eventId }]);
    await recordWorkflowRun(eventId, run.runId);
    return Response.json({ accepted: true, runId: run.runId }, { status: 202 });
  } catch {
    return Response.json({ error: "Airtable sync replay could not be started." }, { status: 503 });
  }
}
