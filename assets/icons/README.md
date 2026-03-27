# NomadSpeak app branding assets

This directory now separates **release-ready placeholders** from gameplay/reward artwork.

## Current release path naming
- `nomadspeak-app-icon-192.svg`: web favicon/PWA baseline icon.
- `nomadspeak-app-icon-512.svg`: web install icon (`purpose: any`).
- `nomadspeak-app-icon-512-maskable.svg`: PWA maskable icon placeholder (`purpose: maskable`).

## Android wrapper mapping
Android launcher/splash drawables live in `android/app/src/main/res/` and use shared brand colors:
- `drawable/ic_launcher_background.xml`
- `drawable/ic_launcher_foreground.xml`
- `drawable/splash_background.xml`
- `drawable/splash_foreground.xml`

## Founder-provided final sources still needed
For Play Store-ready final art export, replace placeholders with source assets from design:
1. Master launcher icon source (SVG/AI/Figma export) that is safe for adaptive icon cropping.
2. Full-size splash logo source (transparent foreground).
3. Play listing marketing graphics (feature graphic, screenshots, optional promo images).
4. Optional monochrome launcher icon source for Android themed icons.

## Legacy compatibility files
`icon-192.svg` and `icon-512.svg` are kept for backward compatibility with older docs/scripts.
