import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "posts.json");

export type Platform = "instagram" | "x" | "note" | "antaa";

export interface PlatformContent {
  instagram: { caption: string; hashtags: string[]; posted: boolean };
  x: { text: string; posted: boolean };
  note: { title: string; body: string; posted: boolean };
  antaa: { title: string; description: string; tags: string[]; posted: boolean };
}

export interface Post {
  id: string;
  title: string;
  theme: string;
  status: "draft" | "scheduled" | "posted";
  scheduledDate: string;
  platforms: PlatformContent;
  assets: string[];
  createdAt: string;
}

function readPosts(): Post[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writePosts(posts: Post[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

export function getAllPosts(): Post[] {
  return readPosts().sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );
}

export function getPostById(id: string): Post | undefined {
  return readPosts().find((p) => p.id === id);
}

export function createPost(post: Omit<Post, "id" | "createdAt">): Post {
  const posts = readPosts();
  const newPost: Post = {
    ...post,
    id: `${post.scheduledDate}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  writePosts(posts);
  return newPost;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...updates, id: posts[idx].id };
  writePosts(posts);
  return posts[idx];
}

export function deletePost(id: string): boolean {
  const posts = readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  writePosts(filtered);
  return true;
}

export function togglePlatformPosted(
  id: string,
  platform: Platform
): Post | null {
  const posts = readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const p = posts[idx].platforms[platform];
  (p as { posted: boolean }).posted = !p.posted;
  // Auto-update status if all posted
  const allPosted = (["instagram", "x", "note", "antaa"] as Platform[]).every(
    (pl) => posts[idx].platforms[pl].posted
  );
  if (allPosted) posts[idx].status = "posted";
  writePosts(posts);
  return posts[idx];
}
