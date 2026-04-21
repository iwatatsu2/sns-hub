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

// インメモリストア（Vercelではfsへの書き込み不可のため）
let postsCache: Post[] | null = null;

function getPosts(): Post[] {
  if (postsCache === null) {
    try {
      postsCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
      postsCache = [];
    }
  }
  return postsCache!;
}

function savePosts(posts: Post[]) {
  postsCache = posts;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  } catch {
    // Vercel等の読み取り専用環境では無視
  }
}

export function getAllPosts(): Post[] {
  return getPosts().sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );
}

export function getPostById(id: string): Post | undefined {
  return getPosts().find((p) => p.id === id);
}

export function createPost(post: Omit<Post, "id" | "createdAt">): Post {
  const posts = getPosts();
  const newPost: Post = {
    ...post,
    id: `${post.scheduledDate}-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...updates, id: posts[idx].id };
  savePosts(posts);
  return posts[idx];
}

export function deletePost(id: string): boolean {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  savePosts(filtered);
  return true;
}

export function togglePlatformPosted(
  id: string,
  platform: Platform
): Post | null {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const p = posts[idx].platforms[platform];
  (p as { posted: boolean }).posted = !p.posted;
  const allPosted = (["instagram", "x", "note", "antaa"] as Platform[]).every(
    (pl) => posts[idx].platforms[pl].posted
  );
  if (allPosted) posts[idx].status = "posted";
  savePosts(posts);
  return posts[idx];
}
