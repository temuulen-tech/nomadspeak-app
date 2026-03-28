# Android wrapper path (Capacitor-aligned, runnable prep)

This folder is aligned to a Capacitor-style Android project shape and uses a deterministic local web-asset packaging step.

## Verified baseline
- Package/application id + namespace are `com.nomadspeak.mobile`.
- `MainActivity` extends Capacitor `BridgeActivity`.
- Launcher label is `NomadSpeak` via `@string/app_name`.
- Adaptive icon + splash resource files are wired in `res/`.
- Bundled web payload location is `android/app/src/main/assets/public`.
- Runtime Capacitor config in native assets exists at `android/app/src/main/assets/capacitor.config.json`.

## Local web asset packaging
From repo root:

```bash
npm run android:prepare:web
```

This copies the web app into:

```text
android/app/src/main/assets/public
```

## Android build commands
> Use JDK 17 for Android Gradle Plugin compatibility.

Debug APK:

```bash
npm run android:assemble:debug
```

Release AAB:

```bash
npm run android:bundle:release
```

## Remaining release blockers
1. Gradle wrapper files are not committed (`android/gradlew`, `android/gradle/wrapper/*`).
2. Signing config/keystore is not configured yet for release builds.
3. This environment cannot fetch Gradle/Maven dependencies (HTTP 403), so a local machine/CI with Maven access is required for the first successful build.

## Recommended next step
On a machine with Maven access and JDK 17:
1. Generate Gradle wrapper (`gradle wrapper`) from `android/`.
2. Run `npm run android:prepare:web`.
3. Run `./gradlew bundleRelease` and sign/upload via Play Console.
