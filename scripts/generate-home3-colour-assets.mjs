import { mkdir, readFile, writeFile } from 'node:fs/promises';

// External SVG images cannot inherit page variables. Derive isolated copies
// from home3's colour tokens, preserving the shared maps and all vector geometry.
const root = new URL('../', import.meta.url);
const css = await readFile(new URL('app/home3/home3.css', root), 'utf8');
const colour = (token, seen = new Set()) => {
  if (seen.has(token)) throw new Error(`Circular home3 colour token: ${token}`);
  seen.add(token);
  const match = css.match(new RegExp(`--${token}:\\s*([^;]+);`, 'i'));
  if (!match) throw new Error(`Missing home3 colour token: ${token}`);
  const value = match[1].trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  const alias = value.match(/^var\(--([a-z-]+)\)$/i);
  if (alias) return colour(alias[1], seen);
  // SVG files need resolved colours, including the palette-derived road lines.
  const mix = value.match(
    /^color-mix\(in srgb,\s*var\(--([a-z-]+)\)\s*([\d.]+)%,\s*var\(--([a-z-]+)\)\)$/i,
  );
  if (mix) {
    const channels = (hex) =>
      hex
        .slice(1)
        .match(/../g)
        .map((v) => parseInt(v, 16));
    const a = channels(colour(mix[1], new Set(seen)));
    const b = channels(colour(mix[3], new Set(seen)));
    const weight = Number(mix[2]) / 100;
    return `#${a
      .map((v, i) =>
        Math.round(v * weight + b[i] * (1 - weight))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  }
  throw new Error(`Unsupported home3 colour token: ${token} = ${value}`);
};
const replacements = new Map([
  ['#f4f0e7', colour('paper')],
  ['#fff', colour('cream')],
  ['#ffffff', colour('cream')],
  ['#b8aea2', colour('line')],
  ['#211d1b', colour('ink')],
  ['#706b65', colour('muted')],
]);

for (const [source, destination] of [
  ['maps/mouline-desktop.svg', 'home3/maps/mouline-desktop.svg'],
  ['maps/mouline-mobile.svg', 'home3/maps/mouline-mobile.svg'],
  ['images/home2-paper.svg', 'home3/images/paper.svg'],
  ['images/logo-light.svg', 'home3/images/logo-cream.svg'],
  ['images/logo-light.svg', 'home3/images/logo-ink.svg'],
]) {
  const original = await readFile(new URL(`public/${source}`, root), 'utf8');
  let svg = original.replace(/#[0-9a-f]{3,8}\b/gi, (value) => {
    if (
      destination.endsWith('logo-ink.svg') &&
      /^#(?:fff|ffffff)$/i.test(value)
    ) {
      return colour('ink');
    }
    const replacement = replacements.get(value.toLowerCase());
    if (!replacement) throw new Error(`Unmapped colour ${value} in ${source}`);
    return replacement;
  });
  // Keep street labels secondary to the separate Mouline marker.
  if (source.startsWith('maps/')) {
    svg = svg.replace(
      'font:18px Arial,sans-serif',
      'font:14px Arial,sans-serif',
    );
  }
  const output = new URL(`public/${destination}`, root);
  await mkdir(new URL('.', output), { recursive: true });
  await writeFile(output, svg);
}
