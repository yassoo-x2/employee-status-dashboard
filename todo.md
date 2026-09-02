# Project TODO

- [x] Import and normalize the supplied employee database workbook
- [x] Import and normalize the supplied monthly-update workbook
- [x] Reconcile records by employee code
- [x] Flag unmatched employee codes from either source
- [x] Flag duplicate employee codes and preserve movement history
- [x] Add workforce KPI cards for total employees, active status, updates, and data-quality exceptions
- [x] Add interactive charts for employee status, monthly update volume, organization, and work location
- [x] Implement RTL Arabic search and filters for month, employee status, organization, department, and employee code/name
- [x] Build searchable employee/update table with drill-down details
- [x] Show employment data, latest monthly status, notes, and movement history in details
- [x] Build data-quality view with reconciliation metrics and exception records
- [x] Apply polished Arabic RTL visual system with responsive layout and accessible interactions
- [x] Add Vitest coverage for normalization, reconciliation, filtering, and KPI aggregation
- [x] Verify TypeScript, tests, production build, and visual rendering
- [x] Save final checkpoint and deliver the project version

## Data decisions

- Employee records are matched primarily by normalized employee code. The current source check contains 2,432 employee rows, 3,139 update rows, 1,655 matched codes, 344 update-only codes, 776 employee-only codes, 612 duplicate update-code groups, 231 update rows without a code, and 1 employee row without a code.
- Duplicate monthly-update rows are retained as movement history rather than silently discarded.
- Missing or malformed codes are treated as data-quality exceptions and shown separately.
- The dashboard uses the supplied workbooks as the source of truth; no synthetic employee, review, rating, or testimonial data is introduced.

- [x] Build and export reconciled employee records keyed by normalized code, including matched profile, latest monthly update, and full movement history
- [x] Add validation tests for matched codes, update-only codes, employee-only codes, and missing-code rows

- [x] Replace organization and work-location summaries with interactive chart components and tooltips
- [x] Expose complete movement history in the employee drill-down without silent truncation
- [x] Add duplicate-code exception panels for employee and monthly-update sources
- [x] Make drill-down actions keyboard accessible and strengthen premium RTL visual hierarchy
- [x] Add Vitest coverage for normalization, filter combinations, and KPI calculations

- [x] Fix duplicate sidebar route key caused by two menu items sharing the `/` path
- [x] Add regression coverage for unique sidebar menu item paths
- [x] Re-run tests, TypeScript/build checks, and browser console verification
- [x] Prevent zero-size Recharts warnings during responsive rendering
