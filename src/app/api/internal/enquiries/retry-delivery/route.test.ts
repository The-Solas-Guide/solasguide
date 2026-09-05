import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
const mocks = vi.hoisted(() => ({ from: vi.fn(), process: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: mocks.from }) }));
vi.mock("@/lib/enquiries/customer-delivery", () => ({ processCustomerEnquiryDelivery: mocks.process }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("enquiry delivery retry selection", () => {
  it("limits retries to website submissions", async () => {
    vi.stubEnv("CRON_SECRET", "local-test-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:56321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "local-test-key");
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), or: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: [], error: null }) };
    mocks.from.mockReturnValue(query);
    const response = await GET(new Request("http://localhost/api/internal/enquiries/retry-delivery", { headers: { authorization: "Bearer local-test-secret" } }));
    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith("source", "website");
    expect(mocks.process).not.toHaveBeenCalled();
  });
});
