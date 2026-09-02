export type EmploymentRow = {
  administration?: unknown;
  startDate?: unknown;
  endDate?: unknown;
};

function asDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(Date.UTC(1899, 11, 30 + value));
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value).trim();
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, day, month, year] = slash;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthOf(value: unknown): string | null {
  const date = asDate(value);
  if (!date) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function buildMonthlyAdministrationCounts(rows: EmploymentRow[], months: string[]) {
  return months.map((month) => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const startMonth = monthOf(row.startDate);
      const endMonth = monthOf(row.endDate);
      if (!startMonth || startMonth > month || (endMonth && month > endMonth)) continue;
      const administration = String(row.administration ?? "").trim() || "غير محدد";
      counts.set(administration, (counts.get(administration) ?? 0) + 1);
    }
    return {
      month,
      administrations: Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
        .map(([name, value]) => ({ name, value })),
    };
  });
}
