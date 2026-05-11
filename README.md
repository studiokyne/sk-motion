# SK Motion

Librairie d’animations front-end Studio Kyne pour WordPress / Bricks Builder.

## Installation avec Fluent Snippets

Créer un snippet PHP avec les réglages suivants :

- Type : PHP
- Exécution : front-end uniquement
- Priorité : 20

```php
<?php

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
            selectors: {
                reveal: ".sa-reveal",
                textReveal: ".sa-text-reveal",
                opacity: ".sa-opacity",
                entryBlur: ".sa-entry-blur"
            }
        };',
        'before'
    );
}, 20);
```

## Classes disponibles

### Reveal classique

```html
<div class="sa-reveal">Contenu à révéler</div>
```

### Opacity reveal

```html
<div class="sa-opacity">Contenu à révéler en opacité</div>
```

### Entry blur

```html
<div class="sa-entry-blur">Contenu avec entrée moderne + léger blur</div>
```

### Text reveal

```html
<h2 class="sa-text-reveal">
  Texte avec <span class="text-highlight">highlight</span>
</h2>
```

## Debug

Ajouter `?saDebug` à l’URL pour afficher les markers ScrollTrigger.

Exemple :

```txt
https://monsite.com/?saDebug
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
