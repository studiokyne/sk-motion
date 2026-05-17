# SK Motion

[![npm](https://img.shields.io/npm/v/@studiokyne/sk-motion?color=111111&label=npm&logo=npm)](https://www.npmjs.com/package/@studiokyne/sk-motion)
[![bundle](https://img.shields.io/badge/bundle-iife-111111)](#)
[![gsap](https://img.shields.io/badge/GSAP-3.15+-111111)](https://gsap.com/)
[![vite](https://img.shields.io/badge/Vite-8+-111111)](https://vitejs.dev/)

Librairie d’animations front-end Studio Kyne pour WordPress / Bricks Builder.

Tags: WordPress, Bricks Builder, GSAP, ScrollTrigger, SplitText, Lenis, IIFE

## Apercu rapide

- Animations GSAP prêtes a l'emploi pour le contenu editorial.
- ScrollTrigger, SplitText et Lenis intégrés avec une config centralisée.
- Personnalisation simple via `window.SKMotionConfig` ou `StudioKyneMotion.init()`.
- Respect de `prefers-reduced-motion`.

## Référence rapide

| Animation            | Classe                     | Usage                                  |
| -------------------- | -------------------------- | -------------------------------------- |
| Reveal               | `.sk-reveal`               | Entrée simple en translation verticale |
| Fade                 | `.sk-fade`                 | Apparition en opacité                  |
| Entry blur           | `.sk-entry-blur`           | Entrée plus premium avec léger blur    |
| Scale in             | `.sk-scale-in`             | Scale léger sans blur                  |
| Scale in blur        | `.sk-scale-in-blur`        | Scale léger avec blur subtil           |
| Counter              | `.sk-counter`              | Compteur SEO-safe                      |
| Hover underline      | `.sk-hover-underline`      | Soulignement au hover                  |
| Text reveal          | `.sk-text-lines`           | Révélation ligne par ligne             |
| Text highlight words | `.sk-text-highlight-words` | Mise en avant mot par mot              |
| Text highlight chars | `.sk-text-highlight-chars` | Mise en avant caractère par caractère  |

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
             highlightEnd: "20%",
             highlightWordStagger: 0.25,
             highlightCharStagger: 0.10,
            animations: {
                reveal: {
                    fromY: 48,
                    duration: 0.65,
                    stagger: 0.1
                },
                opacity: {
                    duration: 0.45,
                    stagger: 0.06
                },
                entryBlur: {
                    fromY: 20,
                    fromBlur: 12,
                    duration: 0.8,
                    stagger: 0.08
                },
                scaleIn: {
                    fromScale: 0.9,
                    duration: 0.55,
                    stagger: 0.08
                },
                scaleInBlur: {
                    fromScale: 0.86,
                    fromBlur: 10,
                    duration: 0.7,
                    stagger: 0.08
                },
                counter: {
                    duration: 1.35
                },
                textReveal: {
                    fromYPercent: 120,
                    duration: 0.95,
                    stagger: 0.08
                },
                highlightWords: {
                    opacity: 0.08
                },
                highlightChars: {
                    opacity: 0.08
                }
            },
            selectors: {
                reveal: ".sk-reveal",
                textReveal: ".sk-text-lines",
                opacity: ".sk-fade",
                entryBlur: ".sk-entry-blur",
                scaleIn: ".sk-scale-in",
                scaleInBlur: ".sk-scale-in-blur",
                counter: ".sk-counter",
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

Options d'animation:

- `animations.reveal.fromY` : distance de départ en pixels.
- `animations.reveal.duration` : durée de l'animation.
- `animations.reveal.stagger` : décalage entre éléments batchés.

### Fade (opacity)

```html
<div class="sk-fade">Contenu à révéler en opacité</div>
```

Options d'animation:

- `animations.opacity.duration` : durée de l'animation.
- `animations.opacity.stagger` : décalage entre éléments batchés.

### Entry blur

```html
<div class="sk-entry-blur">Contenu avec entrée moderne + léger blur</div>
```

Options d'animation:

- `animations.entryBlur.fromY` : distance de départ en pixels.
- `animations.entryBlur.fromBlur` : intensité du blur initial.
- `animations.entryBlur.duration` : durée de l'animation.
- `animations.entryBlur.stagger` : décalage entre éléments batchés.

### Scale in

```html
<div class="sk-scale-in">Bloc qui scale en douceur</div>
```

Options d'animation:

- `animations.scaleIn.fromScale` : scale de départ.
- `animations.scaleIn.duration` : durée de l'animation.
- `animations.scaleIn.stagger` : décalage entre éléments batchés.

### Scale in blur

```html
<div class="sk-scale-in-blur">Bloc qui scale avec un léger blur</div>
```

Options d'animation:

- `animations.scaleInBlur.fromScale` : scale de départ.
- `animations.scaleInBlur.fromBlur` : intensité du blur initial.
- `animations.scaleInBlur.duration` : durée de l'animation.
- `animations.scaleInBlur.stagger` : décalage entre éléments batchés.

### Counter

```html
<div class="sk-counter">1250</div>
```

Le counter lit d'abord la valeur écrite dans le HTML, puis l'anime depuis `0` vers cette cible. Si le texte n'est pas lisible comme nombre, il bascule sur `data-sk-target`.
La valeur HTML reste prioritaire quand elle est valide.

Formats HTML supportés par défaut:

- `1250`
- `1 250`
- `1,250`
- `1.250`
- `1 250,5`
- `1,250.5`

Le SEO reste servi par le contenu source initial tant que la valeur finale est présente dans le HTML.

Attributs et options:

- `data-sk-target` : valeur cible numérique explicite si le texte HTML n'est pas exploitable.
- `data-sk-prefix` : préfixe texte.
- `data-sk-suffix` : suffixe texte.
- `data-sk-decimals` : nombre de décimales forcées.
- `data-sk-duration` : durée de l'animation.
- `animations.counter.duration` : durée par défaut du tween.

Exemple:

```html
<div
  class="sk-counter"
  data-sk-duration="1.4"
  data-sk-prefix="+"
  data-sk-suffix="%"
>
  1 250
</div>
```

### Hover underline

```html
<a href="#" class="sk-hover-underline">Lien souligné au hover</a>
<button type="button" class="sk-hover-underline">
  Bouton souligné au hover
</button>
```

Nom standard recommandé pour la library : `.sk-hover-underline`.

`button-underline` n'est plus supporté. Utilisez uniquement la version `sk-`.

Variables CSS disponibles :

- `--sk-hover-underline-thickness`
- `--sk-hover-underline-offset`
- `--sk-hover-underline-duration`
- `--sk-hover-underline-ease`
- `--sk-hover-underline-color`

### Text reveal (lines)

```html
<h2 class="sk-text-lines">Texte reveal ligne par ligne</h2>
```

Options d'animation:

- `animations.textReveal.fromYPercent` : position de départ en pourcentage.
- `animations.textReveal.duration` : durée de l'animation.
- `animations.textReveal.stagger` : décalage entre les lignes.

### Text highlight (words)

```html
<p class="sk-text-highlight-words">Texte highlight mot par mot</p>
```

Options d'animation:

- `animations.highlightWords.opacity` : opacité initiale des mots.
- `highlightWordStagger` : stagger de révélation des mots.

### Text highlight (chars)

```html
<p class="sk-text-highlight-chars">Texte highlight lettre par lettre</p>
```

Options d'animation:

- `animations.highlightChars.opacity` : opacité initiale des caractères.
- `highlightCharStagger` : stagger de révélation des caractères.

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
- `highlightEnd` (string, defaut: "center") : fin du reveal des highlights en mode scrub.
- `highlightWordStagger` (number, defaut: 0.04) : stagger entre les mots (highlight words).
- `highlightCharStagger` (number, defaut: 0.015) : stagger entre les caracteres (highlight chars).
- `ease` (string, defaut: "smoothKyne") : easing GSAP utilise.
- `waitForFonts` (boolean, defaut: true) : attend le chargement des webfonts avant d'initialiser.
- `fontReadyTimeout` (number ms, defaut: 1500) : timeout max pour l'attente des fonts.
- `animations` (object) : surcharge des animations par famille.
  - `reveal`: `fromY`, `duration`, `stagger`.
  - `opacity`: `duration`, `stagger`.
  - `entryBlur`: `fromY`, `fromBlur`, `duration`, `stagger`.
  - `scaleIn`: `fromScale`, `duration`, `stagger`.
  - `scaleInBlur`: `fromScale`, `fromBlur`, `duration`, `stagger`.
  - `counter`: `duration`.
  - `textReveal`: `fromYPercent`, `duration`, `stagger`.
  - `highlightWords`: `opacity`.
  - `highlightChars`: `opacity`.
- `selectors` (object) : mapping des classes CSS.
  - `reveal`, `textReveal`, `opacity`, `entryBlur`, `scaleIn`, `scaleInBlur`, `counter`, `textHighlightWords`, `textHighlightChars`.
- `autoInit` (boolean, defaut: true) : desactive l'auto-init si `false`.
- `reduceMotion` ("auto" | boolean, defaut: "auto") :
  - `"auto"` respecte `prefers-reduced-motion`.
  - `true` force la reduction (pas d'animations).
  - `false` force les animations.

Exemple complet plus lisible:

```js
window.SKMotionConfig = {
  startAt: "top 92%",
  highlightEnd: "25%",
  highlightWordStagger: 0.18,
  highlightCharStagger: 0.05,
  animations: {
    reveal: {
      fromY: 30,
      duration: 0.5,
      stagger: 0.06,
    },
    scaleIn: {
      fromScale: 0.94,
    },
    counter: {
      duration: 1.5,
    },
  },
};
```

Exemple de surcharge légère:

```js
window.SKMotionConfig = {
  animations: {
    scaleIn: {
      fromScale: 0.95,
      duration: 0.75,
    },
    counter: {
      duration: 1.6,
    },
  },
};
```

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
