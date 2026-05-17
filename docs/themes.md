# App themes

The shell supports multiple themes (light, dark, and your own). Each theme sets **CSS variables** on `<html>` and a matching **MUI palette**.

## Switch theme

Avatar menu → **Appearance** → pick a theme. Choice is stored in `localStorage` (`app.themeId.v1`).

## Add a new theme (3 steps)

1. **Copy the template**

   ```bash
   cp src/lib/theme/definitions/_themeTemplate.ts src/lib/theme/definitions/ocean.ts
   ```

2. **Edit** `ocean.ts` — set `id`, `label`, `mode`, `cssVars`, and `palette` (see comments in the template).

3. **Register** in `src/lib/theme/definitions/index.ts`:

   ```ts
   import { oceanTheme } from './ocean.ts'

   export const appThemes = [lightTheme, darkTheme, oceanTheme]
   ```

Reload the app; the new theme appears in the avatar menu.

## What to customize

| Layer | File / API | Purpose |
|-------|------------|---------|
| Design tokens (fonts, raw palette) | `src/tokens.css` | Shared Figma-style variables |
| Theme semantic surfaces | `cssVars` in theme definition | `body` background, borders, chrome |
| MUI components | `palette` in theme definition | Papers, tables, inputs, typography contrast |
| App chrome (header, menu, palette) | `--app-chrome-*` in `sharedPalette.ts` or per theme | Brand bar stays consistent unless you override |

## Files

- `src/lib/theme/definitions/` — one file per theme
- `src/lib/theme/createMuiTheme.ts` — builds MUI theme from definition
- `src/lib/theme/applyTheme.ts` — applies `data-theme` + CSS vars
- `src/context/AppThemeProvider.tsx` — React provider + persistence

## Preview

**Developer → MUI theme** shows components with the **active** theme from the avatar menu.
