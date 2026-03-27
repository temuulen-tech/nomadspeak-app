# NomadSpeak Android Identity + Versioning (Play Store)

## App identity baseline
- **Public app name (launcher/listing):** `NomadSpeak`
- **Android package / `applicationId`:** `com.nomadspeak.mobile`
- **Android `namespace`:** `com.nomadspeak.mobile`
- **Web/package manifest name (repo):** `@nomadspeak/mobile-app`
- **Policy URL file in repo:** `privacy-policy.html`
- **Stability rule:** Once first Play release is uploaded, do not change package id.

## Versioning policy
- **`versionCode`:** Integer, strictly increasing for every uploaded AAB.
- **`versionName`:** Semantic version string `MAJOR.MINOR.PATCH` (example: `1.0.0`).
- **Release rule:**
  - Patch (`x.y.Z`) for bug fixes/no gameplay-flow changes.
  - Minor (`x.Y.z`) for feature additions keeping compatibility.
  - Major (`X.y.z`) for large or breaking behavior shifts.

## Current implemented baseline
- `versionCode`: `1`
- `versionName`: `1.0.0`
- Manifest/app label source: `@string/app_name` (single source for launcher label consistency)

## Founder-input checklist before production submission
- Final Play Store **developer name** (individual vs organization)
- Public **support email** and **website URL**
- Public/privacy **contact address** (if required by region)
- Decision on **release track mapping** (internal/closed/open/production)

## Notes for future native builds
- If flavor dimensions are introduced later, all tracks must still keep monotonic `versionCode` values.
- Keep this file in sync with Gradle app module config whenever identity/versioning changes.
