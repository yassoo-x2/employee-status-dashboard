export type PublicFilter = { month?: string; status?: string; organization?: string; department?: string };

export function filterPublicUpdates<T extends { month?: unknown; status?: unknown; organization?: unknown; department?: unknown }>(rows: T[], filters: PublicFilter) {
  return rows.filter((row) =>
    (!filters.month || filters.month === "all" || String(row.month ?? "").slice(0, 7) === filters.month) &&
    (!filters.status || filters.status === "all" || row.status === filters.status) &&
    (!filters.organization || filters.organization === "all" || row.organization === filters.organization) &&
    (!filters.department || filters.department === "all" || row.department === filters.department),
  );
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
export const PUBLIC_FIXED_WIDGETS = ["salary", "centers", "training", "map"] as const;

export function buildFilteredMovementChart<T extends { month?: unknown; status?: unknown; movementType?: unknown }>(rows: T[], months: string[], filters: PublicFilter) {
  const scoped = filterPublicUpdates(rows, filters);
  const count = (predicate: (row: T) => boolean, month: string) => scoped.filter((row) => String(row.month ?? "").slice(0, 7) === month && predicate(row)).length;
  return months.filter((month) => !filters.month || filters.month === "all" || month === filters.month).map((month) => ({
    month,
    contracts: count((row) => row.status === "تعيين جديد", month),
    separations: count((row) => ["استقالة", "إنهاء عقد", "منقطع"].includes(String(row.status)), month),
    transfersIn: count((row) => row.movementType === "خارجي" && row.status === "نقل من", month),
    transfersOut: count((row) => row.movementType === "خارجي" && row.status === "نقل إلى", month),
    transfersInternal: count((row) => row.movementType === "داخلي", month),
  }));
}
