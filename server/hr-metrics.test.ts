import { describe, expect, it } from "vitest";
import dashboardData from "./data/dashboard.json";

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

  it("has a bounded absence rate and aligned monthly administration series", () => {
    expect(hr.absenceRate).toBeGreaterThanOrEqual(0);
    expect(hr.absenceRate).toBeLessThanOrEqual(100);
    expect(hr.absenceByMonth.length).toBeGreaterThan(0);
    expect(hr.monthlyAdministrationCounts.map((row) => row.month)).toEqual(hr.absenceByMonth.map((row) => row.month));
    expect(hr.jobTitleDistribution.length).toBeGreaterThan(0);
  });
});
