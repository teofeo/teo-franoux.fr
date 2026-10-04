// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from "@astrojs/markdown-satteri";
import { mdastReadingTimePlugin } from "./src/mdast/mdast-reading-time";
import { readdirSync, readFileSync } from "node:fs";

// Map each blog post URL path to its last modification date (updatedDate, or pubDate)
const getBlogLastmods = () => {
  const dir = "./src/content/blog";
  /** @type {Map<string, string>} */
  const lastmods = new Map();

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const frontmatter = readFileSync(`${dir}/${file}`, "utf-8").split("---")[1] ?? "";
    /** @param {string} key */
    const date = (key) => frontmatter.match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, "m"))?.[1];
    const lastmod = date("updatedDate") ?? date("pubDate");

    if (lastmod) {
      lastmods.set(`/blog/${file.replace(/\.md$/, "")}/`, new Date(lastmod).toISOString());
    }
  }

  return lastmods;
};

const blogLastmods = getBlogLastmods();

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
  trailingSlash: "always",
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = blogLastmods.get(new URL(item.url).pathname);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  markdown: {
    processor: satteri({
      mdastPlugins: [mdastReadingTimePlugin],
    }),
  },
});
