import { describe, expect, it } from "vitest";
import dashboardData from "./data/dashboard.json";

describe("public overview metrics", () => {
  it("contains real workforce, salary, center, and organization metrics", () => {
    expect(dashboardData.publicMetrics.currentEmployees).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.totalSalaries).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.salarySource).toBe("المالي.الرواتب");
    expect(dashboardData.publicMetrics.centers).toBe(dashboardData.workLocations.length);
    expect(dashboardData.publicMetrics.centralDirectoratesEmployees + dashboardData.publicMetrics.branchDirectoratesEmployees).toBeGreaterThan(0);
  });

  it("contains monthly contract, separation, and transfer series with matching months", () => {
    const months = dashboardData.publicMetrics.newContractsByMonth.map((row) => row.month);
    expect(months.length).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.separationsByMonth.map((row) => row.month)).toEqual(months);
    expect(dashboardData.publicMetrics.transfersInByMonth.map((row) => row.month)).toEqual(months);
    expect(dashboardData.publicMetrics.transfersOutByMonth.map((row) => row.month)).toEqual(months);
  });

  it("normalizes map locations to valid coordinates and employee counts", () => {
    expect(dashboardData.workLocations.length).toBeGreaterThan(0);
    for (const location of dashboardData.workLocations) {
      expect(location.name).toBeTruthy();
      expect(location.latitude).toBeGreaterThan(32);
      expect(location.latitude).toBeLessThan(38);
      expect(location.longitude).toBeGreaterThan(35);
      expect(location.longitude).toBeLessThan(43);
      expect(location.employeeCount).toBeGreaterThanOrEqual(0);
    }
  });
});
