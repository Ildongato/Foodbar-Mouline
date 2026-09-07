import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const project = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: `${project}static-site`,
  base: '/Foodbar-Mouline/',
  publicDir: `${project}public`,
  plugins: [react()],
  resolve: { alias: { '@': project } },
  define: {
    'process.env.NEXT_PUBLIC_STATIC_HOST': JSON.stringify('true'),
    'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify('/Foodbar-Mouline'),
  },
  css: { postcss: { plugins: [tailwindcss({ base: project })] } },
  build: {
    outDir: `${project}dist-pages`,
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: `${project}static-site/index.html`,
        home2: `${project}static-site/home2/index.html`,
      },
    },
  },
});
