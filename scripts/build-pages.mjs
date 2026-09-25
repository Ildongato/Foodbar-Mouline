import { build, resolveConfig } from 'vite';
import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import './generate-home3-colour-assets.mjs';

process.env.NODE_ENV = 'production';
const root = new URL('../', import.meta.url);
const configFile = fileURLToPath(new URL('vite.pages.config.ts', root));
const directAdmin = process.env.MOULINE_BUILD_TARGET === 'directadmin';
const outputName = directAdmin ? 'dist-directadmin' : 'dist-pages';
const renderDirectory = new URL(directAdmin ? '.directadmin-render/' : '.pages-render/', root);

try {
  await build({ configFile });
  await build({
    configFile,
    publicDir: false,
    build: {
      ssr: fileURLToPath(new URL('static-site/entry-server.tsx', root)),
      rolldownOptions: {
        input: fileURLToPath(new URL('static-site/entry-server.tsx', root)),
      },
      outDir: fileURLToPath(renderDirectory),
      emptyOutDir: true,
    },
  });
  const { render } = await import(new URL('entry-server.js', renderDirectory));
  const index = new URL(`${outputName}/index.html`, root);
  let template = await readFile(index, 'utf8');
  if (directAdmin) template = template.replaceAll('https://ildongato.github.io/Foodbar-Mouline/', 'https://www.mouline.be/nieuw/');
  if (!template.includes('<!--app-html-->'))
    throw new Error('Missing HTML render slot for the homepage');
  await writeFile(index, template.replace('<!--app-html-->', () => render()));

  // Retire all design alternatives while preserving shared links and section anchors.
  const { base } = await resolveConfig({ configFile }, 'build');
  const redirect = `<!doctype html>
<html lang="nl-BE"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>Foodbar Mouline</title>
<script>window.location.replace(${JSON.stringify(base)} + window.location.search + window.location.hash);</script>
<noscript><meta http-equiv="refresh" content="0;url=${base}" /></noscript>
</head><body><a href="${base}">Open Foodbar Mouline</a></body></html>`;
  for (const path of ['home1/index.html', 'home2/index.html', 'home3/index.html', 'home3/jobs-preview.html']) {
    const destination = new URL(`${outputName}/${path}`, root);
    await mkdir(new URL('.', destination), { recursive: true });
    await writeFile(destination, redirect);
  }
  if (directAdmin) {
    await mkdir(new URL(`${outputName}/api/`, root), { recursive: true });
    await copyFile(new URL('hosting/mouline-contact.php', root), new URL(`${outputName}/api/contact.php`, root));
    await copyFile(new URL('hosting/test.htaccess', root), new URL(`${outputName}/.htaccess`, root));
  } else await writeFile(new URL('dist-pages/.nojekyll', root), '');
  console.log(`Static build ready in ${outputName}/`);
} finally {
  await rm(renderDirectory, { recursive: true, force: true });
}
