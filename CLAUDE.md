# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build      # compile src/index.js → dist/sk-motion.full.iife.min.js (IIFE, minified via oxc)
pnpm release    # semantic-release: bumps version, builds, publishes to npm, creates GitHub release
```

There are no test commands — this library has no test suite.

## Architecture

Single-file library: all logic lives in [src/index.js](src/index.js). Vite bundles it as an IIFE (`StudioKyneMotion`) targeting WordPress/Bricks Builder sites loaded via CDN.

**Config resolution order:** `DEFAULT_CONFIG` → `window.SKMotionConfig` → `StudioKyneMotion.init(userConfig)`. `animations` and `selectors` are deep-merged; other keys are shallow-merged.

**Animation pattern:** every scroll animation uses `initBatchAnimation()` which:
1. Marks elements with `data-sk-init` to prevent double-init.
2. Sets initial state via `gsap.set`.
3. Registers a `ScrollTrigger.batch` (fires once on enter).
4. If `reduceMotion` is `true`, skips GSAP and just reveals content immediately.

Text animations (`sk-text-lines`, `sk-text-highlight-words`, `sk-text-highlight-chars`) bypass `initBatchAnimation` and use `SplitText` individually per element.

**CSS injection:** `injectCSSOnce()` inserts a `<style id="sk-motion-css">` tag on first `init()`. No external stylesheet is shipped.

**Smooth scroll:** Lenis is wired into GSAP's ticker and exposed as `window.__lenis`.

**Release:** `SK_MOTION_VERSION` env var is injected at build time via `vite.config.js` `define`. semantic-release sets this in `release.config.cjs` before calling `pnpm build`. Commit messages drive version bumps: `fix:` → patch, `feat:` → minor, `feat!:` / breaking footer → major.

## Key globals exposed

- `window.StudioKyneMotion` — `{ init, version }`
- `window.__skMotionScan()` — re-scans DOM for uninitialized elements
- `window.__skMotionRefresh()` — calls `ScrollTrigger.refresh()`
- `window.__lenis` — the Lenis instance (when smooth scroll is active)
- `window.SKMotionConfig` — set before script load to configure without calling `init()`
