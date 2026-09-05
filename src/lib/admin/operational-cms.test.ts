import { describe, expect, it } from "vitest";
import {
  isOperationalKind,
  operationalArchiveState,
  operationalConfig,
} from "@/lib/admin/operational-cms";

describe("operational CMS configuration", () => {
  it("keeps the two private record types and their workflow statuses explicit", () => {
    expect(operationalConfig("customer-enquiries")).toEqual({
      title: "Customer Enquiries",
      singular: "Customer Enquiry",
      table: "customer_enquiries",
      statuses: ["new", "contacted", "closed"],
    });
    expect(operationalConfig("practitioner-interest")).toEqual({
      title: "Practitioner Interest",
      singular: "Practitioner Interest",
      table: "practitioner_expressions_of_interest",
      statuses: ["new", "reviewing", "accepted", "declined", "closed"],
    });
  });

  it("recognises valid kinds and keeps archive state separate from workflow", () => {
    expect(isOperationalKind("customer-enquiries")).toBe(true);
    expect(isOperationalKind("practitioner-interest")).toBe(true);
    expect(isOperationalKind("practitioners")).toBe(false);
    expect(operationalArchiveState({ archived_at: null })).toBe("active");
    expect(operationalArchiveState({ archived_at: "2026-09-04T00:00:00.000Z" })).toBe("archived");
  });
});



it("accepts canonical database UUIDs including seeded IDs", async () => {
  const { isOperationalRecordId } = await import("./operational-cms");
  expect(isOperationalRecordId("00000000-0000-0000-0000-000000000001")).toBe(true);
  expect(isOperationalRecordId("12345678-1234-4123-8123-123456789abc")).toBe(true);
  expect(isOperationalRecordId("not-a-record")).toBe(false);
});
