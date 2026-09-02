import { describe, expect, it } from "vitest";
import { buildFilteredMovementChart, countFilteredDirectorates, filterPublicUpdates, isCurrentEmployeeProfile, PUBLIC_FIXED_WIDGET_LABEL, PUBLIC_FIXED_WIDGETS } from "../shared/public-filter-utils";
import { filterDashboardRecords } from "../shared/dashboard-utils";

describe("public aggregate filters", () => {
  const rows = [
    { month: "2026-01", status: "تعيين جديد", organization: "إدارة أ", department: "قسم 1", movementType: "خارجي" },
    { month: "2026-01", status: "نقل من", organization: "إدارة أ", department: "قسم 1", movementType: "خارجي" },
    { month: "2026-02", status: "نقل إلى", organization: "إدارة ب", department: "قسم 2", movementType: "خارجي" },
    { month: "2026-02", status: "نقل من", organization: "إدارة ب", department: "قسم 2", movementType: "داخلي" },
  ];

  it("counts only active employee profiles for the current-employee KPI", () => {
    expect(isCurrentEmployeeProfile({ employee: { workStatus: "على راس عمله" } })).toBe(true);
    expect(isCurrentEmployeeProfile({ employee: { workStatus: "منهي الخدمة" } })).toBe(false);
    expect(isCurrentEmployeeProfile({ employee: null })).toBe(false);
    expect(isCurrentEmployeeProfile({})).toBe(false);
  });

  it("recalculates central and branch counts across every supported filter", () => {
    const records = [
      { code: "A", matchStatus: "matched", employee: { workStatus: "على راس عمله", organization: "إدارة مركزية", directorate: "إدارة مركزية", department: "قسم 1" }, latestUpdate: { month: "2026-01", status: "فعال", organization: "إدارة مركزية", department: "قسم 1" } },
      { code: "B", matchStatus: "matched", employee: { workStatus: "على راس عمله", organization: "فرع الشمال", directorate: "فرع الشمال", department: "قسم 2" }, latestUpdate: { month: "2026-01", status: "فعال", organization: "فرع الشمال", department: "قسم 2" } },
      { code: "C", matchStatus: "matched", employee: { workStatus: "على راس عمله", organization: "فرع الجنوب", directorate: "فرع الجنوب", department: "قسم 3" }, latestUpdate: { month: "2026-02", status: "منقول", organization: "فرع الجنوب", department: "قسم 3" } },
    ];
    expect(countFilteredDirectorates(records)).toEqual({ current: 3, central: 1, branch: 2 });
    expect(countFilteredDirectorates(filterDashboardRecords(records as any, { month: "2026-01" }))).toEqual({ current: 2, central: 1, branch: 1 });
    expect(countFilteredDirectorates(filterDashboardRecords(records as any, { status: "منقول" }))).toEqual({ current: 1, central: 0, branch: 1 });
    expect(countFilteredDirectorates(filterDashboardRecords(records as any, { organization: "إدارة مركزية" }))).toEqual({ current: 1, central: 1, branch: 0 });
    expect(countFilteredDirectorates(filterDashboardRecords(records as any, { department: "قسم 3" }))).toEqual({ current: 1, central: 0, branch: 1 });
  });

  it("defines fixed public widgets with an explicit source-wide label", () => {
    expect(PUBLIC_FIXED_WIDGET_LABEL).toContain("غير متأثر بالفلاتر");
    expect(PUBLIC_FIXED_WIDGETS).toEqual(["salary", "centers", "training", "map"]);
  });

  it("changes the scoped rows by month and organization", () => {
    expect(filterPublicUpdates(rows, { month: "2026-01" })).toHaveLength(2);
    expect(filterPublicUpdates(rows, { organization: "إدارة ب" })).toHaveLength(2);
    expect(filterPublicUpdates(rows, { month: "2026-01", organization: "إدارة ب" })).toHaveLength(0);
    expect(filterPublicUpdates(rows, {})).toHaveLength(4);
  });

  it("recalculates contracts and the three transfer categories from the selected scope", () => {
    const series = buildFilteredMovementChart(rows, ["2026-01", "2026-02"], { month: "all" });
    expect(series[0]).toMatchObject({ contracts: 1, transfersIn: 1, transfersOut: 0, transfersInternal: 0 });
    expect(series[1]).toMatchObject({ contracts: 0, transfersIn: 0, transfersOut: 1, transfersInternal: 1 });

    const feb = buildFilteredMovementChart(rows, ["2026-01", "2026-02"], { month: "2026-02" });
    expect(feb).toHaveLength(1);
    expect(feb[0]).toMatchObject({ month: "2026-02", transfersOut: 1, transfersInternal: 1 });
  });
});
