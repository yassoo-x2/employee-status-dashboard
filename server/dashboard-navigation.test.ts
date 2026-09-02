import { describe, expect, it } from "vitest";
import { dashboardMenuItems, hasUniqueDashboardPaths } from "../shared/dashboard-navigation";

describe("dashboard navigation", () => {
  it("keeps every sidebar item on a unique route", () => {
    expect(hasUniqueDashboardPaths()).toBe(true);
    expect(new Set(dashboardMenuItems.map((item) => item.path)).size).toBe(dashboardMenuItems.length);
  });
});
