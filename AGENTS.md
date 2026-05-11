---
description: "Use when: working on the SK Motion library in this repo; build/release guidance and key file locations."
---

# SK Motion Agent Notes

## Quick start

- Primary entry point: [src/index.js](src/index.js)
- Build: `pnpm build`
- Release (semantic-release): `pnpm release`

## Key behaviors

- Global config is merged in order: defaults -> `window.SKMotionConfig` -> `init(userConfig)`.
- Auto-init runs unless `window.SKMotionConfig.autoInit === false`.
- Public API is `window.StudioKyneMotion` with `init()` and `version`.
- Rescan helpers are exposed on `window.__skMotionScan()` and `window.__skMotionRefresh()`.

## Release details

- Version is injected at build time via `SK_MOTION_VERSION` (see [release.config.cjs](release.config.cjs)).
- Built output is `dist/sk-motion.full.iife.min.js`.

## Docs

- Usage and WordPress install snippet: [README.md](README.md)
