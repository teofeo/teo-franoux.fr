// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from "@astrojs/markdown-satteri";
import { mdastReadingTimePlugin } from "./src/mdast/mdast-reading-time";

export default defineConfig({
  vite: {
    plugins: [tailwind()],
  },
  env: {
      schema: {
        PUBLIC_SITE_URL: envField.string({
          context: 'client',
          access: 'public',
          optional: false,
        }),
        SHOW_DRAFTS: envField.boolean({
          context: 'server',
          access: 'secret',
          optional: true,
          default: false,
        }),
      },
    },
  site: process.env.PUBLIC_SITE_URL,
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      mdastPlugins: [mdastReadingTimePlugin],
    }),
  },
});
