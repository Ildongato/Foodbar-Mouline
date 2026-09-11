import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const project = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const publicEnv = loadEnv(mode, project, 'NEXT_PUBLIC_');
  return {
    root: `${project}static-site`,
    base: '/Foodbar-Mouline/',
    publicDir: `${project}public`,
    plugins: [react()],
    resolve: { alias: { '@': project } },
    define: {
      'process.env.NEXT_PUBLIC_STATIC_HOST': JSON.stringify('true'),
      'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify('/Foodbar-Mouline'),
      'process.env.NEXT_PUBLIC_CONTACT_ENDPOINT': JSON.stringify(
        process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
          publicEnv.NEXT_PUBLIC_CONTACT_ENDPOINT ||
          '',
      ),
    },
    css: { postcss: { plugins: [tailwindcss({ base: project })] } },
    build: {
      outDir: `${project}dist-pages`,
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          home: `${project}static-site/index.html`,
          home2: `${project}static-site/home2/index.html`,
          home3: `${project}static-site/home3/index.html`,
        },
      },
    },
  };
});
