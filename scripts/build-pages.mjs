import { build } from 'vite';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'production';
const root = new URL('../', import.meta.url);
const configFile = fileURLToPath(new URL('vite.pages.config.ts', root));
const renderDirectory = new URL('.pages-render/', root);

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
  for (const [variant, path] of [
    ['home', 'index.html'],
    ['home2', 'home2/index.html'],
  ]) {
    const index = new URL(`dist-pages/${path}`, root);
    const template = await readFile(index, 'utf8');
    if (!template.includes('<!--app-html-->'))
      throw new Error(`Missing HTML render slot for ${variant}`);
    await writeFile(
      index,
      template.replace('<!--app-html-->', () => render(variant)),
    );
  }
  await writeFile(new URL('dist-pages/.nojekyll', root), '');
  console.log('GitHub Pages build ready in dist-pages/');
} finally {
  await rm(renderDirectory, { recursive: true, force: true });
}
