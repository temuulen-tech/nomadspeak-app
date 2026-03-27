# NomadSpeak Play Store Readiness Audit

## Scope and constraints
- Keep current gameplay and app flow unchanged.
- Focus this phase on release-path readiness for Google Play.
- Treat existing web/PWA deployment as the source baseline.

## What is already done

### Web app + PWA baseline
- App has a valid web app manifest with standalone display mode, portrait orientation, theme/background colors, and app name metadata.
- `index.html` includes PWA wiring (`manifest`, app icons, mobile-web-app-capable meta tags).
- Service worker registration exists in production-safe paths and is disabled in wrapper-like runtimes to reduce WebView/service-worker instability.
- `service-worker.js` has app-shell pre-cache and runtime caching for static assets + navigation fallback behavior.
- Vercel rewrites/headers are configured for SPA routes and manifest/service worker serving.

### Install/offline baseline
- Install prompt handling is present in bootstrap code (`beforeinstallprompt` flow).
- Core app shell assets are explicitly listed in cache manifest, providing first-level offline shell behavior for previously cached resources.

## Gaps to Play Store release candidate

### Critical missing items (must-have before submission)
1. **Android app wrapper is present but not yet build-complete**
   - Android scaffold now exists with package id and Capacitor-aligned activity/config.
   - Build wrapper tooling is still incomplete (missing committed Gradle wrapper files + finalized signing flow).

2. **Store-required policy surface is missing**
   - No public Privacy Policy URL/page in repository or app metadata.
   - No Play Data Safety mapping document (what data is collected, shared, encrypted, deletion behavior).

3. **Play-compliant icon/splash assets are not ready**
   - Current PWA icons are SVG-only (`icon-192.svg`, `icon-512.svg`), while Android launcher/adaptive icon pipelines require PNG/XML asset sets.
   - No Android splash resources (Android 12+ splash configuration, background/icon layers).

4. **App identity/package readiness (now baseline-defined)**
   - Finalized package namespace/application id baseline: `com.nomadspeak.mobile`.
   - Versioning policy baseline documented (`versionCode`/`versionName`) and must be kept in sync for releases.

### Medium missing items (recommended before production rollout)
1. **Offline expectation hardening**
   - Current caching is network-first for navigation; first-run offline behavior after a fresh install can still fail if shell not yet cached.
   - No explicit offline fallback UX/page for network-dependent actions.

2. **Production asset structure for Android pipeline**
   - No canonical source folder for store graphics and generated outputs.
   - No scripted asset generation path (foreground/background adaptive icon layers, notification icon, feature graphic references).

3. **Release operations docs/checklists**
   - No `PLAY_STORE_RELEASE.md` describing build/sign/upload steps.
   - No QA gate checklist for Android-specific smoke tests (cold start, restore, orientation lock, back button, offline reopen).

## Cleanest path recommendation

### Recommended primary path: Capacitor wrapper over existing web app
Why this is cleanest for current state:
- Preserves current web codebase and gameplay logic with minimal disruption.
- Supports Play Store packaging, signing, splash/icon resources, and native lifecycle behavior.
- Allows either bundled web assets for reliable offline baseline or remote-hosted mode for rapid web updates.

### Suggested strategy
1. Start with **bundled web assets** inside Capacitor for predictable launch and offline shell reliability.
2. Keep Vercel HTTPS deployment as canonical web environment for QA and emergency fallback.
3. Add native-only layer incrementally (icons/splash/package/signing/policies), avoiding gameplay refactors.

### Alternative path (secondary)
- Trusted Web Activity (TWA) can be faster initially but is less flexible for native polish and can complicate offline/install expectations for a game-like app. Use only if you want browser-first distribution with minimal native packaging.

## Suggested implementation order
1. **Decide app identity and policy**
   - Final app name, package id, privacy policy URL, data-safety draft.
2. **Complete Android wrapper generation (Capacitor)**
   - Re-generate with `npx cap add android`, then keep custom resources/versioning aligned.
3. **Add icon/splash pipelines**
   - Create source assets + generated Android resources.
4. **Lock offline/install behavior**
   - Validate first launch, offline relaunch, and cached shell behavior in Android builds.
5. **Create release documentation + checklists**
   - Build/signing/upload instructions and QA gates.
6. **Produce internal release candidate (AAB)**
   - Internal testing track before closed/open testing.


## Listing materials status (new in this phase)
- Draft Play Store listing copy package: `docs/PLAY_STORE_LISTING_PACKAGE.md`
- Draft screenshot/asset submission checklist: `docs/PLAY_STORE_ASSET_CHECKLIST.md`
- These are first-pass materials and require founder approvals for final publication fields.

## Exact files likely needed next

### New files (web + process)
- `docs/play-store-readiness-audit.md` (this file)
- `docs/PLAY_STORE_RELEASE_CHECKLIST.md`
- `docs/PRIVACY_POLICY_DRAFT.md`
- `public/privacy-policy.html` (or `privacy/index.html` depending hosting layout)
- `assets/store/android/icon-source-1024.png`
- `assets/store/android/adaptive-foreground-1024.png`
- `assets/store/android/adaptive-background-1024.png`
- `assets/store/android/splash-2732x2732.png`

### New files (Android/Capacitor path)
- `package.json` (if adopting Capacitor tooling)
- `capacitor.config.ts`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/themes.xml`
- `android/app/src/main/res/drawable/splash.xml`

### Existing files likely to update
- `manifest.json` (finalized names/icons/short_name consistency)
- `index.html` (privacy policy link surface and metadata alignment)
- `service-worker.js` (optional offline fallback hardening)
- `README.md` (add Android release path quickstart)
