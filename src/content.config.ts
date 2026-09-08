import { defineCollection } from "astro:content";
import { z } from 'astro/zod';
import { glob } from "astro/loaders";



const blog = defineCollection({
  loader: glob({
      pattern: "**/*.md",
      base: "./src/content/blog",
    }),
  
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({
      pattern: "**/*.md",
      base: "./src/content/projects",
    }),
  
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }),
});

export const collections = {
  blog,
  projects,
};
