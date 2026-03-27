# NomadSpeak Play Data Safety Draft

Status: **Initial draft for Play Console Data Safety form**.

## Data collection mapping (current web baseline)

### Collected on device
1. **App activity / progress data**
   - Examples: lesson progress, score, streak, unlocked rewards, local app preferences.
   - Storage: Local browser/app storage on the user device.
   - Purpose: App functionality (gameplay progress and session continuity).
   - Shared with third parties: **No**.

2. **Diagnostics (limited, local runtime state)**
   - Examples: temporary runtime flags used for UI/gameplay flow.
   - Storage: Volatile runtime memory and/or local storage for app continuity.
   - Shared with third parties: **No**.

## Data handling declarations (intended Play answers)
- **Data shared:** No.
- **Data sold:** No.
- **Data processed ephemerally only:** No (progress is stored to keep continuity).
- **Required for app functionality:** Yes (progress/state data only).
- **Encryption in transit:** Yes, production delivery uses HTTPS.
- **Deletion request mechanism:** User can clear local app/browser storage to remove on-device progress data.

## Follow-up before submission
- Re-validate against final Capacitor Android build behavior.
- Re-validate any analytics/crash SDK decisions (none included in this draft).
- Ensure Privacy Policy language exactly matches these declarations.
