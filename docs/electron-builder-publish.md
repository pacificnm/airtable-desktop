# electron-builder publish notes

Optional configuration for shipping installers to users. The starter ships with `electron-builder.yml` for local `npm run dist*` builds; publishing adds signing, update feeds, and CI secrets.

## Prerequisites

- Built app: `npm run dist` (or platform-specific `dist:mac`, `dist:win`, `dist:linux`)
- [electron-builder](https://www.electron.build/) account / tokens for your target store or GitHub Releases
- Code signing certificates (macOS/Windows) for production trust

## Publish block (example)

Add to `electron-builder.yml` when you are ready — **do not commit secrets**; use CI env vars:

```yaml
# publish:
#   provider: github
#   owner: your-org
#   repo: your-repo
#   releaseType: release
#
# Or generic provider:
# publish:
#   provider: generic
#   url: https://downloads.example.com/airtable-desktop/
```

### GitHub Releases

```bash
export GH_TOKEN="…"   # classic PAT with repo scope, or GITHUB_TOKEN in Actions
npm run dist -- --publish always
```

In CI (GitHub Actions), set `GH_TOKEN` from `secrets.GITHUB_TOKEN` or a dedicated release bot token. Tag the commit (`v1.0.0`) so electron-builder attaches artifacts to the release.

### Generic / S3 / custom

```yaml
publish:
  provider: generic
  url: https://your-cdn.example.com/desktop/
```

Upload `release/*` artifacts after `npm run dist`. Users download the installer from that URL; pair with `electron-updater` (not included in the starter) for auto-updates.

## macOS notarization (production)

The starter enables `hardenedRuntime` and entitlements under `build/entitlements.mac.plist`. For distribution outside the Mac App Store you typically also need:

```yaml
mac:
  notarize: true
```

Set in CI:

- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` (or App Store Connect API key vars per electron-builder docs)
- `CSC_LINK` / `CSC_KEY_PASSWORD` for Developer ID signing

## Windows signing

```yaml
win:
  signtoolOptions:
    # certificateSubjectName: "Your Company Inc"
```

Provide `CSC_LINK` (`.pfx`) and `CSC_KEY_PASSWORD` in CI. Unsigned builds run but trigger SmartScreen warnings.

### Windows build failures (no admin / file locks)

**1. `Cannot create symbolic link : A required privilege is not held by the client`**

electron-builder downloads `winCodeSign` and 7-Zip tries to create symlinks inside the cache (`AppData\Local\electron-builder\Cache\winCodeSign\…`). That is **not** your app cert — it is tooling used when `win.signAndEditExecutable` is enabled (default).

This repo sets `win.signAndEditExecutable: false` in `electron-builder.yml` so **unsigned** `npm run dist:win` works without admin. Alternatives if you re-enable executable editing/signing:

- **Settings → System → For developers → Developer Mode** (allows symlinks without elevation), or
- Run **one** build from an **elevated** PowerShell to populate the cache, or
- Pre-extract [winCodeSign-2.6.0.7z](https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z) into the cache folder (see [electron-builder#8149](https://github.com/electron-userland/electron-builder/issues/8149)).

When you ship **signed** builds (`CSC_LINK` set), you may set `signAndEditExecutable: true` again; ensure Developer Mode or a one-time elevated extract first.

**2. `app.asar: The process cannot access the file because it is being used by another process`**

Another process has the previous output open. Common causes:

- **Cursor / VS Code** has a handle on `release\...\app.asar` (file watcher / indexer). Confirm with Sysinternals [Handle](https://learn.microsoft.com/en-us/sysinternals/downloads/handle): `handle64.exe app.asar`
- **Airtable Desktop** still running from `release\win-unpacked\`
- File Explorer preview on `release\`, or antivirus scanning the folder

Fixes:

1. **Reload the editor window** after pulling `.cursorignore` / `.vscode/settings.json` (excludes `release/` from watchers).
2. **Build outside the repo** (works even while Cursor is open):

   ```powershell
   npm run dist:win:safe
   ```

   Installers go to `..\.airtable-desktop-release\` (sibling of the repo folder).
3. Or quit the packed app, close Explorer on `release\`, delete `release\`, then `npm run dist:win`.

## Linux

AppImage from `npm run dist:linux` is unsigned by default. Flathub / distro packaging is a separate pipeline.

## Production build checklist

1. **No debug panel** — default production build (`npm run build`) leaves `VITE_ENABLE_DEBUG_PANEL` unset. For internal QA only: `VITE_ENABLE_DEBUG_PANEL=true npm run build` and launch with `AIRTABLE_DEBUG=1`.
2. **CSP** — production `index.html` includes a strict CSP; Electron main reinforces it for `file://` loads.
3. **Version** — bump `version` in `package.json` before tagging a release.
4. **Secrets** — never embed PATs or OAuth secrets in the renderer bundle; use env at dev time and in-app connection storage.

## Related

- `electron-builder.yml` — targets, `files`, mac/win/linux options
- `README.md` — `npm run dist*` scripts
- [electron.build configuration](https://www.electron.build/configuration)
