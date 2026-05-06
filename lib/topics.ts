import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "topics.json");

export type TopicCategory = "diabetes" | "obesity" | "ai" | "endocrine" | "app" | "metabolism" | "ai-medicine" | "myth-busting";
export type TopicStatus = "pending" | "approved" | "rejected" | "generated";

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  hook: string;
  source: string;
  aiAngle: string;
  appTieIn: string;
  status: TopicStatus;
  priority: number;
  createdAt: string;
}

// インメモリストア（Vercelではfsへの書き込み不可のため）
let topicsCache: Topic[] | null = null;

function getTopics(): Topic[] {
  if (topicsCache === null) {
    try {
      topicsCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
      topicsCache = [];
    }
  }
  return topicsCache!;
}

function saveTopics(topics: Topic[]) {
  topicsCache = topics;
  // ローカル開発時のみファイル書き込み
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(topics, null, 2));
  } catch {
    // Vercel等の読み取り専用環境では無視
  }
}

export function getAllTopics(): Topic[] {
  return getTopics().sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt));
}

export function getPendingTopics(): Topic[] {
  // 投稿一覧に保存済みのタイトルを除外
  let savedTitles: Set<string>;
  try {
    const postsFile = path.join(process.cwd(), "data", "posts.json");
    const posts: { title: string }[] = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
    savedTitles = new Set(posts.map((p) => p.title));
  } catch {
    savedTitles = new Set();
  }
  return getAllTopics().filter((t) => (t.status === "pending" || t.status === "approved") && !savedTitles.has(t.title));
}

export function getNextPendingTopic(): Topic | null {
  const pending = getPendingTopics();
  return pending.length > 0 ? pending[0] : null;
}

export function createTopic(topic: Omit<Topic, "id" | "createdAt">): Topic {
  const topics = getTopics();
  const newTopic: Topic = {
    ...topic,
    id: `topic-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  topics.push(newTopic);
  saveTopics(topics);
  return newTopic;
}

export function updateTopicStatus(id: string, status: TopicStatus): Topic | null {
  const topics = getTopics();
  const idx = topics.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  topics[idx].status = status;
  saveTopics(topics);
  return topics[idx];
}

export function deleteTopic(id: string): boolean {
  const topics = getTopics();
  const filtered = topics.filter((t) => t.id !== id);
  if (filtered.length === topics.length) return false;
  saveTopics(filtered);
  return true;
}

export function bulkCreateTopics(newTopics: Omit<Topic, "id" | "createdAt">[]): Topic[] {
  const topics = getTopics();
  const created: Topic[] = newTopics.map((t, i) => ({
    ...t,
    id: `topic-${Date.now().toString(36)}-${i}`,
    createdAt: new Date().toISOString(),
  }));
  topics.push(...created);
  saveTopics(topics);
  return created;
}
