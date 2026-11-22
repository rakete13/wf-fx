// Baut den Webflow-Head-Code, die CDN-Datei und die Demo-Seiten.
// Nutzung: node build.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const tryRequire = (names) => {
  for (const n of names) {
    try {
      return require(n);
    } catch (_) {}
  }
  return null;
};
const globalRoot = (() => {
  try {
    return execSync('npm root -g').toString().trim();
  } catch (_) {
    return '';
  }
})();
const esbuild = tryRequire(['esbuild', path.join(globalRoot, 'esbuild'), '/opt/npm-tools/node_modules/esbuild']);
if (!esbuild) throw new Error('esbuild nicht gefunden: npm i -g esbuild');

const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const write = (f, t) => {
  fs.mkdirSync(path.dirname(path.join(__dirname, f)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, f), t);
};
const js = read('src/wf-fx.js');
const version = (/WF FX v([\w.-]+)/.exec(js) || [])[1];
const css = esbuild.transformSync(read('src/wf-fx.css'), { loader: 'css', minify: true }).code.trim();
const min = (code) => esbuild.transformSync(code, { minify: true, target: 'es2020', legalComments: 'none' }).code.trim();
const header = `/*! WF FX v${version} */`;

// CDN-Datei: bringt ihr CSS selbst mit
const inject = `{const st=document.createElement('style');st.textContent=${JSON.stringify(css)};document.head.appendChild(st);}`;
const full = header + '\n' + min(js.replace('/*@css*/', inject)) + '\n';
write('src/wf-fx.min.js', full);
write('docs/wf-fx.min.js', full);

// Webflow: alles im Head Code
const head = `<!-- WF FX v${version} · Head Code (Site Settings → Custom Code → Head Code) -->
<style>
${css}
</style>
<script>
${header}
${min(js.replace('/*@css*/', ''))}
</script>
`;
write('webflow/head-code.html', head);

console.log(JSON.stringify({ version, headChars: head.length, cdnChars: full.length }));
