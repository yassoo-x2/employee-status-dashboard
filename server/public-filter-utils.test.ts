import { describe, expect, it } from "vitest";
import { filterCurrentEmployeeRecords } from "../shared/dashboard-utils";
import { buildFilteredMovementChart, countFilteredDirectorates, filterPublicUpdates, getDepartmentsForDirectorate, getSalaryForMonth, isCurrentEmployeeProfile, PUBLIC_FIXED_WIDGET_LABEL, PUBLIC_FIXED_WIDGETS } from "../shared/public-filter-utils";

describe("public aggregate filters", () => {
  const rows = [
    { month: "2026-01", status: "تعيين جديد", organization: "مديرية ألف", department: "قسم 1", movementType: "خارجي" },
    { month: "2026-01", status: "نقل من", organization: "مديرية ألف", department: "قسم 1", movementType: "خارجي" },
    { month: "2026-02", status: "نقل إلى", organization: "مديرية ب", department: "قسم 2", movementType: "خارجي" },
    { month: "2026-02", status: "نقل من", organization: "مديرية ب", department: "قسم 2", movementType: "داخلي" },
  ];

  it("counts only active employee profiles for the current-employee KPI", () => {
    expect(isCurrentEmployeeProfile({ employee: { workStatus: "على راس عمله" } })).toBe(true);
    expect(isCurrentEmployeeProfile({ employee: { workStatus: "منهي الخدمة" } })).toBe(false);
    expect(isCurrentEmployeeProfile({ employee: null })).toBe(false);
    expect(isCurrentEmployeeProfile({})).toBe(false);
  });

  it("keeps the current employee KPI independent of month while respecting directorate and department", () => {
    const records = [
      { code: "A", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "مديرية ألف", department: "قسم 1" }, latestUpdate: { month: "2026-01", status: "فعال", organization: "مديرية ألف", department: "قسم 1" } },
      { code: "B", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "مديرية ألف", department: "قسم 1" }, latestUpdate: { month: "2026-02", status: "فعال", organization: "مديرية ألف", department: "قسم 1" } },
      { code: "C", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "مديرية ب", department: "قسم 2" }, latestUpdate: { month: "2026-02", status: "فعال", organization: "مديرية ب", department: "قسم 2" } },
    ];
    expect(filterCurrentEmployeeRecords(records, {})).toHaveLength(3);
    expect(filterCurrentEmployeeRecords(records, { directorate: "مديرية ألف", department: "قسم 1" })).toHaveLength(2);
  });

  it("recalculates central and branch counts from the filtered current profiles", () => {
    const records = [
      { code: "A", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "إدارة مركزية", department: "قسم 1" }, latestUpdate: null },
      { code: "B", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "فرع الشمال", department: "قسم 2" }, latestUpdate: null },
      { code: "C", matchStatus: "matched", employee: { workStatus: "على راس عمله", directorate: "فرع الجنوب", department: "قسم 3" }, latestUpdate: null },
    ];
    expect(countFilteredDirectorates(records)).toEqual({ current: 3, central: 1, branch: 2 });
    expect(countFilteredDirectorates(filterCurrentEmployeeRecords(records, { directorate: "إدارة مركزية" }))).toEqual({ current: 1, central: 1, branch: 0 });
  });

  it("limits departments to the selected directorate hierarchy and deduplicates observed aliases", () => {
    const hierarchy = { "مديرية ألف": ["قسم 1", "قسم 2"], "مديرية ب": ["قسم 3"] };
    expect(getDepartmentsForDirectorate(hierarchy, "مديرية ألف", ["قسم 2", "قسم إضافي"])).toEqual(["قسم 1", "قسم 2", "قسم إضافي"]);
    expect(getDepartmentsForDirectorate(hierarchy, "مديرية ب")).toEqual(["قسم 3"]);
    expect(getDepartmentsForDirectorate(hierarchy, "all", ["قسم إضافي"])).toContain("قسم إضافي");
  });

  it("filters movement rows by directorate and department without a status filter", () => {
    expect(filterPublicUpdates(rows, { directorate: "مديرية ب" })).toHaveLength(2);
    expect(filterPublicUpdates(rows, { directorate: "مديرية ب", department: "قسم 2" })).toHaveLength(2);
    expect(filterPublicUpdates(rows, { directorate: "مديرية ب", department: "قسم 1" })).toHaveLength(0);
  });

  it("keeps the movement and transfer charts independent of the selected month", () => {
    const all = buildFilteredMovementChart(rows, ["2026-01", "2026-02"], { month: "all" });
    const febFilter = buildFilteredMovementChart(rows, ["2026-01", "2026-02"], { month: "2026-02" });
    expect(febFilter).toEqual(all);
    expect(all[0]).toMatchObject({ contracts: 1, transfersIn: 1, transfersOut: 0, transfersInternal: 0 });
    expect(all[1]).toMatchObject({ contracts: 0, transfersIn: 0, transfersOut: 1, transfersInternal: 1 });
  });

  it("changes salary totals by month while preserving the source-wide total for all months", () => {
    const metrics = { totalSalaries: 900, salaryByMonth: [{ month: "2026-01", value: 300 }, { month: "2026-02", value: 600 }] };
    expect(getSalaryForMonth(metrics, "all")).toBe(900);
    expect(getSalaryForMonth(metrics, "2026-01")).toBe(300);
    expect(getSalaryForMonth(metrics, "2026-02")).toBe(600);
    expect(getSalaryForMonth(metrics, "2026-03")).toBe(0);
  });

  it("defines fixed public widgets with an explicit source-wide label", () => {
    expect(PUBLIC_FIXED_WIDGET_LABEL).toContain("غير متأثر بالفلاتر");
    expect(PUBLIC_FIXED_WIDGETS).toEqual(["centers", "training", "map"]);
    expect(PUBLIC_FIXED_WIDGETS).not.toContain("salary");
  });
});
