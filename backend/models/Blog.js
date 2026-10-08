"use strict";

const supabase = require("../config/supabase");
const databaseResult = require("../utils/databaseResult");
const HttpError = require("../utils/HttpError");
const columns = "id,title,category,content,image,author_id,author_name,status,created_at,updated_at";
const validId = id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function publicBlog(row) {
  const compact = row.content.replace(/\s+/g, " ");
  return {
    id: row.id, title: row.title, category: row.category, content: row.content,
    imageUrl: row.image, authorId: row.author_id, author: row.author_name, status: row.status,
    date: row.created_at.slice(0, 10), createdAt: row.created_at, updatedAt: row.updated_at,
    imageAlt: `Cover image for ${row.title}`,
    description: compact.slice(0, 145) + (compact.length > 145 ? "…" : ""),
    readMinutes: Math.max(1, Math.ceil(row.content.trim().split(/\s+/).length / 200))
  };
}

function storedFields(input) {
  return { title: input.title, category: input.category, content: input.content, image: input.imageUrl, status: input.status };
}

async function listBy(field, value) {
  const rows = [];
  // Supabase limits each response. Page through it to preserve the complete feed/dashboard.
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const page = databaseResult(await supabase.from("blogs").select(columns).eq(field, value)
      .order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + pageSize - 1));
    rows.push(...page);
    if (page.length < pageSize) return rows.map(publicBlog);
  }
}

class Blog {
  static async published() { return listBy("status", "published"); }
  static async byAuthor(authorId) { return listBy("author_id", authorId); }
  static async findById(id) {
    if (!validId(id)) throw new HttpError(404, "Blog not found.");
    const row = databaseResult(await supabase.from("blogs").select(columns).eq("id", id).maybeSingle());
    if (!row) throw new HttpError(404, "Blog not found.");
    return publicBlog(row);
  }
  static async readable(id, authorId) {
    const blog = await Blog.findById(id);
    if (blog.status !== "published" && blog.authorId !== authorId) throw new HttpError(404, "Blog not found.");
    return blog;
  }
  static async owned(id, authorId) {
    const blog = await Blog.findById(id);
    if (blog.authorId !== authorId) throw new HttpError(403, "You can only manage your own blogs.");
    return blog;
  }
  static async create(input, user) {
    const row = databaseResult(await supabase.from("blogs").insert({ ...storedFields(input), author_id: user.id, author_name: user.name }).select(columns).single());
    return publicBlog(row);
  }
  static async update(id, authorId, changes) {
    await Blog.owned(id, authorId);
    const row = databaseResult(await supabase.from("blogs").update(storedFields(changes)).eq("id", id).eq("author_id", authorId).select(columns).maybeSingle());
    if (!row) throw new HttpError(404, "Blog not found.");
    return publicBlog(row);
  }
  static async remove(id, authorId) {
    await Blog.owned(id, authorId);
    const row = databaseResult(await supabase.from("blogs").delete().eq("id", id).eq("author_id", authorId).select("id").maybeSingle());
    if (!row) throw new HttpError(404, "Blog not found.");
  }
}

module.exports = Blog;
