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

- [x] Change all dashboard number formatting to Western Arabic numerals 0-9 instead of Arabic-Indic digits
- [x] Remove employee-name table, row drill-down, and individual employee detail dialog from the statistical dashboard
- [x] Keep aggregate charts, KPI cards, filters, and data-quality statistics without exposing name-level records
- [x] Rework the dashboard into a compact landscape-oriented viewport with minimal vertical scrolling
- [x] Test responsive landscape and desktop views, then save a new checkpoint

- [x] Document that exact official colors, emblem, typography, and usage guidance could not be verified without an accessible official brand guide
- [x] Apply an identity-inspired Syrian color system to the statistical dashboard without reducing chart readability
- [x] Re-run visual and technical checks after the identity refresh

- [x] Restore month, status, organization, and department filters for aggregate statistics only
- [x] Validate the compact layout at desktop and narrower landscape/tablet viewports without clipping key sections
- [x] Record official brand-guide limitation and avoid claiming exact official compliance until a guide is supplied
- [x] Re-check palette contrast and chart readability after the final aggregate-filter redesign
- [x] Fix conditional hook order in Home so aggregate filters do not trigger a rendered-more-hooks error during loading

- [x] Add current employee count KPI to the public overview page
- [x] Add total salaries KPI using the supplied financial source field, with the unit explicitly marked as unspecified until business confirmation
- [x] Add number of centers KPI from normalized work-location data
- [x] Add training attendance KPI placeholder; populate it after the user supplies the training workbook
- [x] Add central directorates employee count
- [x] Add branch directorates employee count
- [x] Add monthly new-contract and separation charts
- [x] Add monthly transfers into and out of the Customs Administration
- [x] Add a work-location map for directorates and units using DB location fields
- [x] Inspect DB fields for salary, organizational level, movement type/date, and latitude/longitude or geocodable location names
- [x] Add tests for the new public overview aggregations and map-location normalization

- [x] Label the salary KPI as source-unit total until the user confirms currency and business meaning
- [x] Validate and test that the salary KPI uses the approved financial source field
- [x] Replace the failing Google Maps success path with a deterministic coordinate-based work-location map
- [x] Remove map-load console errors and verify the deterministic map in the browser
- [x] Run a fresh browser-console verification after the coordinate-map replacement and document the clean result

- [x] Add current new-employee count for codes beginning with GBC-
- [x] Add legacy-employee count for codes beginning with O-
- [x] Add special-needs employee count from the health/status fields when explicitly identified
- [x] Add gender distribution
- [x] Add employee-type distribution: مقيم، اداري، اداري مقيم
- [x] Add customs-police work-pattern distribution limited to directorates containing الضابطة الجمركية, split into اداري and قوة تنفيذية
- [x] Add current-employee age groups: تحت 30 عام and فوق 30 عام
- [x] Add absence-rate metric from the monthly update records
- [x] Add current-employee service-length groups using the requested six bands
- [x] Add job-title distribution for roles such as موظف ورئيس قسم
- [x] Add monthly employee counts by administration
- [x] Add a second RTL HR analytics page with aggregate charts only and no employee-name table
- [x] Add Vitest coverage for HR classifications, absence rate, service bands, and monthly administration counts
- [x] Verify the new page visually and save a checkpoint
- [x] Fix conditional hook order in HRAnalytics so memoized administration series are initialized before loading/error returns
- [x] Add dedicated HR metrics Vitest assertions for code prefixes, special needs, gender/type, police patterns, age/service bands, absence rate, and monthly administration counts
- [x] Save a new checkpoint after HR page verification
- [x] Save the final checkpoint containing the HR analytics page changes

- [x] Recalculate monthly employee counts by the DB «الادارة» column
- [x] Include each employee from the month of «تاريخ المباشرة» and exclude them after the month of «تاريخ انهاء العمل» according to the documented inclusive month rule
- [x] Add regression tests for start-date inclusion and end-date exclusion
- [x] Update the HR chart label and verify the corrected series visually
- [x] Normalize DB employment dates explicitly for Excel serials and dd/mm/yyyy values before monthly aggregation
- [x] Add concrete fixture tests proving start-month inclusion and end-month exclusion behavior
- [x] Update the HR chart title and subtitle to name DB.الادارة and the employment date rule
- [x] Decide and document that the payload contains all administrations while the visible chart intentionally shows the top 6 for readability
- [x] Test the real monthly-administration aggregation with start/end, open-ended, Excel-serial, and dd/mm/yyyy fixture dates and assert per-administration monthly values
- [x] Add a production-path test that executes the Python generator and validates the generated dashboard payload
- [x] Rebuild dashboard.json through the final tested aggregation path and rerun the complete verification

- [x] Reclassify monthly transfer chart from «نوع النقل» and «الحالة» columns
- [x] Map خارجي + نقل من to نقل إلى الجمارك
- [x] Map خارجي + نقل إلى to نقل خارج الجمارك
- [x] Aggregate all داخلي rows into النقل الداخلي regardless of الحالة
- [x] Add regression tests for the three transfer classification rules and update the chart labels

- [x] Make public-page KPI cards respond to month/status/organization/department filters where source records support it
- [x] Make contracts, separations, and transfer charts respond to the selected month and employee-scope filters
- [x] Keep and label location-map and source-wide totals as fixed when the filter cannot be applied safely
- [x] Add regression tests for filtered aggregate changes and reset behavior
- [x] Restrict the filtered current-employee KPI to employee profiles whose work status is currently active, excluding update-only rows
- [x] Add regression coverage for current-employee filtering with employee-only and update-only records
- [x] Recalculate central and branch employee summary cards from the filtered employee profiles when the selected filters support it
- [x] Add visible source-wide / غير متأثر بالفلاتر labels to salary, center, map, and other fixed widgets
- [x] Add regression coverage for changing versus fixed widgets under active filters
- [x] Label the training widget and footer as source-wide / غير متأثر بالفلاتر when training data is unavailable
- [x] Add explicit regression assertions for filtered current/central/branch counts and fixed salary/center/training/map scope
- [x] Extract central/branch employee counting into a shared testable utility and cover filtered changes by month/status/organization/department
- [x] Add a public-page view-model scope test proving salary, centers, training, and map are fixed and visibly labeled غير متأثر بالفلاتر
- [x] Add fixture assertions for countFilteredDirectorates across month, status, organization, and department scopes
- [x] Extract fixed-widget scope metadata and assert salary, centers, training, and map labels remain source-wide under active filters

## Requested public-filter behavior revision

- [x] Remove the public overview status filter and its filtering logic
- [x] Make the department filter options and results depend on the selected directorate hierarchy from DB sheet هيكلية
- [x] Keep current-employee count independent of the selected month while preserving other supported filters
- [x] Make total salaries respond to the selected month
- [x] Keep monthly movement trend independent of the selected month while preserving non-month filters where supported
- [x] Remove the duplicated monthly contracts/separations chart
- [x] Keep the transfer chart independent of the selected month while preserving non-month filters where supported
- [x] Add Vitest coverage for the revised month-scope rules and hierarchy-dependent department filter
- [x] Verify RTL desktop and landscape layouts, TypeScript, tests, and production build after the revision

## Final scope-alignment follow-up

- [x] Remove salary from the source-wide fixed-widget metadata because it now responds to the month filter
- [x] Update regression assertions so salary is month-sensitive while centers, training, and map remain source-wide

## Directorate distribution chart revision

- [x] Build a current-employee distribution by directorate using the DB «المديرية» field and the DB «الادارة» classification
- [x] Classify central directorates strictly where DB «الادارة» equals «الادارة المركزية»
- [x] Classify branch directorates where DB «الادارة» differs from «الادارة المركزية» and group their current employee counts by directorate
- [x] Replace central/branch KPI cards with full directorate distribution charts and update explanatory labels
- [x] Add Vitest coverage for central/branch classification, per-directorate counts, and filter behavior
- [x] Verify RTL desktop and landscape rendering, TypeScript, tests, and production build

## Final landscape verification follow-up

- [x] Re-run the public overview visual verification at 1024×768 after the directorate chart revision
- [x] Confirm directorate labels, internal scrolling, and RTL layout remain unclipped at landscape/tablet width

## Visual system refinement

- [x] Apply the requested palette in order: #ffffff, #054239, #b9a779, #4a151e, #428177, #edebe0, #6b1f2a, #3d3a3b
- [x] Improve global dashboard hierarchy, surfaces, borders, and chart colors using the requested palette
- [x] Replace mismatched current KPI and section icons with semantically appropriate iconography
- [x] Refresh badges and filter controls for a more professional RTL presentation
- [x] Verify contrast, RTL desktop/landscape responsiveness, tests, and production build
