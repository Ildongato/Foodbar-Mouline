import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const project = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const directAdmin = process.env.MOULINE_BUILD_TARGET === 'directadmin';
  const base = directAdmin ? '/nieuw/' : '/Foodbar-Mouline/';
  const publicEnv = loadEnv(mode, project, 'NEXT_PUBLIC_');
  return {
    root: `${project}static-site`,
    base,
    publicDir: `${project}public`,
    plugins: [react()],
    resolve: { alias: { '@': project } },
    define: {
      'process.env.NEXT_PUBLIC_STATIC_HOST': JSON.stringify('true'),
      'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(base.slice(0, -1)),
      'process.env.NEXT_PUBLIC_CONTACT_DEMO_ALLOWED': JSON.stringify(directAdmin ? 'false' : 'true'),
      'process.env.NEXT_PUBLIC_SITE_ASSET_URL': JSON.stringify(directAdmin ? 'https://www.mouline.be/nieuw/' : 'https://ildongato.github.io/Foodbar-Mouline/'),
      'process.env.NEXT_PUBLIC_CONTACT_ENDPOINT': JSON.stringify(
        directAdmin ? '/nieuw/api/contact.php' : process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
          publicEnv.NEXT_PUBLIC_CONTACT_ENDPOINT ||
          '',
      ),
    },
    css: { postcss: { plugins: [tailwindcss({ base: project })] } },
    build: {
      outDir: `${project}${directAdmin ? 'dist-directadmin' : 'dist-pages'}`,
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          home: `${project}static-site/index.html`,
        },
      },
    },
  };
});
