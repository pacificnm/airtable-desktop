# App modules

Optional features live here as **self-contained plugins**. Core discovers every `modules/<id>/index.ts` and loads those listed in `src/config/enabledModules.ts`.

## Quick start

1. Copy `config/` or `roles/` to `modules/<your-id>/`.
2. Edit `index.ts`, `tables.ts`, `blueprints.ts`, and add screens/hooks.
3. Add `<your-id>` to `src/config/enabledModules.ts`.
4. **Developer → Modules → Enable** (connected to your base).
5. Read **Documentation → Modules** in the app for the full authoring guide.

## Bundled modules

| Id | Folder | Purpose |
|----|--------|---------|
| `config` | `config/` | Key–value settings + `module.*.enabled` flags |
| `roles` | `roles/` | Roles & permissions |
| `users` | `users/` | App users (OAuth or custom auth) |
| `notifications` | `notifications/` | Pub/sub notifications + header bell |

## Docs

- In-app: **Documentation → Modules**
- Repo: [docs/modules.md](../docs/modules.md)
