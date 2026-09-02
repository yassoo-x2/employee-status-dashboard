import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import dashboardData from "./data/dashboard.json";
import { buildMonthlyAdministrationCounts } from "../shared/hr-aggregation";

describe("HR analytics metrics", () => {
  const hr = dashboardData.hrMetrics;

  it("reconciles the current employee code-prefix split", () => {
    expect(hr.currentNewEmployees).toBe(2094);
    expect(hr.legacyEmployees).toBe(24);
    expect(hr.currentNewEmployees + hr.legacyEmployees).toBeLessThanOrEqual(2118);
  });

  it("contains the requested demographic and employee-type groups", () => {
    expect(hr.specialNeeds).toBe(7);
    expect(hr.genderDistribution.map((item) => item.name)).toEqual(["ذكر", "أنثى", "غير محدد"]);
    expect(hr.employeeTypeDistribution.map((item) => item.name)).toEqual(["مقيم", "اداري", "اداري مقيم", "غير محدد"]);
    expect(hr.ageDistribution.map((item) => item.name)).toEqual(["تحت 30 عام", "فوق 30 عام", "غير محدد"]);
  });

  it("keeps the police split and service bands explicit", () => {
    expect(hr.customsPoliceEmployeeCount).toBe(1930);
    expect(hr.customsPoliceWorkPattern.map((item) => item.name)).toEqual(["اداري", "قوة تنفيذية"]);
    expect(hr.serviceDistribution.map((item) => item.name)).toEqual(["تحت السنة", "من سنة إلى خمس", "من 6 إلى 10", "من 11 إلى 15", "من 16 إلى 20", "أكثر من 20 سنة", "غير محدد"]);
  });

  it("runs the real monthly aggregation across employment date boundaries and formats", () => {
    const rows = [
      { administration: "إدارة أ", startDate: "2026-03-08", endDate: "2026-05-12" },
      { administration: "إدارة أ", startDate: 46082, endDate: null },
      { administration: "إدارة ب", startDate: "08/04/2026", endDate: "12/04/2026" },
    ];
    const series = buildMonthlyAdministrationCounts(rows, ["2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]);
    const value = (month: string, administration: string) => series.find((row) => row.month === month)?.administrations.find((item) => item.name === administration)?.value ?? 0;
    expect(value("2026-02", "إدارة أ")).toBe(0);
    expect(value("2026-03", "إدارة أ")).toBe(2);
    expect(value("2026-04", "إدارة أ")).toBe(2);
    expect(value("2026-04", "إدارة ب")).toBe(1);
    expect(value("2026-05", "إدارة أ")).toBe(2);
    expect(value("2026-06", "إدارة أ")).toBe(1);
    expect(value("2026-06", "إدارة ب")).toBe(0);
  });

  it("regenerates the production dashboard payload with the DB administration rule", () => {
    execFileSync("python3", ["/home/ubuntu/augment_hr_metrics.py"], { cwd: "/home/ubuntu/employee-status-dashboard" });
    const generated = JSON.parse(readFileSync("/home/ubuntu/employee-status-dashboard/server/data/dashboard.json", "utf8"));
    expect(generated.hrMetrics.monthlyAdministrationSource).toBe("DB.الادارة");
    expect(generated.hrMetrics.monthlyAdministrationCounts.length).toBeGreaterThan(0);
    expect(generated.hrMetrics.monthlyAdministrationCounts.every((row: any) => row.administrations.every((item: any) => typeof item.value === "number"))).toBe(true);
  });

  it("has a bounded absence rate and aligned monthly administration series", () => {
    expect(hr.absenceRate).toBeGreaterThanOrEqual(0);
    expect(hr.absenceRate).toBeLessThanOrEqual(100);
    expect(hr.absenceByMonth.length).toBeGreaterThan(0);
    expect(hr.monthlyAdministrationCounts.map((row) => row.month)).toEqual(hr.absenceByMonth.map((row) => row.month));
    expect(hr.monthlyAdministrationSource).toBe('DB.الادارة');
    expect(hr.monthlyAdministrationScope).toContain('كل الإدارات الموجودة في DB');
    expect(hr.monthlyAdministrationRule).toContain('تاريخ المباشرة حتى شهر تاريخ انهاء العمل شاملاً');
    expect(hr.monthlyAdministrationCounts.every((row) => row.administrations.every((item) => item.name))).toBe(true);
    expect(hr.jobTitleDistribution.length).toBeGreaterThan(0);
  });
});
