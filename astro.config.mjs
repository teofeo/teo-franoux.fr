// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwind()],
  },
  site: PUBLIC_SITE_URL,
  integrations: [sitemap()],
});
