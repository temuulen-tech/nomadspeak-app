# NomadSpeak Android Identity + Versioning (Play Store)

## App identity
- **Public app name:** NomadSpeak
- **Android package / `applicationId`:** `com.nomadspeak.app`
- **Namespace policy:** Keep package id stable forever once first Play release is uploaded.

## Versioning policy
- **`versionCode`:** Integer, strictly increasing for each uploaded AAB.
- **`versionName`:** Semantic style string `MAJOR.MINOR.PATCH` (example: `1.0.0`).
- **Release rule:**
  - Patch (`x.y.Z`) for bug fixes/no gameplay-flow changes.
  - Minor (`x.Y.z`) for feature additions keeping compatibility.
  - Major (`X.y.z`) for large or breaking behavior shifts.

## Initial release target
- **First Play internal track target:**
  - `versionCode`: `1`
  - `versionName`: `1.0.0`

## Notes for future native builds
- If flavor dimensions are introduced later, all tracks must still keep monotonic `versionCode` values.
- Keep this file in sync with Gradle app module config once `android/` is generated.
