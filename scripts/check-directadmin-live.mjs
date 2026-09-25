import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const origin = 'https://www.mouline.be';
const base = origin + '/nieuw/';
const get = (url, options = {}) => fetch(url, { signal: AbortSignal.timeout(20000), ...options });
for (const host of ['mouline.be', 'www.mouline.be']) {
  for (const path of ['/nieuw/?https-check=1', '/nieuw/api/contact.php']) {
    const redirect = await get('http://' + host + path, { redirect: 'manual' });
    assert.equal(redirect.status, 308, 'HTTP must redirect to HTTPS');
    assert.equal(redirect.headers.get('location'), origin + path);
  }
}
const response = await get(base);
assert.equal(response.status, 200);
assert.match(response.headers.get('x-robots-tag'), /noindex/);
const html = await response.text();
const manifest = await (await get(base + 'deployment-manifest.json')).json();
assert.equal(createHash('sha256').update(html).digest('hex'), manifest.files['index.html']);
const assets = Object.keys(manifest.files).filter(path => /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff|woff2|ttf|pdf)$/i.test(path));
for (let index = 0; index < assets.length; index += 5) {
  await Promise.all(assets.slice(index, index + 5).map(async path => {
    assert.equal((await get(base + path, {method:'HEAD'})).status, 200, path);
  }));
}
for (const [method, headers, body, expected] of [
  ['GET', {Origin:origin}, undefined, 405],
  ['POST', {Origin:origin, 'Content-Type':'application/json'}, '{}', 400],
  ['POST', {Origin:'https://untrusted.example', 'Content-Type':'application/json'}, '{}', 403],
  ['POST', {Origin:origin, 'Content-Type':'text/plain'}, '{}', 415],
]) {
  const result = await get(base + 'api/contact.php', {method,headers,body});
  assert.equal(result.status, expected);
  assert.equal((await result.json()).ok, false);
}
console.log(`HTTPS test passed: HTTP redirects, exact uploaded homepage, ${assets.length} assets, PHP execution and validation/origin/content-type rejection. No email sent.`);
