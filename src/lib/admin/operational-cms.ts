import type { Tables } from "@/types/database";
import type {
  ArchiveState,
  CustomerEnquiryWorkflow,
  PractitionerInterestWorkflow,
} from "@/lib/admin/types";

export type OperationalKind = "customer-enquiries" | "practitioner-interest";

export type CustomerEnquiryRecord = Tables<"customer_enquiries">;
export type PractitionerInterestRecord = Tables<"practitioner_expressions_of_interest">;
export type OperationalRecord = CustomerEnquiryRecord | PractitionerInterestRecord;

export type OperationalConfig = {
  title: string;
  singular: string;
  table: "customer_enquiries" | "practitioner_expressions_of_interest";
  statuses: readonly (CustomerEnquiryWorkflow | PractitionerInterestWorkflow)[];
};

const customerEnquiryConfig: OperationalConfig = {
  title: "Customer Enquiries",
  singular: "Customer Enquiry",
  table: "customer_enquiries",
  statuses: ["new", "contacted", "closed"] as const,
};

const practitionerInterestConfig: OperationalConfig = {
  title: "Practitioner Interest",
  singular: "Practitioner Interest",
  table: "practitioner_expressions_of_interest",
  statuses: ["new", "reviewing", "accepted", "declined", "closed"] as const,
};

export function operationalConfig(kind: OperationalKind): OperationalConfig {
  return kind === "customer-enquiries" ? customerEnquiryConfig : practitionerInterestConfig;
}

export function isOperationalKind(value: unknown): value is OperationalKind {
  return value === "customer-enquiries" || value === "practitioner-interest";
}

export function operationalArchiveState(row: Pick<OperationalRecord, "archived_at">): ArchiveState {
  return row.archived_at ? "archived" : "active";
}

export function operationalRoute(kind: OperationalKind) {
  return kind === "customer-enquiries" ? "/admin/customer-enquiries" : "/admin/practitioner-interest";
}

