/*! WF FX v1.0.1 · Bildeffekte per Attribut für Webflow · github.com/rakete13/wf-fx */
(() => {
  'use strict';
  if (window.WFFx) return;
  const VERSION = '1.0.1';
  /*@css*/

  const EFFECTS = ['grain', 'duotone', 'mesh', 'vignette', 'fade-edge'];
  const LAYERED = ['grain', 'duotone', 'vignette'];
  const MEDIA = 'img, video, picture, svg, canvas, iframe';
  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.has('wfx-debug') || (window.WFFxConfig && window.WFFxConfig.debug);
  const issues = [];
  const issue = (el, msg) => {
    issues.push({ el, msg });
    if (DEBUG) console.warn('[WF FX]', msg, el);
  };

  // Rauschtextur fürs Grain: einmal als SVG erzeugt, ohne Bilddatei
  const noise =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='1.8 0 0 0 -.4 1.8 0 0 0 -.4 1.8 0 0 0 -.4 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  document.documentElement.style.setProperty('--wfx-noise', noise);

  const list = (el) => (el.getAttribute('data-fx') || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const pct = (v, d) => {
    if (v === undefined || v === '') return d;
    const n = parseFloat(v);
    if (!isFinite(n)) return d;
    return /%$/.test(v) ? v.trim() : n > 1 ? n + '%' : n * 100 + '%';
  };
  const px = (v, d) => (v === undefined || v === '' ? d : /^\d+(\.\d+)?$/.test(v.trim()) ? v.trim() + 'px' : v.trim());
  const num01 = (v, d) => {
    const n = parseFloat(v);
    if (!isFinite(n)) return d;
    return String(n > 1 ? Math.min(1, n / 100) : Math.max(0, n));
  };
  const setVar = (el, name, val) => (val === undefined || val === null || val === '' ? el.style.removeProperty(name) : el.style.setProperty(name, val));

  // Eine Ebene im Element anlegen (oder die vorhandene wiederverwenden)
  const layer = (el, cls) => {
    let l = el.querySelector(':scope > .' + cls);
    if (!l) {
      l = document.createElement('span');
      l.className = 'wfx-l ' + cls;
      l.setAttribute('aria-hidden', 'true');
      el.appendChild(l);
    }
    return l;
  };

  // Duotone direkt auf einem Bild (ohne Wrapper): SVG-Filter
  let defs = null;
  const toRgb = (el, c) => {
    const probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;width:0;height:0;color:' + c;
    el.parentNode.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0];
    probe.remove();
    return m.slice(0, 3).map((x) => +x / 255);
  };
  const svgDuotone = (el, dark, light) => {
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('aria-hidden', 'true');
      defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      document.body.appendChild(defs);
    }
    const a = toRgb(el, dark);
    const b = toRgb(el, light);
    const id = 'wfx-duo-' + [...a, ...b].map((x) => Math.round(x * 255).toString(16)).join('');
    if (!defs.querySelector('#' + id)) {
      const t = (i) => `${a[i].toFixed(3)} ${b[i].toFixed(3)}`;
      defs.insertAdjacentHTML(
        'beforeend',
        `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/>` +
          `<feComponentTransfer><feFuncR type="table" tableValues="${t(0)}"/><feFuncG type="table" tableValues="${t(1)}"/><feFuncB type="table" tableValues="${t(2)}"/></feComponentTransfer></filter>`
      );
    }
    el.style.filter = `url(#${id})`;
  };

  const apply = (el) => {
    const fx = list(el);
    const ds = el.dataset;
    fx.filter((f) => !EFFECTS.includes(f)).forEach((f) => issue(el, `Unbekannter Effekt "${f}". Möglich: ${EFFECTS.join(', ')}.`));
    const isMedia = el.matches(MEDIA);
    const layered = fx.filter((f) => LAYERED.includes(f));

    // Elemente wie <img> können keine Ebenen aufnehmen
    if (isMedia && layered.some((f) => f !== 'duotone')) {
      issue(el, `${layered.join(', ')} braucht einen Wrapper: data-fx an den img-wrapper statt ans Bild.`);
    }
    if (layered.length && !isMedia) {
      el.classList.add('wfx-host');
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    }

    // Grain
    if (fx.includes('grain') && !isMedia) {
      layer(el, 'wfx-grain');
      setVar(el, '--fx-grain-strength', ds.fxGrainStrength !== undefined ? num01(ds.fxGrainStrength, '0.14') : '');
      setVar(el, '--fx-grain-size', ds.fxGrainSize ? px(ds.fxGrainSize) : '');
      setVar(el, '--fx-grain-blend', ds.fxGrainBlend || '');
    }

    // Duotone
    if (fx.includes('duotone')) {
      const dark = ds.fxDuotoneDark || '';
      const light = ds.fxDuotoneLight || '';
      if (isMedia) svgDuotone(el, dark || '#1d3cff', light || '#f2e8d5');
      else {
        // Reihenfolge: hell zuerst (darken), dann dunkel (lighten)
        layer(el, 'wfx-duo-light');
        layer(el, 'wfx-duo-dark');
        setVar(el, '--fx-duotone-dark', dark);
        setVar(el, '--fx-duotone-light', light);
        setVar(el, '--fx-duotone-contrast', ds.fxDuotoneContrast || '');
        setVar(el, '--fx-duotone-speed', ds.fxDuotoneSpeed ? parseFloat(ds.fxDuotoneSpeed) + 's' : '');
        if (!el.querySelector(':scope > :not(.wfx-l)')) issue(el, 'duotone: Im Element liegt kein Bild.');
      }
    }

    // Vignette
    if (fx.includes('vignette') && !isMedia) {
      layer(el, 'wfx-vignette');
      setVar(el, '--fx-vignette-strength', ds.fxVignetteStrength !== undefined ? num01(ds.fxVignetteStrength, '0.55') : '');
      setVar(el, '--fx-vignette-color', ds.fxVignetteColor || '');
      setVar(el, '--fx-vignette-size', ds.fxVignetteSize ? pct(ds.fxVignetteSize) : '');
      setVar(el, '--fx-vignette-shape', ds.fxVignetteShape === 'circle' ? 'circle' : '');
    }
    // Ebenen in fester Reihenfolge ans Ende: Duotone, Vignette, Grain (oben)
    ['wfx-duo-light', 'wfx-duo-dark', 'wfx-vignette', 'wfx-grain'].forEach((c) => {
      const l = el.querySelector(':scope > .' + c);
      if (l) el.appendChild(l);
    });

    // Mesh-Gradient
    if (fx.includes('mesh')) {
      const cols = (ds.fxMeshColors || '').split(/,(?![^(]*\))/).map((c) => c.trim()).filter(Boolean);
      for (let i = 1; i <= 5; i++) setVar(el, '--fx-c' + i, cols[i - 1] || '');
      setVar(el, '--fx-mesh-base', ds.fxMeshBase || '');
      setVar(el, '--fx-mesh-size', ds.fxMeshSize ? pct(ds.fxMeshSize) : '');
      setVar(el, '--fx-mesh-speed', ds.fxMeshSpeed ? parseFloat(ds.fxMeshSpeed) + 's' : '');
      if (cols.length > 5) issue(el, 'mesh: Mehr als 5 Farben, die übrigen werden ignoriert.');
    }

    // Weicher Rand
    if (fx.includes('fade-edge')) {
      const len = pct(ds.fxFadeLength, '25%');
      const side = (ds.fxFadeSide || 'bottom').toLowerCase();
      const g = (dir) => `linear-gradient(${dir}, #000 calc(100% - ${len}), transparent)`;
      const map = { bottom: g('to bottom'), top: g('to top'), left: g('to left'), right: g('to right') };
      const two = (a, b) => `linear-gradient(${a}, transparent, #000 ${len}, #000 calc(100% - ${len}), transparent)`;
      let m;
      let comp = '';
      if (map[side]) m = map[side];
      else if (side === 'y') m = two('to bottom');
      else if (side === 'x') m = two('to right');
      else if (side === 'all') {
        m = `${two('to bottom')}, ${two('to right')}`;
        comp = 'intersect';
      } else {
        issue(el, `fade-edge: Seite "${side}" unbekannt. Möglich: bottom, top, left, right, x, y, all.`);
        m = map.bottom;
      }
      el.style.webkitMaskImage = m;
      el.style.maskImage = m;
      el.style.maskComposite = comp;
      el.style.webkitMaskComposite = comp ? 'source-in' : '';
    }
    el.classList.add('wfx-ready');
  };

  const init = (scope) => {
    const root = scope && scope.querySelectorAll ? scope : document;
    const els = [...root.querySelectorAll('[data-fx]')];
    if (root !== document && root.matches && root.matches('[data-fx]')) els.unshift(root);
    els.forEach((el) => {
      try {
        apply(el);
      } catch (e) {
        issue(el, 'Fehler: ' + e.message);
      }
    });
    if (DEBUG) console.info(`[WF FX] v${VERSION}: ${els.length} Elemente, ${issues.length} Hinweise`);
    return els.length;
  };

  window.WFFx = { version: VERSION, init, refresh: init, issues };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
