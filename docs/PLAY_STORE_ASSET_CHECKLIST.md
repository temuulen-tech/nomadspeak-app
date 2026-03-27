# NomadSpeak Play Store Screenshot + Asset Checklist

Status: **Submission checklist draft (March 27, 2026)**.

Use this checklist while preparing the Play Console Store Listing and App Content sections.

## 1) Core listing graphics

### App icon (required)
- [ ] 512 x 512 PNG
- [ ] Max 1024 KB
- [ ] No transparent background where Play policy disallows ambiguity
- [ ] Matches launcher branding used in app

### Feature graphic (recommended / commonly required for discoverability)
- [ ] 1024 x 500 JPG/PNG
- [ ] Clear “NomadSpeak” branding
- [ ] Communicates English-learning purpose (not unrelated art)

## 2) Phone screenshots (required)

Recommended first-pass capture set (at least 4, target 6–8):
- [ ] Home/progression entry screen
- [ ] Lesson gameplay screen
- [ ] QA/quiz screen
- [ ] Sentence activity screen
- [ ] Progress/continuity state example
- [ ] Optional: world/chapter selection context

Capture requirements and quality bar:
- [ ] 16:9 or 9:16 aspect ratio supported by Play requirements
- [ ] Minimum side lengths compliant with current Play Console constraints
- [ ] No debug overlays, placeholder dev text, or clipping
- [ ] Consistent language and branding across all screenshots

## 3) Optional device-class assets (only if targeting those form factors)

- [ ] 7-inch tablet screenshots
- [ ] 10-inch tablet screenshots
- [ ] Chromebook screenshots
- [ ] TV assets (if Android TV distribution is enabled)

If not supporting these devices in v1, do not upload mismatched assets.

## 4) Policy-aligned text assets to pair with visuals

- [ ] Final app title (from listing package options)
- [ ] Short description (Play Store)
- [ ] Full description (Play Store)
- [ ] Privacy Policy public URL
- [ ] Contact/support email
- [ ] Data Safety answers consistent with shipped build

## 5) Content quality checks before upload

- [ ] All screenshots reflect real current app behavior (no mock UI claims)
- [ ] No mention of unshipped features (accounts, live tutors, certificates, etc.)
- [ ] Language targets Mongolian learners while remaining clear in English listing
- [ ] Icon, feature graphic, and screenshot style feel like one brand family

## 6) Founder-provided source pack needed

Founders should provide (or approve) the following files/text before final submission:
- [ ] Final logo/icon master source (editable format + export rights)
- [ ] Final feature graphic source file
- [ ] Final screenshot set from release-candidate build
- [ ] Final title choice and store copy approval
- [ ] Legal contact details + support mailbox
- [ ] Public hosted privacy policy URL confirmation

## 7) Suggested folder layout for handoff assets

Store raw + export files in one canonical location for repeatable updates:

- `assets/store/play/raw/` (editable source files)
- `assets/store/play/export/` (final upload-ready PNG/JPG)
- `assets/store/play/export/screenshots-phone/`
- `assets/store/play/export/feature-graphic/`
- `assets/store/play/export/icon/`

(If this folder structure is adopted, add a small README describing ownership and export presets.)
