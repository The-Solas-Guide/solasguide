// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGuardedAdminNavigation, useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const navigation = vi.hoisted(() => ({ router: { push: vi.fn() } }));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
}));

describe("useUnsavedChanges", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    navigation.router.push.mockClear();
  });

  it("guards internal admin links while keeping external links free", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHook(() => useUnsavedChanges(true));
    const adminLink = document.createElement("a");
    adminLink.href = "/admin/practitioners";
    document.body.append(adminLink);
    const internalEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    adminLink.dispatchEvent(internalEvent);

    expect(internalEvent.defaultPrevented).toBe(true);
    const publicLink = document.createElement("a");
    publicLink.href = "#about";
    document.body.append(publicLink);
    const publicEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    publicLink.dispatchEvent(publicEvent);
    expect(publicEvent.defaultPrevented).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
  });

  it("guards router navigation without a separate click", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => useGuardedAdminNavigation(true));
    act(() => result.current.navigate("/admin/areas"));
    expect(navigation.router.push).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledOnce();

    confirm.mockReturnValue(true);
    act(() => result.current.navigate("/admin/areas"));
    expect(navigation.router.push).toHaveBeenCalledWith("/admin/areas");
  });
});
