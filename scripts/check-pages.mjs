import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';

const output = new URL('../dist-pages/', import.meta.url);
const html = await readFile(new URL('index.html', output), 'utf8');
const base = '/Foodbar-Mouline/';
assert.match(html, /Over Mouline/);
assert.match(html, /Mouline in beeld/);
assert.match(html, /Werken bij Mouline/);
assert.match(html, /Supplement spek/);
assert.match(html, /Sinds 2019/);
assert.doesNotMatch(html, /Testversie — er wordt geen aanvraag verstuurd/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /href="#vacatures"/);
assert.match(html, /id="vacatures"/);

// Moving the entry point must not break local images, fonts or bundles.
for (const [, url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (url.startsWith(base)) await access(new URL(url.slice(base.length), output));
}
const assets = await readdir(new URL('assets/', output));
assert(!assets.some((name) => /^home[23]-/.test(name)));

// Every retired URL keeps incoming section links and explicit demo parameters.
for (const path of ['home1/index.html', 'home2/index.html', 'home3/index.html', 'home3/jobs-preview.html']) {
  const redirect = await readFile(new URL(path, output), 'utf8');
  assert.doesNotMatch(redirect, /id="root"/);
  assert.match(redirect, /noindex, follow/);
  const script = redirect.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert(script);
  let destination;
  vm.runInNewContext(script, {
    window: {
      location: {
        search: '?formDemo=1',
        hash: '#vacatures',
        replace: (value) => { destination = value; },
      },
    },
  });
  assert.equal(destination, `${base}?formDemo=1#vacatures`);
}
console.log('Approved homepage, local assets and all legacy redirects verified.');
