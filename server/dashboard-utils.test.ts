import { describe, expect, it } from "vitest";
import { calculateKpis, filterDashboardRecords, normalizeCode } from "../shared/dashboard-utils";

describe("dashboard utilities", () => {
  it("normalizes employee codes consistently", () => {
    expect(normalizeCode(" gbc- 00123 ")).toBe("GBC-00123");
    expect(normalizeCode(null)).toBe("");
  });

  it("filters by query, month, status, organization, and department", () => {
    const records = [
      { code: "GBC-1", matchStatus: "matched", employee: { name: "أحمد علي", organization: "الجمارك", department: "المالية" }, latestUpdate: { month: "2026-08-01", status: "مباشر", organization: "الجمارك", department: "المالية" } },
      { code: "GBC-2", matchStatus: "employee_only", employee: { name: "سارة حسن", organization: "المنافذ", department: "التفتيش" }, latestUpdate: null },
    ];
    expect(filterDashboardRecords(records, { query: "أحمد", month: "2026-08-01", status: "مباشر", organization: "الجمارك", department: "المالية" })).toHaveLength(1);
    expect(filterDashboardRecords(records, { query: "سارة" })).toHaveLength(1);
  });

  it("calculates exception KPI from reconciled quality counts", () => {
    expect(calculateKpis({ employeeRows: 10, updateRows: 12, updatesMissingEmployee: 2, employeesMissingUpdate: 3 })).toEqual({ totalEmployees: 10, totalUpdates: 12, exceptions: 5 });
  });
});
