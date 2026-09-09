// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from "@astrojs/markdown-satteri";
import { mdastReadingTimePlugin } from "./src/mdast/mdast-reading-time";
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

export default defineConfig({
  vite: {
    plugins: [tailwind()],
  },
  site: PUBLIC_SITE_URL,
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      mdastPlugins: [mdastReadingTimePlugin],
    }),
  },
});
