import { describe, expect, it } from "vitest";
import dashboard from "./data/dashboard.json";

type DashboardPayload = typeof dashboard;

describe("dashboard reconciliation payload", () => {
  it("contains reconciled records with latest update and movement history", () => {
    const matched = dashboard.reconciled.find(
      (record: DashboardPayload["reconciled"][number]) => record.matchStatus === "matched",
    );

    expect(matched).toBeDefined();
    expect(matched?.employee).not.toBeNull();
    expect(matched?.latestUpdate).not.toBeNull();
    expect(matched?.movementHistory.length).toBeGreaterThan(0);
    expect(matched?.latestUpdate?.id).toBe(matched?.movementHistory[0]?.id);
  });

  it("exposes update-only and employee-only records", () => {
    expect(
      dashboard.reconciled.some(
        (record: DashboardPayload["reconciled"][number]) => record.matchStatus === "update_only",
      ),
    ).toBe(true);
    expect(
      dashboard.reconciled.some(
        (record: DashboardPayload["reconciled"][number]) => record.matchStatus === "employee_only",
      ),
    ).toBe(true);
  });

  it("keeps missing-code rows visible as quality exceptions", () => {
    expect(dashboard.quality.missingUpdateCodeRows).toBeGreaterThan(0);
    expect(
      dashboard.reconciled.some(
        (record: DashboardPayload["reconciled"][number]) => record.matchStatus === "missing_code",
      ),
    ).toBe(true);
  });

  it("matches the code-level reconciliation counts", () => {
    expect(dashboard.quality.matchedCodes).toBeGreaterThan(0);
    expect(dashboard.quality.updatesMissingEmployee).toBeGreaterThan(0);
    expect(dashboard.quality.employeesMissingUpdate).toBeGreaterThan(0);
    expect(dashboard.quality.duplicateUpdateCodes).toBeGreaterThan(0);
  });
});
