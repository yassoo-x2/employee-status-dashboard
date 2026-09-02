export type DashboardRecord = {
  code?: string;
  matchStatus: string;
  employee?: { name?: string; organization?: string; directorate?: string; department?: string } | null;
  latestUpdate?: { name?: string; month?: string; status?: string; organization?: string; department?: string } | null;
};

export function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeFilterText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/[إأآٱ]/g, "ا").replace(/[ىي]/g, "ي").replace(/[ة]/g, "ه").replace(/[\s\-–—()]+/g, "");
}

export function matchesFilterValue(value: unknown, selected: unknown): boolean {
  if (!selected || selected === "all") return true;
  return normalizeFilterText(value) === normalizeFilterText(selected);
}

export function filterDashboardRecords(records: DashboardRecord[], filters: { query?: string; month?: string; status?: string; organization?: string; directorate?: string; department?: string }): DashboardRecord[] {
  const query = (filters.query ?? "").trim().toLowerCase();
  const directorate = filters.directorate ?? filters.organization;
  return records.filter((record) => {
    const employee = record.employee ?? {};
    const update = record.latestUpdate ?? {};
    const employeeDirectorate = employee.directorate ?? employee.organization;
    const updateDirectorate = update.organization;
    const textMatch = !query || [record.code, employee.name, update.name].some((value) => String(value ?? "").toLowerCase().includes(query));
    const directorateMatch = matchesFilterValue(record.employee ? employeeDirectorate : updateDirectorate, directorate);
    const departmentMatch = matchesFilterValue(record.employee ? employee.department : update.department, filters.department);
    return textMatch && (!filters.month || filters.month === "all" || String(update.month ?? "").slice(0, 7) === String(filters.month).slice(0, 7)) && (!filters.status || filters.status === "all" || update.status === filters.status) && directorateMatch && departmentMatch;
  });
}

export function filterCurrentEmployeeRecords(records: DashboardRecord[], filters: { directorate?: string; organization?: string; department?: string }) {
  return filterDashboardRecords(records, { ...filters, month: "all" }).filter((record) => Boolean(record.employee));
}

export function calculateKpis(quality: { employeeRows: number; updateRows: number; updatesMissingEmployee: number; employeesMissingUpdate: number }) {
  return { totalEmployees: quality.employeeRows, totalUpdates: quality.updateRows, exceptions: quality.updatesMissingEmployee + quality.employeesMissingUpdate };
}
