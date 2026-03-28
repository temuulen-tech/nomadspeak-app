# Android local build verification (Capacitor wrapper)

This folder is aligned to a Capacitor Android project shape and uses a deterministic local web-asset packaging step.

## Verified baseline
- Package/application id + namespace are `com.nomadspeak.mobile`.
- `MainActivity` extends Capacitor `BridgeActivity`.
- Launcher label is `NomadSpeak` via `@string/app_name`.
- Bundled web payload location is `android/app/src/main/assets/public`.
- Runtime Capacitor config in native assets exists at `android/app/src/main/assets/capacitor.config.json`.

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
