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

  it("guards same-origin public links while keeping external links free", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHook(() => useUnsavedChanges(true));
    const publicLink = document.createElement("a");
    publicLink.href = "/about";
    document.body.append(publicLink);
    const internalEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    publicLink.dispatchEvent(internalEvent);

    expect(internalEvent.defaultPrevented).toBe(true);
    const externalLink = document.createElement("a");
    externalLink.href = "https://example.com/about";
    externalLink.target = "_blank";
    document.body.append(externalLink);
    const externalEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    externalLink.dispatchEvent(externalEvent);
    expect(externalEvent.defaultPrevented).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
  });

  it("guards Back cancellation, allows confirmed navigation, and cleans up", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const historyGo = vi.spyOn(window.history, "go").mockImplementation(() => undefined);
    const { unmount } = renderHook(() => useUnsavedChanges(true));
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    expect(historyGo).toHaveBeenCalledWith(1);

    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    confirm.mockReturnValue(true);
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    expect(historyGo).toHaveBeenCalledOnce();

    unmount();
    confirm.mockClear();
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    expect(confirm).not.toHaveBeenCalled();
    expect(historyGo).toHaveBeenCalledOnce();
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
