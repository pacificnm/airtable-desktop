# Connection profiles

Named environments (e.g. **Development** / **Production**) with separate **base id** and **personal access token**, stored in `localStorage` on this device.

## Switch profiles

- **Avatar menu** (top right) — quick switch when you have more than one profile
- **Airtable connection** dialog — profile dropdown, rename, add, delete

Switching saves the current profile’s OAuth session (if any), loads the selected profile’s credentials, and **invalidates TanStack Query caches** so you do not mix data between bases.

## Per profile

| Setting | Scope |
|--------|--------|
| Base ID | This profile only |
| PAT | This profile only |
| OAuth | Saved on the active profile when you sign in |

`VITE_AIRTABLE_PAT` in the environment still applies when the active profile has no saved PAT.

## Migration

Existing single base id + PAT from older builds are migrated into a **Default** profile on first load.

## Storage

Profiles are stored under `airtable.connection.profiles.v1` in `localStorage`. Tokens are not encrypted — same as the previous connection storage.
