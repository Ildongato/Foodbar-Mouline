import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
const root = new URL('../dist-directadmin/', import.meta.url);
const production = process.env.MOULINE_DEPLOY_ENV === 'production';
const base = production ? '/' : '/nieuw/';
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(
  html,
  production
    ? /name="robots" content="index, follow/
    : /name="robots" content="noindex/,
);
assert(html.includes(`https://www.mouline.be${base}images/`));
assert.doesNotMatch(html, /ildongato\.github\.io|\/Foodbar-Mouline\//i);
for (const file of ['api/contact.php', '.htaccess'])
  await access(new URL(file, root));
let checked = 0;
async function checkTree(dir) {
  for (const entry of await readdir(new URL(dir, root), {
    withFileTypes: true,
  })) {
    const path = dir + entry.name;
    if (entry.isDirectory()) {
      await checkTree(path + '/');
      continue;
    }
    assert(!/\.(?:map|env)$/.test(path));
    if (!/\.(?:html|css|js)$/.test(path)) continue;
    const text = await readFile(new URL(path, root), 'utf8');
    assert.doesNotMatch(text, /["'(]\/Foodbar-Mouline\//);
    if (production) assert.doesNotMatch(text, /\/nieuw\//);
    const pattern = production
      ? /["'(](\/(?:assets|images|fonts|brand|api)\/[A-Za-z0-9_./-]+)/g
      : /["'(](\/nieuw\/[A-Za-z0-9_./-]+)/g;
    for (const match of text.matchAll(pattern)) {
      await access(new URL(match[1].slice(base.length), root));
      checked++;
    }
  }
}
await checkTree('');
const bundle = (await readdir(new URL('assets/', root))).find((x) =>
  /^home-.*\.js$/.test(x),
);
const js = await readFile(new URL('assets/' + bundle, root), 'utf8');
assert(js.includes(`${base}api/contact.php`));
if (production) {
  const htaccess = await readFile(new URL('.htaccess', root), 'utf8');
  assert.doesNotMatch(htaccess, /Header.*noindex/);
  assert.match(htaccess, /nieuw\|/);
  assert.match(htaccess, /R=404/);
}
console.log(
  `DirectAdmin ${production ? 'production' : 'staging'} build verified: ${checked} local references, PHP endpoint and correct indexing/base paths.`,
);
