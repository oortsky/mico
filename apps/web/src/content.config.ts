import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}"
  }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image())
    })
});

const legal = defineCollection({
  loader: glob({
    base: "./src/content/legal",
    pattern: "**/*.md"
  }),

  schema: z.object({
    title: z.string(),
    date: z.coerce.date()
  })
});

export const collections = {
  blog,
  legal
};
