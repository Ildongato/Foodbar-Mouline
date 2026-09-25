import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const root = new URL('../dist-directadmin/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /name="robots" content="noindex/);
assert.match(html, /https:\/\/www\.mouline\.be\/nieuw\/images\//);
assert.doesNotMatch(html, /ildongato\.github\.io|\/Foodbar-Mouline\//i);
for (const file of ['api/contact.php', '.htaccess']) await access(new URL(file, root));
let checked = 0;
async function checkTree(dir) {
  for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
    const path = dir + entry.name;
    if (entry.isDirectory()) { await checkTree(path + '/'); continue; }
    assert(!/\.(?:map|env)$/.test(path));
    if (!/\.(?:html|css|js)$/.test(path)) continue;
    const text = await readFile(new URL(path, root), 'utf8');
    assert.doesNotMatch(text, /["'(]\/Foodbar-Mouline\//);
    // Covers rendered src/srcset/href, CSS URLs and JS asset literals.
    for (const match of text.matchAll(/\/nieuw\/([A-Za-z0-9_./-]+)/g)) {
      await access(new URL(match[1], root)); checked++;
    }
  }
}
await checkTree('');
const bundle = (await readdir(new URL('assets/', root))).find(x => /^home-.*\.js$/.test(x));
const js = await readFile(new URL('assets/' + bundle, root), 'utf8');
assert.match(js, /\/nieuw\/api\/contact\.php/);
console.log(`DirectAdmin build verified: ${checked} local asset references, PHP endpoint, noindex and isolated base paths.`);
