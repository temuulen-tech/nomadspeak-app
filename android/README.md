# Android local build verification (Capacitor wrapper)

This folder is aligned to a Capacitor Android project shape and uses a deterministic local web-asset packaging step.

## Verified baseline
- Package/application id + namespace are `com.nomadspeak.mobile`.
- `MainActivity` extends Capacitor `BridgeActivity`.
- Launcher label is `NomadSpeak` via `@string/app_name`.
- Bundled web payload location is `android/app/src/main/assets/public`.
- Runtime Capacitor config in native assets exists at `android/app/src/main/assets/capacitor.config.json`.

## Environment assumptions (required)
1. **Node.js + npm** installed (to run project scripts).
2. **JDK 17** active in shell when running Gradle.
   - AGP `8.7.3` in this project expects Java 17-compatible tooling.
   - Java 21/25 can fail with class-version errors during Gradle script evaluation.
3. **Android Studio** installed with Android SDK + platform/build-tools matching `compileSdk/targetSdk 35`.
4. **Gradle availability**:
   - Preferred: committed `android/gradlew` + `android/gradle/wrapper/*`.
   - Current fallback: system `gradle` (because wrapper files are not committed yet).

## Exact local verification commands
Run from repo root unless noted.

### 1) Build and stage web assets for Android
```bash
npm run android:prepare:web
```

### 2) Sync Capacitor Android project (only needed after Capacitor/plugin/native config changes)
```bash
npm run cap:update:android
```

### 3) Build debug APK
```bash
npm run android:assemble:debug
```

### 4) Build release AAB (unsigned unless signing config is added)
```bash
npm run android:bundle:release
```

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
   (or `gradle bundleRelease` until wrapper is committed).

## Current blockers to an upload-ready signed build
1. `android/gradlew` and `android/gradle/wrapper/*` are not committed (wrapper bootstrap still required).
2. Release signing configuration/keystore wiring is not yet configured in `android/app/build.gradle`.
3. Local Java must be pinned to JDK 17 for reliable AGP 8.7.3 builds.
