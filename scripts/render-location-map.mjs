// Run manually after updating the local, ODbL-licensed street extract.
// No map service, token or dependency is needed in the browser or Pages build.
import { readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../public/maps/', import.meta.url);
const data = JSON.parse(
  await readFile(new URL('mouline-streets.geojson', directory), 'utf8'),
);
// Existing verified Google place coordinates; keep separate from OSM street geometry.
const center = [4.4446165, 51.2911049];
const project = ([lon, lat]) => [
  500 + (lon - center[0]) * 111320 * Math.cos((center[1] * Math.PI) / 180),
  230 - (lat - center[1]) * 111320,
];
const path = (points) =>
  points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${project(point)
          .map((n) => n.toFixed(1))
          .join(',')}`,
    )
    .join('');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const widths = {
  primary: 16,
  secondary: 12,
  tertiary: 11,
  residential: 7,
  living_street: 6,
  unclassified: 7,
  service: 4,
  pedestrian: 4,
};
const shapes = [];
for (const layer of ['green', 'building', 'road']) {
  for (const feature of data.features.filter(
    (f) => f.properties.layer === layer,
  )) {
    const d = path(feature.geometry.coordinates);
    if (layer === 'road') {
      const width = widths[feature.properties.highway];
      shapes.push(
        `<path d="${d}" fill="none" stroke="#b8aea2" stroke-width="${width + 1.5}"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${width}"/>`,
      );
    } else {
      shapes.push(
        `<path d="${d}Z" fill="${layer === 'green' ? '#b8aea2' : '#211d1b'}" opacity="${layer === 'green' ? '.24' : '.075'}"/>`,
      );
    }
  }
}
// A few readable labels placed along their real roads. No invented streets or POIs.
const labels = [
  ['Kapelsesteenweg', 4.4455, 51.2902, -66],
  ['Molenweg', 4.4473, 51.29176, -20],
  ['Schriek', 4.4423, 51.29137, -16],
  ['Willy Staeslei', 4.44264, 51.29006, -23],
];
for (const [name, lon, lat, rotation] of labels) {
  const [x, y] = project([lon, lat]);
  shapes.push(
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rotation} ${x.toFixed(1)} ${y.toFixed(1)})">${escape(name)}</text>`,
  );
}
for (const [name, viewBox] of [
  ['desktop', '0 0 1000 460'],
  ['mobile', '220 0 560 460'],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><title>Straten rond Foodbar Mouline</title><desc>Kaartgegevens © OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright</desc><style>text{font:18px Arial,sans-serif;fill:#706b65;paint-order:stroke;stroke:#f4f0e7;stroke-width:4;stroke-linejoin:round;text-anchor:middle}</style><rect x="-10000" y="-10000" width="20000" height="20000" fill="#f4f0e7"/><g stroke-linecap="round" stroke-linejoin="round">${shapes.join('')}</g></svg>`;
  await writeFile(new URL(`mouline-${name}.svg`, directory), svg);
}
