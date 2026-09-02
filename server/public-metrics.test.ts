import { describe, expect, it } from "vitest";
import dashboardData from "./data/dashboard.json";

describe("public overview metrics", () => {
  it("contains real workforce, salary, center, and organization metrics", () => {
    expect(dashboardData.publicMetrics.currentEmployees).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.totalSalaries).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.salarySource).toBe("المالي.الرواتب");
    expect(dashboardData.publicMetrics.centers).toBe(dashboardData.workLocations.length);
    expect(dashboardData.publicMetrics.centralDirectoratesEmployees + dashboardData.publicMetrics.branchDirectoratesEmployees).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.centralDirectoratesEmployees).toBe(683);
    expect(dashboardData.publicMetrics.branchDirectoratesEmployees).toBe(1435);
  });

  it("contains hierarchy-driven directorate/departments and monthly salary values", () => {
    expect(dashboardData.facets.hierarchySource).toBe("DB.هيكلية");
    expect(Object.keys(dashboardData.facets.departmentsByDirectorate).length).toBeGreaterThan(0);
    expect(dashboardData.facets.departmentsByDirectorate["مديرية المالية"]).toContain("قسم الحسابات");
    expect(dashboardData.publicMetrics.salaryByMonth).toEqual(expect.arrayContaining([{ month: "2026-06", value: 851946 }]));
  });

  it("contains monthly contract, separation, and transfer series with matching months", () => {
    const months = dashboardData.publicMetrics.newContractsByMonth.map((row) => row.month);
    expect(months.length).toBeGreaterThan(0);
    expect(dashboardData.publicMetrics.separationsByMonth.map((row) => row.month)).toEqual(months);
    expect(dashboardData.publicMetrics.transfersInByMonth.map((row) => row.month)).toEqual(months);
    expect(dashboardData.publicMetrics.transfersOutByMonth.map((row) => row.month)).toEqual(months);
    expect(dashboardData.publicMetrics.transfersInternalByMonth.map((row) => row.month)).toEqual(months);
  });

  it("reconciles transfer categories from the actual update rows", () => {
    const summary = dashboardData.publicMetrics.transferSummaryByMonth;
    const expected = dashboardData.updates.reduce((acc: Record<string, Record<string, number>>, row: any) => {
      const month = String(row.month).slice(0, 7);
      const type = String(row.movementType ?? "").trim();
      const status = String(row.status ?? "").trim();
      const category = type === "داخلي" ? "نقل داخلي" : type === "خارجي" && status === "نقل من" ? "نقل إلى الجمارك" : type === "خارجي" && status === "نقل إلى" ? "نقل خارج الجمارك" : null;
      if (category) {
        acc[month] ??= {};
        acc[month][category] = (acc[month][category] ?? 0) + 1;
      }
      return acc;
    }, {});
    for (const row of summary) {
      expect(row["نقل إلى الجمارك"]).toBe(expected[row.month]?.["نقل إلى الجمارك"] ?? 0);
      expect(row["نقل خارج الجمارك"]).toBe(expected[row.month]?.["نقل خارج الجمارك"] ?? 0);
      expect(row["نقل داخلي"]).toBe(expected[row.month]?.["نقل داخلي"] ?? 0);
    }
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
