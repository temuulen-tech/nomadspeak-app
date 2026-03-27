# NomadSpeak Play Data Safety Draft

Status: **Updated implementation-aligned draft (March 27, 2026)**.

## App identifiers in scope
- App name: **NomadSpeak**
- Android package (`applicationId`): **`com.nomadspeak.mobile`**
- Privacy policy source: **`privacy-policy.html`**

## Data collection mapping (current baseline)

### 1) Collected and stored on device
**Data type:** App activity / progress + app preferences  
**Examples:** lesson progress, score, streak, unlocked state, local preferences  
**Purpose:** App functionality (restore sessions and progress continuity)  
**Required:** Yes  
**Shared with third parties:** No  
**Sold:** No

### 2) Runtime diagnostics/state (local)
**Data type:** Temporary runtime flags used by app flow  
**Storage:** In-memory and potentially local storage for continuity  
**Purpose:** App operation and stability  
**Shared with third parties:** No  
**Sold:** No

## Intended Play Data Safety answers (if unchanged at release time)
- **Does your app collect or share any user data?** Yes (limited app activity/preferences for functionality).
- **Is any collected data shared with third parties?** No.
- **Is any data sold?** No.
- **Is all user data encrypted in transit?** Yes, where network transmission occurs in production.
- **Can users request that data is deleted?** Yes, by clearing app storage/uninstalling for current on-device model.

## Policy alignment checks
- Privacy policy declares:
  - functional progress/preference data handling,
  - no sale/no ad-data sharing baseline,
  - user deletion controls,
  - placeholders for legal contact details.

## Mandatory founder decisions before Play submission
1. Confirm whether any SDKs will be added before launch (analytics, crash reporting, auth, ads).
2. Provide final support email, legal publisher name, and policy contact details.
3. Confirm target audience/children settings and whether the Families policy path applies.
4. Confirm whether future server-side sync/accounts will launch in v1 (would change Data Safety answers).

## Pre-submission re-validation checklist
- Build final release AAB and inspect merged manifest + dependencies.
- Re-run Data Safety answers against actual shipped SDKs/permissions.
- Confirm privacy policy URL is publicly hosted and exactly matches Play disclosures.
