# Issues to Fix

Findings from a full read-only code sweep of the app (Electron shell, Airtable data layer, module
infrastructure, UI layer, and domain modules), run 2026-07-25. Nothing here has been fixed yet —
this is the punch list. Ranked most severe first within each section.

## Critical

### 1. ✅ FIXED — Module provisioning silently drops tables in long dependency chains
- **File:** `src/lib/modules/buildCreateTableFields.ts:40` (`sortBlueprintsForProvisioning`)
- **Problem:** The loop guard `while (remaining.length > 0 && guard < remaining.length * 3)`
  recomputes its bound against the *shrinking* `remaining.length` each iteration, so a linear
  dependency chain of 4+ blueprints exits before all tables are sorted. Verified by simulation: a
  10-table linear chain returns only 8 blueprints.
- **Impact:** `provisionModuleTables` (`src/lib/modules/provisionModuleTables.ts:81`) iterates the
  truncated list and reports success while some tables are never created in Airtable, with no
  error surfaced. No test covers `sortBlueprintsForProvisioning` itself.
- **Fix (2026-07-25):** Removed the `guard` counter entirely — each loop pass either splices one
  entry out of `remaining` or breaks via the existing cycle-detection path, so it's naturally
  bounded by `blueprints.length` iterations and never needed a guard. Added a regression test in
  `buildCreateTableFields.test.ts` covering a reversed 10-table linear chain.

## High

### 2. ✅ FIXED — `pagesFetched` miscounts API calls on truncated pagination
- **File:** `src/lib/airtable/restClient.ts:114` (`listAllRecords`)
- **Problem:** `pageIndex` is incremented before the `maxPages`/`maxTotal` guards are checked, then
  `pagesFetched` is returned as `pageIndex + 1` unconditionally.
- **Impact:** `maxPages: 1` reports `pagesFetched: 2` for a single real fetch; `maxTotal <= 0`
  reports `pagesFetched: 1` for zero fetches. Misleads the debug panel/telemetry documented in
  `docs/pagination.md`.
- **Fix (2026-07-25):** `pageIndex` now increments immediately after each real fetch (instead of
  only when continuing to the next page), and doubles as both the `onPage` page number (via
  `pageIndex - 1`) and the final fetch count, so `pagesFetched: pageIndex` is now exact. Added
  `restClient.test.ts` covering the `maxPages: 1` truncation, `maxTotal: 0`, and a normal
  multi-page pagination.

### 3. ✅ FIXED — Production CSP blocks Airtable attachment uploads
- **Files:** `src/lib/security/productionCsp.ts:9`, `electron/csp.ts:6`
- **Problem:** `connect-src` allows `api.airtable.com`, `airtable.com`, `*.airtableusercontent.com`
  but not `content.airtable.com`, the origin `uploadRecordAttachment`
  (`src/lib/airtable/restClient.ts:295`) actually fetches.
- **Impact:** Attachment uploads fail in packaged/production builds (CSP not enforced in dev, so
  this doesn't show up until release).
- **Fix (2026-07-25):** Added `https://content.airtable.com` to `connect-src` in both
  `productionCsp.ts` and its Electron-main mirror `electron/csp.ts` (`vite-plugin-production-csp.ts`
  imports the shared constant, so no third copy needed updating).

### 4. ✅ FIXED — Provisioned table ids from App Config never take effect
- **File:** `src/lib/modules/registry.ts:48` (`resolveModuleTableConfig`)
- **Problem:** Reads `moduleTableIdCache`, which is only populated by `ModuleTableIdHydrator`
  (mounted inside the React tree, `src/main.tsx:26`) — but `src/config/tables.ts:28` calls
  `getModuleTableContributions()` at top-level module-evaluation time, synchronously, before React
  even mounts. The cache is guaranteed empty when ids are first resolved, and nothing recomputes
  `tableConfigByKey` afterward.
- **Impact:** Breaks the documented cross-device flow in `docs/external-modules.md` — a new
  device/session with no localStorage data can't pick up real table ids saved to Airtable App
  Config. The mechanism is effectively dead for its intended purpose.
- **Fix (2026-07-25):** `src/config/tables.ts` no longer freezes a `tableConfigByKey` object at
  import time. `getConfiguredTables()` now re-runs `getModuleTableContributions()` (which re-reads
  `moduleTableIdCache` and the localStorage provisioning map) on every call, and `getTableConfig()`
  looks up against that fresh list — so ids that hydrate later (via `ModuleTableIdHydrator` after
  React mounts, or provisioning that runs afterward) take effect immediately for every caller, all
  of which already invoke `getTableConfig`/`getConfiguredTables` per-call rather than caching the
  result themselves. The static `airtableTables` snapshot is kept (only used for `.length` shape
  checks, which don't depend on resolved ids) but is now documented as pre-hydration-only. Added a
  regression test in `tables.init.test.ts` that merges an id into the cache after the module has
  already loaded and asserts `getTableConfig` picks it up.

### 5. ✅ FIXED — Forms have no `onSubmit` handler; Enter key reloads the app
- **Files:** `src/components/ui/form/FormStack.tsx:9`, `src/components/ui/form/FormGrid.tsx:15`
- **Problem:** Both render `<form component="form" noValidate>` with no `onSubmit` anywhere in the
  codebase (`onSubmit` appears zero times in `src/` or `modules/`). The real Save button lives
  outside the `<form>` element, in `FormDrawer`'s action bar.
- **Impact:** Pressing Enter in any single-field form (e.g. `RoleForm`'s Name input) triggers
  native implicit form submission with no `preventDefault`, causing a full Electron window reload
  and loss of unsaved input. Affects every module edit form (`RoleForm`, `AppUserForm`,
  `ConfigEntryForm`, `CustomSignInForm`, etc.) since they all share these primitives.
- **Fix (2026-07-25):**
  - `FormStack`/`FormGrid` now default `onSubmit` to `event.preventDefault()` (stopping the native
    reload) while still accepting a caller-supplied `onSubmit` override (`FormGrid` needed an
    explicit prop added since it doesn't spread arbitrary props like `FormStack` does).
  - `FormDrawer` (`src/components/ui/drawer/FormDrawer.tsx`) now catches the inner `<form>`'s
    submit event as it bubbles up to the content `Box` wrapping `{children}`, calls
    `event.preventDefault()`, and invokes the same `onSave` the footer button uses (guarded by
    `saving`/`saveDisabled`) — so Enter now behaves like clicking Save for every FormDrawer-based
    form (`RoleForm`, `AppUserForm`, `ConfigEntryForm`, `RolePermissionForm`) with no per-form
    changes needed.
  - `CustomSignInForm` and `UsersAuthSettings` render their Save/Sign-in button *inside* the form
    (not inside a `FormDrawer`), so each now passes its own `onSubmit` to `FormStack` directly,
    calling the same handler the button's `onClick` uses.
  - Verified with `tsc --noEmit` and `eslint` (both clean). Not verified against a live Electron/
    browser session — this repo has no React component-rendering test infra (no jsdom or
    `@testing-library/react`) and exercising the real forms requires a connected Airtable base, so
    this wasn't click-tested end-to-end.

### 6. ✅ FIXED — OAuth sync silently overwrites admin edits to user records
- **File:** `modules/users/lib/syncOAuthProfile.ts:27` (`syncOAuthUserProfile`)
- **Problem:** Unconditionally sets `active: true` and recomputes `displayName` from the OAuth
  email, then updates the existing record on every sync — `useDirectoryUser`'s local-cache skip
  check doesn't reliably prevent this on first load.
- **Impact:** An admin who deactivates an OAuth-linked user or edits their Display name via
  `AppUserForm` can have both fields silently overwritten on the user's next sign-in. Not yet an
  auth bypass (`active` isn't checked for OAuth sign-in today) but defeats the admin control, and
  becomes a real bypass if OAuth-mode gating is ever added.
- **Fix (2026-07-25):** Split the fields payload by branch. On **create** (no existing record
  found), still sets `active: true` and derives `displayName` from the OAuth email — sensible
  defaults for a brand-new row. On **update** (record already exists), the payload now only
  contains `email` and `airtableUserId`, so `active`/`displayName` are omitted entirely; since
  `client.updateRecords` sends a `PATCH` (confirmed in `restClient.ts`, not `PUT`), omitted fields
  are left untouched in Airtable rather than cleared. Added `syncOAuthProfile.test.ts` covering
  both the create-defaults case and an update that must preserve an admin-deactivated,
  admin-renamed existing record.

## Medium

### 7. Unvalidated `moduleRoot` allows path traversal in dev IPC handlers
- **Files:** `electron/main.ts:40` (`resolveModuleTablesPath`), `electron/main.ts:171`
  (`writeModuleDevFile`), `electron/preload.cts:30`, `src/lib/modules/electronModulesBridge.ts:19`
- **Problem:** `relativePath` is checked for `..`/absolute paths, but `moduleRoot` never is, on
  either the main or renderer side. Found independently by two separate review passes.
- **Impact:** A call to `modules:writeModuleTablesFile` (or `patchModuleTableIds` /
  `resetModuleTableIds`) with `moduleRoot: '../../../../etc'` would escape `projectRoot`. Gated
  behind `!app.isPackaged` (dev only) and all current call sites pass sanitized ids, so not
  exploitable today — but the handler itself has no defense if a future caller doesn't.

### 8. `shell.openExternal` has no URL scheme allowlist
- **File:** `electron/main.ts:2280` (`setWindowOpenHandler`)
- **Problem:** Passes any `url` from `window.open()` straight to `shell.openExternal` with no
  restriction to `http(s):`. No `will-navigate` handler exists either.
- **Impact:** If renderer content is ever compromised (e.g. reflected XSS from Airtable data), a
  crafted `window.open()` call could trigger OS-level handling of arbitrary URLs/protocols.

### 9. OAuth refresh tokens get persisted to plaintext localStorage
- **File:** `src/lib/airtable/connectionProfiles.ts:104` (`snapshotOAuthToProfile`)
- **Problem:** On profile switch, copies the OAuth `accessToken`/`refreshToken` (normally
  session-only) onto the persisted `ConnectionProfile`, written to `localStorage` in plaintext via
  `persistConnectionProfileStore`.
- **Impact:** A long-lived refresh token ends up durably stored, unencrypted, on disk — broader
  exposure than the session-only design elsewhere implies, and unlike PAT storage, not called out
  in `docs/connection-profiles.md`.

### 10. No request timeout in the retry layer
- **File:** `src/lib/airtable/fetchWithRetry.ts:50`
- **Problem:** No `AbortController`/timeout wraps the `fetch` call, so a hung connection or
  stalled response never resolves or rejects, and retries never trigger.
- **Impact:** A stalled network response to any Airtable API call hangs the awaiting UI
  indefinitely. `docs/rest-client-resilience.md` only documents 429/503 retry behavior, not this
  gap.

### 11. Error screen ignores dark mode, uses deprecated theme file
- **File:** `src/components/main/ErrorScreen.tsx:1`
- **Problem:** Wraps itself in its own hardcoded light-mode `ThemeProvider` using the file
  explicitly marked `@deprecated` (`src/theme.ts`), bypassing `AppThemeProvider`/`useAppTheme`
  entirely.
- **Impact:** A user in dark mode whose app crashes sees a jarring hardcoded light-themed error
  screen, and the deprecated `src/theme.ts` keeps shipping in production purely because of this
  import.

### 12. Provisioning-needed check reads stale static config
- **File:** `src/lib/modules/moduleProvisioningState.ts:4` (`moduleNeedsTableProvisioning`)
- **Problem:** Inspects the raw bundled `mod.definition.tables` instead of the resolved ids from
  `moduleTableIdCache`/localStorage that `registry.ts` actually uses at runtime.
- **Impact:** In any deployment where `tables.ts` isn't file-patched (browser build, installed npm
  module — anywhere outside Electron dev), this permanently reports "needs provisioning" even
  after successful provisioning, affecting `moduleDependencyProvisionBlockers` and recursive
  dependency provisioning.

### 13. Clickable rows/cards have no keyboard activation path
- **Files:** `src/components/ui/table/DataTable.tsx:105`, `src/components/ui/card/RecordCard.tsx:33`
- **Problem:** `onClick` handlers with no `tabIndex`, `role="button"`, or `onKeyDown` — mouse-only.
- **Impact:** Keyboard-only users can't activate row navigation on any screen using `onRowClick`
  (`DeveloperDataFileMappings`, `DeveloperTables`, any `RecordCollectionView`-based screen).

### 14. No duplicate email/username check when creating users
- **File:** `modules/users/lib/userForm.ts:76` (`validateAppUserFormValues`)
- **Problem:** Never checks the existing user list for a clashing email/username on create; no
  server-side uniqueness check in the create mutation either.
- **Impact:** `useUsersModuleAuth.signIn` resolves login via
  `OR({Email}='x', {Username}='x')` with `maxRecords: 1` — duplicates mean sign-in silently
  authenticates against whichever record Airtable returns first (ambiguous/wrong-account risk).

## Low

### 15. Dead component contradicts list-screen docs
- **File:** `src/components/list/GenericListTable.tsx`
- `GenericListTable` is exported but never imported anywhere; `docs/list-screen-template.md` still
  documents it as the table body `ListScreen` uses. `ListScreen` actually renders
  `RecordCollectionView` → `DataTable`/`RecordCardGrid`.

### 16. Users screen diverges from shared list-page pattern
- **File:** `modules/users/screens/UsersListScreen.tsx`
- Hand-rolls `PageContainer`/`PageHeader`/`PageContents`/`Loading`/`InlineError` instead of the
  shared `RecordListPage` wrapper that Roles, Config, and Notifications screens all use. Future
  fixes to `RecordListPage` won't propagate here.

### 17. Preload script and build scripts are silently unlinted
- **File:** `eslint.config.js:11`
- Only lints `electron/**/*.ts` and `vite.config.ts`. `electron/preload.cts` (a `.cts` file)
  doesn't match that glob; `scripts/**/*.mjs` and `scripts/**/*.ts` have no matching block at all.

### 18. Duplicated method bodies in the Airtable REST client
- **File:** `src/lib/airtable/restClient.ts:99`
- `getRecord` (line 99) and `retrieveRecord` (line 185) are byte-for-byte identical. `findTableById`
  is also duplicated verbatim between `restClient.ts:271` and `cachingRestClient.ts:130` instead of
  the caching wrapper delegating to `inner.findTableById`.

### 19. Retry backoff has no jitter
- **File:** `src/lib/airtable/fetchWithRetry.ts:24`
- Deterministic `1000 * 2^attempt` delay — concurrent requests hitting 429 at the same time retry
  in lockstep instead of spreading load out.

### 20. Redundant branch with no actual conditional behavior
- **File:** `src/lib/modules/registry.ts:60`
- `if (isPlaceholderTableId(table.tableId)) { return table } return table` — both branches return
  the identical value; the placeholder check has no effect.

### 21. Unused hook has an O(n)-per-render key-building pattern
- **File:** `src/hooks/useClientTablePager.ts:19`
- Not imported anywhere. Builds `resetKey` via `` `${pageSize}\0${rows.length}\0${rows}` ``, which
  stringifies the entire `rows` array via `Array.prototype.toString()` on every render.

### 22. OAuth token IPC handler skips input validation
- **File:** `electron/main.ts:2218`
- `airtable:oauthToken` destructures `payload.body`/`payload.authorization` with no runtime check
  that `payload` is an object or `body` is a string, unlike every other handler in the file. Low
  impact since the fetch target is hardcoded to `AIRTABLE_TOKEN_URL`.

### 23. No custom app icon configured for packaged builds
- **File:** `electron-builder.yml`
- No `icon:` key under `mac`/`win`/`linux`; `build/` only contains `entitlements.mac.plist`.
  Packaged installers ship with electron-builder's default generic icon.

### 24. Two exported query-key builders are never used
- **File:** `modules/notifications/lib/notificationsQueryKeys.ts:3`
- `list()` and `unreadCount()` are exported but never referenced; only `.all` is used (in
  `NotificationBusBridge.tsx`).

### 25. Unreachable string-handling branch in boolean parser
- **File:** `modules/config/lib/parseConfigValue.ts:52`
- The `typeof parsed === 'string'` branch inside `parseConfigBoolean` is unreachable because
  `parseConfigValue`'s `'boolean'` case always returns an actual boolean, never a string.
