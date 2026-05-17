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
