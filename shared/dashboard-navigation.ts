export const dashboardMenuItems = [
  { id: "overview", label: "نظرة عامة", path: "/" },
  { id: "employees", label: "سجل الموظفين", path: "/employees" },
] as const;

export function hasUniqueDashboardPaths(items = dashboardMenuItems) {
  return new Set(items.map((item) => item.path)).size === items.length;
}
