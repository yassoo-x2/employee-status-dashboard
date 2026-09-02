export type DashboardRecord = {
  code?: string;
  matchStatus: string;
  employee?: { name?: string; organization?: string; department?: string } | null;
  latestUpdate?: { name?: string; month?: string; status?: string; organization?: string; department?: string } | null;
};

export function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function filterDashboardRecords(records: DashboardRecord[], filters: { query?: string; month?: string; status?: string; organization?: string; department?: string }): DashboardRecord[] {
  const query = (filters.query ?? "").trim().toLowerCase();
  return records.filter((record) => {
    const employee = record.employee ?? {};
    const update = record.latestUpdate ?? {};
    const textMatch = !query || [record.code, employee.name, update.name].some((value) => String(value ?? "").toLowerCase().includes(query));
    return textMatch && (!filters.month || filters.month === "all" || update.month === filters.month) && (!filters.status || filters.status === "all" || update.status === filters.status) && (!filters.organization || filters.organization === "all" || (employee.organization || update.organization) === filters.organization) && (!filters.department || filters.department === "all" || (employee.department || update.department) === filters.department);
  });
}

export function calculateKpis(quality: { employeeRows: number; updateRows: number; updatesMissingEmployee: number; employeesMissingUpdate: number }) {
  return { totalEmployees: quality.employeeRows, totalUpdates: quality.updateRows, exceptions: quality.updatesMissingEmployee + quality.employeesMissingUpdate };
}
