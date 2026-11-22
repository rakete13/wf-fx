# WF FX

Bildeffekte per Attribut für Webflow: **Grain**, **Duotone**, **Mesh-Gradient**, **Vignette** und **weicher Rand**. Größtenteils CSS, ohne GSAP, kombinierbar, für CMS-Bilder gemacht. Begleiter zu [WF Anim](https://github.com/rakete13/wf-anim), [WF Slider](https://github.com/rakete13/wf-slider) und [WF Page Transition](https://github.com/rakete13/wf-page-transition).

**Demo:** https://rakete13.github.io/wf-fx/

## Einbau

Eine Zeile in den **Head Code** der Site (Site Settings → Custom Code → Head Code), damit beim Laden nichts flackert:

```html
<script src="https://cdn.jsdelivr.net/gh/rakete13/wf-fx@1.0.2/src/wf-fx.min.js"></script>
```

Alternativ ohne CDN: den Inhalt von [`webflow/head-code.html`](webflow/head-code.html) in den Head Code kopieren (~9.300 Zeichen).

Dann `data-fx` an das Element. **Bei Bildern an den `img-wrapper`, nicht ans Bild**: Grain, Vignette und Duotone legen Ebenen in den Wrapper, und ein `<img>` kann keine aufnehmen. Mehrere Effekte mit Leerzeichen: `data-fx="duotone grain"`.

## Effekte

### Grain

```
img-wrapper   data-fx="grain"  data-fx-grain-strength="0.15"  data-fx-grain-animate
```

| Attribut | Standard | Wirkung |
|---|---|---|
| `data-fx-grain-strength` | `0.14` | Deckkraft des Korns (`0.2` oder `20`) |
| `data-fx-grain-size` | `180` | Kachelgröße in px: kleiner = feiner |
| `data-fx-grain-blend` | `overlay` | Mischmodus: `soft-light`, `multiply`, `screen`, `normal` |
| `data-fx-grain-animate` | aus | Korn flimmert wie Film |

Die Rauschtextur wird als SVG erzeugt, es braucht keine Bilddatei. Funktioniert auf Bildern, Verläufen und Flächen.

### Duotone

```
img-wrapper   data-fx="duotone"  data-fx-duotone-dark="#1d3cff"  data-fx-duotone-light="#f2e8d5"  data-fx-duotone-hover
```

| Attribut | Standard | Wirkung |
|---|---|---|
| `data-fx-duotone-dark` | `#1d3cff` | Farbe der Schatten, auch `var(--brand)` |
| `data-fx-duotone-light` | `#f2e8d5` | Farbe der Lichter |
| `data-fx-duotone-contrast` | `1.1` | Kontrast vor dem Einfärben |
| `data-fx-duotone-hover` | aus | Beim Hover (auf das Element oder einen Link darum) weich in Farbe |
| `data-fx-duotone-speed` | `0.6` | Dauer des Übergangs in s |

Direkt an einem `<img>` geht Duotone auch (per SVG-Filter), dann aber ohne Hover.

### Mesh-Gradient

```
section   data-fx="mesh"  data-fx-mesh-colors="#ff5a1f, #1d3cff, #ffc93d"  data-fx-mesh-base="#f4d7c8"  data-fx-mesh-animate
```

| Attribut | Standard | Wirkung |
|---|---|---|
| `data-fx-mesh-colors` | Orange, Blau | 2 bis 5 Farben, mit Komma getrennt (auch `var(--…)`) |
| `data-fx-mesh-base` | `#e9e6df` | Grundfarbe darunter |
| `data-fx-mesh-size` | `55` | Weichheit der Farbwolken in % |
| `data-fx-mesh-animate` | aus | Farben wandern langsam |
| `data-fx-mesh-speed` | `18` | Dauer eines Durchgangs in s |

Der Verlauf ersetzt den Hintergrund des Elements. Schön kombiniert mit Grain: `data-fx="mesh grain"`.

### Vignette

```
img-wrapper   data-fx="vignette"  data-fx-vignette-strength="0.6"
```

| Attribut | Standard | Wirkung |
|---|---|---|
| `data-fx-vignette-strength` | `0.55` | Stärke |
| `data-fx-vignette-color` | `#000` | Farbe der Ränder |
| `data-fx-vignette-size` | `45` | Wie weit die Mitte frei bleibt, in % |
| `data-fx-vignette-shape` | `ellipse` | oder `circle` |

### Weicher Rand (`fade-edge`)

```
img-wrapper   data-fx="fade-edge"  data-fx-fade-side="bottom"  data-fx-fade-length="30"
```

| Attribut | Standard | Wirkung |
|---|---|---|
| `data-fx-fade-side` | `bottom` | `top`, `left`, `right`, `x` (beide Seiten), `y` (oben und unten), `all` |
| `data-fx-fade-length` | `25` | Länge des Auslaufs in % |

## Gut zu wissen

- **Kombinieren:** alle Effekte frei mischbar, auch mit WF Slider (Effekt am `img-wrapper` in der Slide) und WF Anim (z. B. Parallax am Bild im Wrapper).
- **Bewegung reduzieren:** animiertes Grain und animierter Mesh stehen still.
- **Nachgeladene Inhalte:** `WFFx.init(element)`.
- **Debug:** `?wfx-debug` an die URL hängen, Hinweise erscheinen in der Konsole (z. B. Effekt am `<img>` statt am Wrapper, unbekannter Effektname). Alle Hinweise auch in `WFFx.issues`.
- Der Wrapper bekommt `position: relative` (falls statisch) und `isolation: isolate`. Texte im selben Wrapper werden mit eingefärbt bzw. bekommen Korn, Effekte daher an den Bild-Wrapper, nicht an die ganze Karte.

## Entwicklung

`node build.js` baut `src/wf-fx.min.js` (CSS steckt im Script), `docs/wf-fx.min.js` und `webflow/head-code.html`. Braucht esbuild.

## Versionen

- **1.0.2** – Elemente mit `position: absolute`/`fixed`/`sticky` behalten ihre Position (vorher wurden sie auf `relative` gesetzt).
- **1.0.1** – Grain, Duotone, Mesh-Gradient, Vignette, weicher Rand (erstes Release; 1.0.0 wurde übersprungen).
