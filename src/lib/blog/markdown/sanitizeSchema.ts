import { defaultSchema } from "hast-util-sanitize";
import type { Schema } from "hast-util-sanitize";

const schema: Schema = {
  ...defaultSchema,
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ["http", "https", "mailto"],
  },
};

export const blogMarkdownSanitizeSchema = schema;
