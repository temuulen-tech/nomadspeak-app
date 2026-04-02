# Android local build verification (Capacitor wrapper)

This folder is aligned to a Capacitor Android project shape and uses a deterministic local web-asset packaging step.

## Verified baseline
- Package/application id + namespace are `com.nomadspeak.mobile`.
- `MainActivity` extends Capacitor `BridgeActivity`.
- Launcher label is `NomadSpeak` via `@string/app_name`.
- Bundled web payload location is `android/app/src/main/assets/public`.
- Runtime Capacitor config in native assets exists at `android/app/src/main/assets/capacitor.config.json`.

## Temporary host-isolation test page switch
Use this when debugging Android narrow-width rendering:

1. Open `android/app/src/main/java/com/nomadspeak/mobile/MainActivity.java`.
2. Set `ENABLE_HOST_ISOLATION_TEST_PAGE = true`.
3. Rebuild/reinstall the Android app.

When enabled, app startup is redirected to `/host-isolation-test.html`, which is a standalone page (no NomadSpeak shell/router/CSS) that renders viewport width metrics directly in the same Android WebView host.

To return to normal app startup, set `ENABLE_HOST_ISOLATION_TEST_PAGE = false` and rebuild.

## Required Gradle wrapper files (must exist in repo)
For reliable Android builds without depending on a developer's global Gradle install, commit all of:
- `android/gradlew`
- `android/gradlew.bat`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradle/wrapper/gradle-wrapper.jar` (binary bootstrap jar)

## Environment assumptions (required)
1. **Node.js + npm** installed (to run project scripts).
2. **JDK 17** active in shell when running Gradle.
   - AGP `8.7.3` in this project expects Java 17-compatible tooling.
   - Java 21/25 can fail with class-version errors during Gradle script evaluation.
3. **Android Studio** installed with Android SDK + platform/build-tools matching `compileSdk/targetSdk 35`.
4. **Gradle wrapper preferred**:
   - Build scripts already call `./gradlew` first.
   - Temporary fallback to system `gradle` remains until wrapper files are committed.

## Codex PR path note (current blocker)
- Text wrapper files (`gradlew`, `gradlew.bat`, `gradle-wrapper.properties`) can be merged in Codex normally.
- The binary wrapper bootstrap (`gradle-wrapper.jar`) is the blocker in this Codex diff/merge path and should be finalized with a direct git push outside Codex.

## Exact local verification commands
Run `npm install` first so local Capacitor tooling is available before running sync/update scripts.
Run from repo root unless noted.

### 1) Build and stage web assets for Android
```bash
npm run build
```
(`build` is a local alias to `android:prepare:web`.)

### 2) Generate/update Gradle wrapper locally (one-time or when Gradle version changes)
```bash
npm run android:wrapper:init
```

### 3) Sync Capacitor Android project (only needed after Capacitor/plugin/native config changes)
```bash
npm run cap:sync:android
```
(`cap:sync:android` aliases `cap:update:android`, which matches this project's current Android asset workflow.)

### 4) Build debug APK
```bash
npm run android:assemble:debug
```

### 5) Build release AAB (unsigned unless signing config is added)
```bash
npm run android:bundle:release
```

## Minimal fallback to finalize wrapper files outside Codex
If the PR path cannot carry `gradle-wrapper.jar`, run these exact commands locally and push to the same branch:

```bash
npm install
npm run android:wrapper:init
git add android/gradlew android/gradlew.bat android/gradle/wrapper/gradle-wrapper.properties android/gradle/wrapper/gradle-wrapper.jar
git commit -m "Add Android Gradle wrapper bootstrap files"
git push
```

Then re-run CI/PR checks.

## Release signing prerequisites (Play Store)
Before producing the upload-ready Play Store artifact, configure all of the following:

1. Create release keystore (`.jks`/`.keystore`) and keep it outside version control.
2. Provide signing values (store file/password + key alias/password), typically via `keystore.properties` and Gradle `signingConfigs`.
3. Wire the release build type to `signingConfig signingConfigs.release` in `android/app/build.gradle`.
4. Verify incrementing `versionCode` and release `versionName` policy per upload.
5. Run final signed bundle build from `android/`:
   ```bash
   ./gradlew bundleRelease
   ```

## Current blockers to an upload-ready signed build
1. `android/gradlew` and `android/gradle/wrapper/*` must be committed (including `gradle-wrapper.jar`).
2. Release signing configuration/keystore wiring is not yet configured in `android/app/build.gradle`.
3. Local Java must be pinned to JDK 17 for reliable AGP 8.7.3 builds.

## Windows PowerShell `npx.ps1` execution-policy fix
If PowerShell shows `npx.ps1 cannot be loaded because running scripts is disabled on this system`, the shell is blocking PowerShell script shims from npm.

### Safest practical local fix (current shell only)
Run this once in the same PowerShell window before Capacitor commands:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

This changes policy only for the current session and resets when that window closes.

### Persistent per-user fix (optional)
If you want PowerShell shims to work in future sessions without re-running the process command:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Commands for this project on Windows
From repo root:

```powershell
npm install
npm run build
npm run cap:copy:android
npm run cap:sync:android
npm run cap:open:android
```

### Avoiding the `npx.ps1` shim entirely
This repo now exposes Capacitor scripts that invoke the CLI with `node` directly, so they work even when PowerShell script shims are restricted.

You can also run from Command Prompt (`cmd.exe`) instead of PowerShell:

```cmd
npm run build
npm run cap:copy:android
npm run cap:sync:android
```

### Asset flow note for this project
`npm run build` runs `scripts/android/prepare-web-assets.mjs`, which copies web files directly into:
`android/app/src/main/assets/public`

Then `cap copy/sync` updates the native Android project metadata/plugins so Android Studio and device builds use the latest assets.
