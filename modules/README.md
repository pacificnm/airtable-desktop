# Default app modules

Built-in modules for the starter app (`config`, `roles`, `users`, `notifications`). Core discovers every `modules/<id>/index.ts`.

**Your own features** go in [`module-repos/`](../module-repos/) (separate GitHub repos / submodules), not here.

## Quick start (new default module — rare)

1. Copy `config/` or `roles/` to `modules/<your-id>/`.
2. Edit `index.ts`, `tables.ts`, `blueprints.ts`, and add screens/hooks.
3. Enable via **Developer → Modules** or `src/config/enabledModules.ts`.
4. Read **Documentation → Modules** in the app for the full authoring guide.

## Custom features

See [module-repos/README.md](../module-repos/README.md) and [docs/module-repos.md](../docs/module-repos.md).

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
- **GitHub repos in this folder:** [docs/module-repos.md](../docs/module-repos.md) (git submodules)
- **npm packages:** [docs/external-modules.md](../docs/external-modules.md)
