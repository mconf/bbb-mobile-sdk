import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bundles the editor into one HTML document, emitted as a JS module: the SDK's
// `babel src/ -d lib/` runs without --copy-files, so a non-.js file would never
// reach the published `lib/`. The output is committed because `bbb-breakout-sdk`
// consumes this repository as a git dependency and cannot run this build.

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, '..', 'src', 'screens', 'user-notes-screen', 'editor-bundle.js');

const CSS_PLACEHOLDER = '/*__BBB_NOTES_CSS__*/';
const JS_PLACEHOLDER = '/*__BBB_NOTES_JS__*/';
// Substituted at runtime, not here - see src/screens/user-notes-screen/index.js.
const CONFIG_PLACEHOLDER = '/*__BBB_NOTES_CONFIG__*/';

// Safe unconditionally: `</script` cannot appear outside a string in valid JS.
const escapeForInlineScript = (source) => source.replaceAll('</script', '<\\/script');

// Escaping `</script` is not enough: the tokenizer also reacts to `<!--` and
// `<script`, which cannot be escaped without changing what a regex literal means.
// A dependency emitting both would stop our `</script>` from closing the element,
// giving a blank WebView with no error. Walk the spec's states and fail the build.
const assertClosesCleanly = (js) => {
  const TAG_END = new Set([' ', '\t', '\n', '\f', '\r', '/', '>']);
  const opensTag = (index, tag) => js.startsWith(tag, index) && TAG_END.has(js[index + tag.length]);

  let state = 'data';
  for (let i = 0; i < js.length; i += 1) {
    if (js.startsWith('<!--', i) && state === 'data') {
      state = 'escaped';
    } else if (js.startsWith('-->', i) && state === 'doubleEscaped') {
      state = 'escaped';
    } else if (js.startsWith('-->', i) && state === 'escaped') {
      state = 'data';
    } else if (state === 'escaped' && opensTag(i, '<script')) {
      state = 'doubleEscaped';
    } else if (opensTag(i, '</script')) {
      // Unreachable while escapeForInlineScript runs first; guard anyway.
      throw new Error(`Unescaped "</script" at offset ${i} would close the inline script early`);
    }
  }

  if (state !== 'data') {
    throw new Error(
      `The bundle leaves the HTML tokenizer in the "${state}" script-data state, so the closing `
      + '</script> tag would not be recognised. Inline the bundle differently (e.g. base64 + eval) '
      + 'or find the dependency that emits the offending <!--/<script sequence.',
    );
  }
};

const run = async () => {
  const outDir = join(here, 'dist');
  await mkdir(outDir, { recursive: true });

  const result = await build({
    entryPoints: [join(here, 'src', 'index.jsx')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020', 'safari15', 'chrome90'],
    jsx: 'automatic',
    legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'css' },
    // @blocknote/mantine's stylesheet imports "@blocknote/react/style.css", which
    // that package only exposes behind the "style" export condition.
    conditions: ['style'],
    outdir: outDir,
    write: false,
    metafile: true,
  });

  const decoder = new TextDecoder();
  let js = '';
  let css = '';
  result.outputFiles.forEach((outputFile) => {
    if (outputFile.path.endsWith('.js')) js = decoder.decode(outputFile.contents);
    if (outputFile.path.endsWith('.css')) css = decoder.decode(outputFile.contents);
  });

  if (!js) throw new Error('esbuild produced no JavaScript output');
  if (!css) throw new Error('esbuild produced no CSS output');

  const template = await readFile(join(here, 'template.html'), 'utf8');
  [CSS_PLACEHOLDER, JS_PLACEHOLDER, CONFIG_PLACEHOLDER].forEach((placeholder) => {
    if (!template.includes(placeholder)) {
      throw new Error(`template.html is missing the ${placeholder} placeholder`);
    }
  });

  const inlineJs = escapeForInlineScript(js);
  assertClosesCleanly(inlineJs);

  // Same hazard as <script>, but CSS has no safe blanket escape.
  if (/<\/style/i.test(css)) {
    throw new Error('The stylesheet contains "</style", which would close the inline <style> early');
  }

  const html = template
    .replace(CSS_PLACEHOLDER, () => css)
    .replace(JS_PLACEHOLDER, () => inlineJs);

  const module = [
    '// GENERATED FILE - DO NOT EDIT.',
    '// Built from shared-notes-editor/ by `npm run build:notes-editor`.',
    '// It is the BlockNote shared-notes editor as a standalone HTML document; see',
    '// src/screens/user-notes-screen/index.js for how it is handed to the WebView.',
    '/* eslint-disable */',
    `export default ${JSON.stringify(html)};`,
    '',
  ].join('\n');

  await writeFile(outFile, module, 'utf8');

  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
  process.stdout.write(`shared-notes editor bundled: ${kb} kB -> ${outFile}\n`);
};

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
