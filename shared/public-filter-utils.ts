export type PublicFilter = { month?: string; directorate?: string; organization?: string; department?: string };

export type SalaryMetric = { totalSalaries: number; salaryByMonth?: { month?: unknown; value?: number }[] };

export function selectedDirectorate(filters: PublicFilter) {
  return filters.directorate ?? filters.organization;
}

export function filterPublicUpdates<T extends { month?: unknown; organization?: unknown; department?: unknown }>(rows: T[], filters: PublicFilter) {
  const directorate = selectedDirectorate(filters);
  return rows.filter((row) =>
    (!filters.month || filters.month === "all" || String(row.month ?? "").slice(0, 7) === String(filters.month).slice(0, 7)) &&
    (!directorate || directorate === "all" || normalizePublicText(row.organization) === normalizePublicText(directorate)) &&
    (!filters.department || filters.department === "all" || normalizePublicText(row.department) === normalizePublicText(filters.department)),
  );
}

export function normalizePublicText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/[إأآٱ]/g, "ا").replace(/[ىي]/g, "ي").replace(/[ة]/g, "ه").replace(/[\s\-–—()]+/g, "");
}

export function getSalaryForMonth(metrics: SalaryMetric, month?: string) {
  if (!month || month === "all") return metrics.totalSalaries;
  return metrics.salaryByMonth?.find((row) => String(row.month ?? "").slice(0, 7) === String(month).slice(0, 7))?.value ?? 0;
}

export function getDepartmentsForDirectorate(hierarchy: Record<string, string[]>, directorate: string, observedDepartments: unknown[] = []) {
  const hierarchyDepartments = directorate === "all" ? Object.values(hierarchy).flat() : hierarchy[Object.keys(hierarchy).find((key) => normalizePublicText(key) === normalizePublicText(directorate)) ?? ""] ?? [];
  const seen = new Set<string>();
  return [...hierarchyDepartments, ...observedDepartments].map((value) => String(value ?? "").trim()).filter((value) => value && !seen.has(normalizePublicText(value)) && seen.add(normalizePublicText(value)));
}

export function isCurrentEmployeeProfile(record: { employee?: any }) {
  return /على راس|على رأس|مباشر|فعال|قائم/.test(String(record.employee?.workStatus ?? ""));
}

export function isBranchDirectorate(value: unknown) {
  return /الضابطة الجمركية|فرع|المنطقة الشمالية|المنطقة الجنوبية|المنطقة الشرقية|المنطقة الوسطى/.test(String(value ?? ""));
}

export function countFilteredDirectorates<T extends { employee?: any }>(records: T[]) {
  const current = records.filter(isCurrentEmployeeProfile);
  const branch = current.filter((record) => isBranchDirectorate(record.employee?.directorate ?? record.employee?.organization)).length;
  return { current: current.length, branch, central: Math.max(0, current.length - branch) };
}

export const PUBLIC_FIXED_WIDGET_LABEL = "إجمالي المصدر — غير متأثر بالفلاتر";
export const PUBLIC_FIXED_WIDGETS = ["centers", "training", "map"] as const;

export function buildFilteredMovementChart<T extends { month?: unknown; status?: unknown; movementType?: unknown; organization?: unknown; department?: unknown }>(rows: T[], months: string[], filters: PublicFilter) {
  const scoped = filterPublicUpdates(rows, { ...filters, month: "all" });
  const count = (predicate: (row: T) => boolean, month: string) => scoped.filter((row) => String(row.month ?? "").slice(0, 7) === month && predicate(row)).length;
  return months.map((month) => ({
    month,
    contracts: count((row) => row.status === "تعيين جديد", month),
    separations: count((row) => ["استقالة", "إنهاء عقد", "منقطع"].includes(String(row.status)), month),
    transfersIn: count((row) => row.movementType === "خارجي" && row.status === "نقل من", month),
    transfersOut: count((row) => row.movementType === "خارجي" && row.status === "نقل إلى", month),
    transfersInternal: count((row) => row.movementType === "داخلي", month),
  }));
}
