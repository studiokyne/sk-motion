# SK Motion

[![npm](https://img.shields.io/npm/v/@studiokyne/sk-motion?color=111111&label=npm&logo=npm)](https://www.npmjs.com/package/@studiokyne/sk-motion)
[![bundle](https://img.shields.io/badge/bundle-iife-111111)](#)
[![gsap](https://img.shields.io/badge/GSAP-3.15+-111111)](https://gsap.com/)
[![vite](https://img.shields.io/badge/Vite-8+-111111)](https://vitejs.dev/)

Librairie d’animations front-end Studio Kyne pour WordPress / Bricks Builder.

Tags: WordPress, Bricks Builder, GSAP, ScrollTrigger, SplitText, Lenis, IIFE

## Apercu rapide

- Animations GSAP prêtes a l'emploi pour le contenu editorial.
- ScrollTrigger optimise avec SplitText et Lenis.
- Config simple via `window.SKMotionConfig` ou `StudioKyneMotion.init()`.
- Respect de `prefers-reduced-motion`.

## Installation avec Fluent Snippets

Créer un snippet PHP avec les réglages suivants :

- Nom : SK Motion
- Type : PHP
- Exécution : front-end uniquement
- Priorité : 20

```php
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) {
        return;
    }

    $sk_motion_url = 'https://cdn.jsdelivr.net/npm/@studiokyne/sk-motion@latest/dist/sk-motion.full.iife.min.js';

    wp_enqueue_script(
        'sk-motion',
        $sk_motion_url,
        [],
        null,
        [
            'strategy'  => 'defer',
            'in_footer' => true,
        ]
    );

    wp_add_inline_script(
        'sk-motion',
        'window.SKMotionConfig = {
            debug: new URLSearchParams(window.location.search).has("saDebug"),
            smoothScroll: true,
            forceTopOnBoot: true,
            startAt: "top 98%",
            reduceMotion: "auto",
            highlightEnd: "top 60%",
            selectors: {
                reveal: ".sk-reveal",
                textReveal: ".sk-text-lines",
                opacity: ".sk-fade",
                entryBlur: ".sk-entry-blur",
                textHighlightWords: ".sk-text-highlight-words",
                textHighlightChars: ".sk-text-highlight-chars"
            }
        };',
        'before'
    );
}, 20);
```

## Classes disponibles

### Reveal classique

```html
<div class="sk-reveal">Contenu à révéler</div>
```

### Fade (opacity)

```html
<div class="sk-fade">Contenu à révéler en opacité</div>
```

### Entry blur

```html
<div class="sk-entry-blur">Contenu avec entrée moderne + léger blur</div>
```

### Text reveal (lines)

```html
<h2 class="sk-text-lines">Texte reveal ligne par ligne</h2>
```

### Text highlight (words)

```html
<p class="sk-text-highlight-words">Texte highlight mot par mot</p>
```

### Text highlight (chars)

```html
<p class="sk-text-highlight-chars">Texte highlight lettre par lettre</p>
```

## Debug

Ajouter `?saDebug` à l’URL pour afficher les markers ScrollTrigger.

Exemple :

```txt
https://monsite.com/?saDebug
```

## Accessibilité

`prefers-reduced-motion: reduce` est respecté. Les animations sont désactivées et le contenu reste visible.

## Configuration

Vous pouvez configurer la librairie via `window.SKMotionConfig` ou `StudioKyneMotion.init({ ... })`.

- `debug` (boolean, defaut: detecte via `?saDebug`) : active les markers ScrollTrigger.
- `smoothScroll` (boolean, defaut: true) : active Lenis.
- `forceTopOnBoot` (boolean, defaut: true) : force un scroll top au chargement.
- `startAt` (string, defaut: "top 98%") : position de declenchement ScrollTrigger.
- `highlightEnd` (string, defaut: "top 60%") : fin du reveal des highlights en mode scrub.
- `ease` (string, defaut: "smoothKyne") : easing GSAP utilise.
- `waitForFonts` (boolean, defaut: true) : attend le chargement des webfonts avant d'initialiser.
- `fontReadyTimeout` (number ms, defaut: 1500) : timeout max pour l'attente des fonts.
- `selectors` (object) : mapping des classes CSS.
  - `reveal`, `textReveal`, `opacity`, `entryBlur`, `textHighlightWords`, `textHighlightChars`.
- `autoInit` (boolean, defaut: true) : desactive l'auto-init si `false`.
- `reduceMotion` ("auto" | boolean, defaut: "auto") :
  - `"auto"` respecte `prefers-reduced-motion`.
  - `true` force la reduction (pas d'animations).
  - `false` force les animations.

## Fonctions console

Relancer le scan :

```js
window.__skMotionScan();
```

Rafraîchir ScrollTrigger :

```js
window.__skMotionRefresh();
```

Voir la version :

```js
window.StudioKyneMotion.version;
```

## Mise à jour

Pour publier une correction :

```bash
git commit -m "fix: corrige le text reveal"
git push
```

Pour publier une nouvelle fonctionnalité :

```bash
git commit -m "feat: ajoute une nouvelle animation"
git push
```

Pour publier un changement cassant :

```bash
git commit -m "feat!: change la configuration globale"
git push
```
