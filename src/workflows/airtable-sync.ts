import {
  syncAirtableSubmission,
  type AirtableSubmission,
} from "@/lib/airtable-sync";

export async function airtableSubmissionWorkflow(input: AirtableSubmission) {
  "use workflow";
  return syncAirtableSubmission(input);
}
