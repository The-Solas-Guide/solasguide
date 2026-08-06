import { sleep } from "workflow";
import {
  claimAirtableSyncEvent,
  performAirtableSync,
  syncAirtableSubmission,
  type AirtableSyncEvent,
  type AirtableSubmission,
} from "@/lib/airtable-sync";

export async function airtableSubmissionWorkflow(input: AirtableSubmission) {
  "use workflow";
  return syncAirtableSubmission(input);
}

export async function airtableSyncWorkflow(input: { eventId: string }) {
  "use workflow";

  for (let leaseAttempt = 0; leaseAttempt < 20; leaseAttempt += 1) {
    const claim = await claimAirtableSyncEvent(input.eventId);
    if (claim.claimed) {
      const event: AirtableSyncEvent = {
        id: input.eventId,
        source: claim.source,
        sourceId: claim.sourceId,
        sourceSubmissionId: claim.sourceSubmissionId,
        isTestRecord: claim.isTestRecord,
        operation: claim.operation,
      };
      return performAirtableSync(event);
    }
    if (claim.currentStatus === "succeeded" || claim.currentStatus === "failed") {
      return { status: claim.currentStatus };
    }
    await sleep("30s");
  }

  return { status: "deferred" as const };
}
