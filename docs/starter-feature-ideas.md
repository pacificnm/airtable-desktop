# Starter app — feature ideas

Ideas for extending this Airtable-backed Electron starter, based on what the shell already includes: Airtable OAuth/PAT, table codegen, theme/docs, debug panel, error boundaries, and user avatar.

## High impact (worth doing in the starter)

### 1. Global feedback layer — **done**

Implemented: `ToastProvider` + `useToast()` + `toastError` helpers. See **`docs/toast.md`** and Developer → Documentation §6.

### 2. Airtable data-fetching pattern — **done**

Implemented: TanStack Query + `useAirtableQuery`, `useAirtableListQuery` / `useAirtableRecordQuery`, `useAirtableMutation`, query key helpers, codegen **Query hooks** snippet in Developer → Tables. See **`docs/airtable-query.md`** and Developer → Documentation → Data fetching.

### 3. Pagination utility — **done**

Implemented: `AirtableRestClient.listAllRecords()`, `listAllTableRecords()` helper, `listAll()` on generated CRUD hooks (`maxTotal` / `maxPages` / `onPage`). See **`docs/pagination.md`** and Developer → Documentation → Pagination.

### 4. “Scaffold a screen” in Developer — **done**

Implemented: in-app scaffold panel (Tables flyout + Documentation → Scaffold a screen) — screen file + patches for `appView`, `screens.ts`, `menu.ts`, `tables.ts`; TanStack or `useEffect` list mode. See **`docs/scaffold-screen.md`**.

### 5. Generic list screen template — **done**

Implemented: `ListScreen` + `GenericListTable` (`src/components/list/`), `getListColumns` / `formatCellValue`, `src/screens/_template/ListScreen.tsx`, scaffold default uses thin `ListScreen` wrapper. See **`docs/list-screen-template.md`** and Documentation → List screen template.

### 6. Connection profiles — **done**

Implemented: named profiles (base id + PAT + OAuth per profile) in `localStorage`, switch/add/rename/delete in connection dialog, quick switch in avatar menu, query cache invalidation on switch. See **`docs/connection-profiles.md`** and Documentation → Connection profiles.

## Developer experience

### 7. Debug panel polish — **done**

Implemented: copy request/response/all per network row, URL + status filters on Network tab, **Clear on navigate** toggle (persists; clears network + errors on screen change).

### 8. REST client resilience — **done**

Implemented: `fetchWithRetry` on all REST client calls (429/503, `Retry-After`, exponential backoff), `X-Client-Request-Id` + attempt headers, rate-limit metadata on debug network rows. See **`docs/rest-client-resilience.md`**.

### 9. Example env + README — **done**

Implemented: expanded `.env.example` (all `VITE_*` vars), root **`README.md`** (quick start, env table, OAuth setup, first-table checklist, scripts, doc links).

### 10. Vitest for core libs — **done**

`vitest` + `npm test` / `npm run test:run`. Coverage: `mapRecordFields`, `generateZodSchemaSnippet` / `buildTableZodObject`, `captureHttp` redaction & truncation, `debugStore` snapshot caching & URL redaction (fixed spread order overwriting redacted URL).

## Desktop / Electron

### 11. Window & app menu — **done**

Electron `Menu`: **Reload**, **Toggle Developer Tools**, **Open Debug Panel** (`Cmd/Ctrl+Shift+D`), **About** (version + description). macOS app menu + View; Windows/Linux File / View / Help.

### 12. Production hardening — **done**

Strict CSP in production builds (`vite-plugin-production-csp`, Electron session headers). Debug panel / fetch instrumentation gated (`isDebugEnabled`, `VITE_ENABLE_DEBUG_PANEL`, `AIRTABLE_DEBUG`); production menu omits DevTools + debug items. `docs/electron-builder-publish.md` + commented `publish` block in `electron-builder.yml`.

### 13. Deep link / route persistence — **done**

`usePersistedAppView()` stores the last `AppView` in `localStorage` (`app.lastView.v1`); invalid/removed routes fall back to `home`.

## UX shell

### 14. Empty & error states — **done**

`EmptyState` + `InlineError` in `src/components/main/`; Home (connected / not connected), `ListScreen`, `GenericListTable`, inline scaffold codegen.

### 15. Command palette or menu search — **done**

`CommandPalette` (**⌘K** / **Ctrl+K**): fuzzy search over drawer menu items + any `screens.ts` routes not in the menu; keyboard navigation. Hint in the side menu.

### 16. Dark mode (optional) — **done**

Theme registry (`light` / `dark` + template), `AppThemeProvider`, CSS vars + MUI palette, avatar **Appearance** menu, early apply in `main.tsx`. New themes: copy `_themeTemplate.ts`, register in `definitions/index.ts` — `docs/themes.md`.

## Nice later (product-specific)

- Form field kit tied to Zod + `tables.ts` validation overrides
- Offline / queue for writes
- Auto-update (`electron-updater`)
- Role-based UI (only if you add an identity model beyond whoami)
- i18n skeleton

## Suggested implementation order

If you want one sprint on the starter itself:

1. ~~Toasts~~ (done)
2. ~~TanStack Query pattern~~ (done)
3. ~~Pagination helper~~ (done)
4. ~~Screen scaffolder~~ (done)
5. ~~List template~~ (done)
6. ~~Connection profiles~~ (done)

Pick a focus area—DX/codegen, runtime API, or Electron polish—and implement the top items in that bucket first.
