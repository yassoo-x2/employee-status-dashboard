export const dashboardMenuItems = [
  { id: "overview", label: "نظرة عامة", path: "/" },
  { id: "hr", label: "الموارد البشرية", path: "/hr" },
] as const;

export function hasUniqueDashboardPaths(items = dashboardMenuItems) {
  return new Set(items.map((item) => item.path)).size === items.length;
}
