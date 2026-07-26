# Space Data / SI7 Reconciliation Plan

Status: **draft — for review before Phase 1 starts**

## Background

The Airtable Shared Base (`module-repos/`, submodule → `airtable-shared-base`) holds Location
(Building) and People data used by multiple Airtable bases and apps. Data arrives as CSV extracts
from source-of-truth systems and gets loaded in through this app's per-module "Data File Sync"
tooling.

Space data for the 62 buildings tracked in **SI7** has drifted out of sync — someone manually
edited/synced Space records directly in Airtable, producing duplicate Space records and incorrect
names. The immediate goal:

1. Get all current space data (per building) properly represented in the Airtable Shared Base.
2. Compare it against a fresh SI7 space data file.
3. Identify what's missing and what's wrong (duplicates, bad names, stale records) so it can be
   fixed deliberately.

A local SQLite copy of both datasets is wanted so this comparison can be done with SQL instead of
paging through the UI or a spreadsheet — 62 buildings' worth of space data is too much to eyeball.

## What already exists in this app (don't rebuild this)

- **`module-repos/space/`** — the Space module. Uses an *existing* Airtable table (read-only by
  default via `spaceModuleReadOnly` in `moduleConfig.ts`). Already has:
  - `lib/dataFileMapping.ts` — `spaceDataFileMapping`: upserts by `SPACE_ID`, resolves `Building`
    by looking up `LOCATION_ID` against Building's `locationID`. CSV shape already coded:
    `SPACE_ID, LOCATION_ID, FLOOR_ID, SPACE_NM, SPACE_DESC, SPACE_CATEGORY, SPACE_STATUS,
    SPACE_AREA_SQFT, SPACE_BOOKABLE`.
  - `lib/spaceDataFileSyncPlan.ts` — dry-run diff engine (create/update/skip/invalid per row).
  - `lib/applySpaceDataFileSyncPlan.ts` — batched Airtable writes (10-record batches, per-row
    fallback on batch failure).
- **`module-repos/location/components/spaceDataFileSync/*`** — a per-building "Space Data File
  Sync" flyout (used from the Building Detail screen) that runs the above plan/apply for one
  building's worth of space rows at a time.
- **`module-repos/location/screens/LocationReportScreen.tsx`** (+ `lib/runLocationReport.ts`,
  `lib/locationReport.ts`, `hooks/useLocationReport.ts`) — a **cross-building** report that
  compares an uploaded CSV to *every* Airtable Building record at once and shows
  match / changed / only-in-Airtable / only-in-file, with a per-row "Sync" button to fix one
  record without a full bulk apply. **This is exactly the shape of tool we need for Space, and it
  doesn't exist yet for Space** — today Space can only be compared/synced one building at a time
  via the flyout.
- **`src/lib/dataFileSync/*`** — the generic, module-agnostic mapping/coverage engine both Location
  and Space build on.
- **`scripts/fetch-base-schema.mjs`** — precedent for a standalone Node script that authenticates
  against the live Airtable base without running the Electron app: reads `VITE_AIRTABLE_PAT` /
  `VITE_AIRTABLE_BASE_ID` from `.env`, or `--from-electron` to read the app's already-saved
  connection profile out of Electron's local storage.

## Gaps — what doesn't exist yet

1. **No cross-building Space report.** The Location Report pattern has no Space equivalent.
2. **No duplicate detection anywhere in the app.** All existing sync/report logic assumes one
   Airtable record per upsert key (`spaceID`); it has no notion of "this key appears twice in
   Airtable already," which is exactly the mess that needs cleaning up here.
3. **SI7's exact CSV column layout is unconfirmed.** It may already match
   `spaceDataFileMapping`'s `SPACE_ID/LOCATION_ID/SPACE_NM/...` shape, or it may be a different
   export entirely.
4. **No local/offline data store exists in this app today** — everything reads Airtable live or a
   CSV on demand. Node 22 (now installed, see `docs/issues-to-fix.md` context) ships `node:sqlite`
   built in — confirmed working in this environment without any native module / `electron-rebuild`
   step, so no new dependency is needed for a local database.

## Plan

### Phase 0 — Confirm inputs (no code)

- [ ] Get a sample SI7 space export (header row + a handful of real rows, ideally for one building
      with a known duplicate problem).
- [ ] Confirm whether SI7's columns match `spaceDataFileMapping` exactly. If yes, reuse it as-is.
      If not, note the differences — `spaceDataFileMappings` already supports more than one
      mapping per module, so an `si7-v1` mapping can sit alongside the existing default one.
- [ ] Confirm how the "62 buildings" are identified — a fixed list of `LOCATION_ID`s, or simply
      "whatever buildings appear in the SI7 file." This scopes the reconciliation so buildings
      outside SI7's remit aren't flagged as noise.
- [ ] Confirm where the SI7 file will live day to day — dropped into the app's existing
      `data-files/space/` convention (`electron/main.ts` `files:*` handlers), or read from an
      arbitrary path by a standalone script. Affects whether Phase 1's script reads the app's
      managed data-files folder or a path the user points it at directly.

### Phase 1 — Offline SQLite snapshot + diff (standalone script, no app changes)

New script: `scripts/reconcile-space-data.mjs` (same auth pattern as `fetch-base-schema.mjs`).

1. Pull the full **Building** table and full **Space** table from Airtable via the REST API
   (paged, same approach as `client.listAllRecords`).
2. Parse the SI7 CSV (Phase 0's confirmed shape).
3. Write both into one local SQLite file — e.g. `.data/space-reconciliation.sqlite` (new,
   gitignored — add `.data/` or `*.sqlite` to `.gitignore`) — via `node:sqlite`:
   - `airtable_buildings(record_id, location_id, preferred_name, ...)`
   - `airtable_spaces(record_id, space_id, name, building_location_id, floor_id, category, status,
     sqft, bookable, last_modified, ...)` — every row exactly as Airtable has it today, duplicates
     included.
   - `si7_spaces(source_row, space_id, location_id, name, ...)` — raw CSV rows, untouched.
4. Run (and print a summary of) the reconciliation queries that matter here:
   - **Duplicates in Airtable**: `space_id` values with `count(*) > 1` in `airtable_spaces` — this
     is the actual damage from the manual sync.
   - **Missing in Airtable**: `si7_spaces.space_id` with no match in `airtable_spaces` → needs
     create.
   - **Missing in SI7 / stale**: `airtable_spaces.space_id` (within the 62 SI7 buildings) with no
     match in `si7_spaces` → candidate for deletion or investigation.
   - **Field mismatches**: matched rows where name/category/status/sqft differ.
   - **Out-of-scope rows**: Airtable space rows whose building isn't one of the 62 SI7 buildings
     (so they're correctly excluded from "missing" counts).
5. Hand the `.sqlite` file over for free-form SQL exploration in any SQLite browser — the
   duplicate-resolution judgment calls (which of two duplicate records is the "real" one) need a
   human, not more automation.

This phase alone delivers the "local SQLite copy to work from" and a first real,
queryable answer to "what's missing and what's wrong," without touching Airtable.

### Phase 2 — Clean up existing Airtable duplicates/bad data

- Using Phase 1's duplicate-groups findings, decide per group which record survives (heuristics to
  consider: which one matches SI7's current name/status, which has real usage/links elsewhere,
  most recent `Last Modified`).
- Apply deletions/corrections directly in Airtable, or extend the Phase 1 script with an
  explicit "apply" mode that takes a reviewed list of record IDs to delete/update — deliberately
  not automatic, since the state is already messy from one round of unsupervised syncing.

### Phase 3 — Build the missing Space Report screen (in-app, ongoing tool)

Port the proven `LocationReportScreen` pattern into the Space module so this becomes a repeatable
in-app workflow instead of a one-off script:

- `module-repos/space/lib/spaceReport.ts` — port of `location/lib/locationReport.ts`, built on the
  existing `spaceDataFileSyncPlan` diff. Adds one genuinely new status,
  `duplicate_space_id`, for any `spaceID` occurring more than once in Airtable (the Location
  version has no equivalent need since buildings don't have this problem).
- `module-repos/space/lib/runSpaceReport.ts` — port of `location/lib/runLocationReport.ts`.
- `module-repos/space/hooks/useSpaceReport.ts` — port of `location/hooks/useLocationReport.ts`.
- `module-repos/space/screens/SpaceReportScreen.tsx` — port of `LocationReportScreen.tsx`; add a
  building filter scoped to the 62 SI7 buildings plus the existing status filter chips, and reuse
  the same per-row "Sync" action already proven out for Location.
- Register the screen/menu entry per `docs/scaffold-screen.md` / `docs/modules.md`.

This reuses the large majority of already-proven code (`spaceDataFileSyncPlan`,
`applySpaceDataFileSyncPlan`, `DataTable`/`TablePager`); the real net-new work is duplicate
detection and the report-level wiring.

### Phase 4 — Prevent recurrence

- Only flip `spaceModuleReadOnly` to `false` in `moduleConfig.ts` once the Space Report shows a
  clean baseline (per `airtable-setup.md`'s existing guidance).
- Document (in `module-repos/space/airtable-setup.md`) that future Space corrections should go
  through Data File Sync / Space Report, not direct manual edits in Airtable — since Airtable has
  no native unique-constraint enforcement on `Space ID`, a manual edit is exactly how this
  happened the first time.

## Open questions (Phase 0 blockers)

1. Exact SI7 CSV column layout — does it match `spaceDataFileMapping` as-is?
2. Definitive list/definition of the 62 SI7 buildings.
3. Where the SI7 file will be delivered/stored going forward.
4. Any Airtable field that reliably flags which of two duplicate Space records is the "bad" manual
   one (e.g. `Last Modified By`, creation time) — helps automate Phase 2's triage.

## Rough shape of effort

| Phase | Scope | Size |
|---|---|---|
| 0 | Info gathering | ~0 dev time |
| 1 | Script + SQLite snapshot + diff queries | Small (hours) |
| 2 | Manual cleanup of existing duplicates | Depends on findings volume |
| 3 | Space Report screen (in-app) | Medium — mostly a port of Location Report |
| 4 | Config flip + doc update | Trivial |
