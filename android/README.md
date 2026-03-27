# Android wrapper path (Capacitor-aligned, runnable prep)

This folder is now aligned to a **Capacitor-style Android project shape** and includes a real local-web-asset packaging step.

## What is now concrete
- Package/application id is `com.nomadspeak.app`.
- Version baseline is `versionCode 1` / `versionName 1.0.0`.
- `MainActivity` now extends Capacitor `BridgeActivity`.
- Manifest includes `INTERNET` permission and activity config changes expected for a WebView wrapper.
- Android project references `:capacitor-android` from `node_modules`.
- Bundled web payload location is defined at `android/app/src/main/assets/public`.
- `android/app/src/main/assets/capacitor.config.json` is present so the wrapper can resolve runtime config.

## Local prep command
From repo root:

```bash
npm run android:prepare:web
```

This copies the current web app shell/assets into:

```text
android/app/src/main/assets/public
```

## Current blocker to fully installable build
- Gradle wrapper files (`android/gradlew`, `android/gradle/wrapper/*`) are still missing from this scaffold.
- The next setup pass should run `npx cap add android` (or regenerate Android via Capacitor) in an environment where package + Gradle wrapper generation is available.

## Next expected step
1. Regenerate/update Android project with Capacitor tooling (`npx cap add android` or equivalent).
2. Re-apply any project-specific resources (icons/splash/theme) if overwritten.
3. Run a first debug build (`assembleDebug`) and verify cold start + gameplay flow.
