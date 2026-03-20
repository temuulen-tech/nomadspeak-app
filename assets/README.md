# Asset organization rules

This directory is organized to keep future visual insertion predictable without changing gameplay flow.

## Naming rules
- Use lowercase kebab-case for every file and folder.
- Prefix files by asset role when helpful:
  - `world-cover-*` for world/chapter cover art
  - `world-bg-*` for world backgrounds
  - `reward-*` for reward visuals
  - `lesson-*` for lesson visuals
  - `anim-*` for future animation files/config placeholders
  - `icon-*` for app/platform icons
  - `hero-*` or `character-*` for character art
- Keep world/chapter identity in the filename when the asset is specific, e.g. `world-cover-world-1-chapter-2-placeholder.png`.
- Use the `-placeholder` suffix for temporary files that preserve layout/flow until final art is ready.

## Folder rules
- `assets/icons/`: install/app icons only.
- `assets/characters/`: reusable character art.
- `assets/rewards/icons/`: reward progression visuals.
- `assets/visuals/worlds/<theme>/intro/`: world cover or intro visuals.
- `assets/visuals/worlds/<theme>/backgrounds/`: world background images.
- `assets/visuals/lessons/`: lesson-specific illustrations/placeholders.
- `assets/animations/`: future animation-related assets, manifests, or placeholders.
- `assets/audio/`: music, ambience, and future VO/audio assets.

## Code reference rules
- Register new visual/audio assets in `assets.js` first.
- `worlds.js` and `chapters.js` should reference stable asset ids, not raw file paths.
- Keep ids aligned with world/chapter structure when possible, such as `world1-cover`, `world1-background`, or `world1-ch2-cover-placeholder`.
- Replace placeholder files without changing ids when the final asset is ready.
