import mongoose, { Schema, type InferSchemaType } from "mongoose";
import {
  BLOG_COLLECTION_NAME,
  BLOG_DEFAULT_LANGUAGE,
  BLOG_DEFAULT_TARGET_COUNTRY,
} from "@/lib/blog/constants";

const blogEntitySchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String },
    description: { type: String },
    url: { type: String },
  },
  { _id: false },
);

const blogSourceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publisher: { type: String },
    published_at: { type: String },
    accessed_at: { type: String },
  },
  { _id: false },
);

const blogPostSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    meta_title: { type: String, required: true },
    meta_description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    thumbnail_url: { type: String, default: null },
    meta_keywords: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    meta_abstract: { type: String, default: null },
    author_id: { type: String, required: true },
    focus_keyword: { type: String, default: null },
    canonical_url: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    reading_time_minutes: { type: Number, required: true, min: 1 },
    internal_links_count: { type: Number, default: 0, min: 0 },
    schema_markup: { type: Schema.Types.Mixed, default: null },
    language_code: { type: String, default: BLOG_DEFAULT_LANGUAGE },
    target_country: { type: String, default: BLOG_DEFAULT_TARGET_COUNTRY },
    answer_summary: { type: String, default: null },
    key_takeaways: { type: [String], default: [] },
    entities_json: { type: [blogEntitySchema], default: [] },
    sources_json: { type: [blogSourceSchema], default: [] },
    reviewed_at: { type: Date, default: null },
  },
  {
    collection: BLOG_COLLECTION_NAME,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

blogPostSchema.index({ status: 1, created_at: -1 });
blogPostSchema.index({ status: 1, category: 1, created_at: -1 });
blogPostSchema.index({ created_at: -1 });

export type BlogPostDocument = InferSchemaType<typeof blogPostSchema>;

export function getBlogPostModel() {
  return (
    mongoose.models.BlogPost ??
    mongoose.model("BlogPost", blogPostSchema, BLOG_COLLECTION_NAME)
  );
}

export async function ensureBlogPostIndexes(): Promise<void> {
  const model = getBlogPostModel();
  await model.createIndexes();
}
