// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OperationalEditor, OperationalPrivacyRemoval } from "./operational-editor";
import type { OperationalRecord } from "@/lib/admin/operational-cms";

const mocks = vi.hoisted(() => ({ save: vi.fn(), archive: vi.fn(), remove: vi.fn(), refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace, push: vi.fn() }) }));
vi.mock("@/lib/admin/operational-actions", () => ({ saveOperationalRecord: mocks.save, setOperationalArchive: mocks.archive, removeOperationalRecord: mocks.remove }));
const record: OperationalRecord = {
  id: "12345678-1234-4123-8123-123456789abc", full_name: "QA Person", email: "qa@example.test", phone: null,
  contact_preference: "email", consent_confirmed: true, consent_given_at: "2026-09-01T12:00:00Z", questionnaire_answers: { context: "Original answer" },
  source: "website", status: "contacted", internal_notes: "Existing note", archived_at: null,
  submission_token: "12345678-1234-4123-8123-123456789def", created_at: "2026-09-01T12:00:00Z", updated_at: "2026-09-01T12:00:00Z",
  customer_confirmation_sent_at: null, internal_notification_sent_at: null, customer_confirmation_status: "pending", internal_notification_status: "pending",
};

beforeEach(() => { vi.clearAllMocks(); mocks.save.mockResolvedValue({ ok: true }); mocks.remove.mockResolvedValue({ ok: true }); });
afterEach(cleanup);

describe("private operational editor", () => {
  it("keeps submitted contact, answers and system evidence out of editable payloads", async () => {
    const { container } = render(<OperationalEditor kind="customer-enquiries" record={record} />);
    expect(screen.getByText("Original answer")).toBeTruthy();
    expect(container.querySelector('input[name="email"]')).toBeNull();
    expect(container.querySelector('textarea[name="questionnaire_answers"]')).toBeNull();
    expect((screen.getByLabelText("Submission token") as HTMLInputElement).readOnly).toBe(true);
    expect(screen.queryByRole("button", { name: /publish|permanent delete/i })).toBeNull();
    fireEvent.change(screen.getByLabelText("Internal notes"), { target: { value: "Followed up" } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    const data = mocks.save.mock.calls[0][1] as FormData;
    expect(data.get("status")).toBe("contacted");
    expect(data.get("internal_notes")).toBe("Followed up");
    expect(data.has("email")).toBe(false);
    expect(data.has("consent_given_at")).toBe(false);
    expect(data.has("submission_token")).toBe(false);
  });

  it("shows readable questionnaire labels without changing stored answers", () => {
    render(<OperationalEditor kind="customer-enquiries" record={{ ...record, questionnaire_answers: { formVersion: 3, q1: "personal-wellbeing", q3: ["stress", "sleep"] } }} />);
    expect(screen.getByText("What brings you to The Solas Guide today?")).toBeTruthy();
    expect(screen.getByText("Personal wellbeing")).toBeTruthy();
    expect(screen.getByText("Stress")).toBeTruthy();
    expect(screen.getByText("Sleep")).toBeTruthy();
  });

  it("retains notes and reports failure when a save fails", async () => {
    mocks.save.mockResolvedValue({ ok: false, error: "Could not save." });
    const { container } = render(<OperationalEditor kind="customer-enquiries" record={record} />);
    fireEvent.change(screen.getByLabelText("Internal notes"), { target: { value: "Unsaved note" } });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("Could not save.")).toBeTruthy());
    expect((screen.getByLabelText("Internal notes") as HTMLTextAreaElement).value).toBe("Unsaved note");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("creates structured context and keeps the history guard until record navigation", async () => {
    mocks.save.mockResolvedValue({ ok: true, data: { id: record.id } });
    const { container } = render(<OperationalEditor kind="practitioner-interest" record={null} />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "QA Person" } });
    fireEvent.change(screen.getByLabelText("Submitted context"), { target: { value: "Practice details" } });
    fireEvent.change(screen.getByLabelText("Consent given at"), { target: { value: "2026-09-01T12:00" } });
    fireEvent.click(screen.getByLabelText("Consent confirmed"));
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    const data = mocks.save.mock.calls[0][1] as FormData;
    expect(JSON.parse(String(data.get("questionnaire_answers")))).toEqual({ manual_context: "Practice details" });
    expect(data.get("consent_confirmed")).toBe("on");
    expect(String(data.get("consent_given_at"))).toMatch(/Z$/);
    expect(mocks.replace).toHaveBeenCalledWith(`/admin/practitioner-interest/${record.id}`);
    expect(container.querySelector("form")?.getAttribute("data-dirty")).toBe("true");
  });
});

describe("separate privacy removal", () => {
  it("requires archive before opening", () => {
    render(<OperationalPrivacyRemoval kind="customer-enquiries" record={record} disabled={false} />);
    expect((screen.getByRole("button", { name: "Remove for privacy" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("navigates after removal without refreshing the deleted detail route", async () => {
    render(<OperationalPrivacyRemoval kind="customer-enquiries" record={{ ...record, archived_at: "2026-09-04T12:00:00Z" }} disabled={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove for privacy" }));
    fireEvent.change(screen.getByLabelText("Privacy removal confirmation"), { target: { value: record.full_name } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm privacy removal" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin/customer-enquiries"));
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
  it("requires exact name and acknowledgement and retains a failed dialog", async () => {
    mocks.remove.mockResolvedValue({ ok: false, error: "Removal failed." });
    render(<OperationalPrivacyRemoval kind="customer-enquiries" record={{ ...record, archived_at: "2026-09-04T12:00:00Z" }} disabled={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove for privacy" }));
    const confirm = screen.getByRole("button", { name: "Confirm privacy removal" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Privacy removal confirmation"), { target: { value: record.full_name } });
    expect(confirm.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Removal failed."));
    expect(mocks.remove).toHaveBeenCalledWith("customer-enquiries", record.id, record.full_name, true);
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
