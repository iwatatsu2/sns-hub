import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "topics.json");

export type TopicCategory = "diabetes" | "obesity" | "ai" | "endocrine" | "app";
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

function readTopics(): Topic[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeTopics(topics: Topic[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(topics, null, 2));
}

export function getAllTopics(): Topic[] {
  return readTopics().sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt));
}

export function getPendingTopics(): Topic[] {
  return getAllTopics().filter((t) => t.status === "pending");
}

export function getNextPendingTopic(): Topic | null {
  const pending = getPendingTopics();
  return pending.length > 0 ? pending[0] : null;
}

export function createTopic(topic: Omit<Topic, "id" | "createdAt">): Topic {
  const topics = readTopics();
  const newTopic: Topic = {
    ...topic,
    id: `topic-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  topics.push(newTopic);
  writeTopics(topics);
  return newTopic;
}

export function updateTopicStatus(id: string, status: TopicStatus): Topic | null {
  const topics = readTopics();
  const idx = topics.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  topics[idx].status = status;
  writeTopics(topics);
  return topics[idx];
}

export function deleteTopic(id: string): boolean {
  const topics = readTopics();
  const filtered = topics.filter((t) => t.id !== id);
  if (filtered.length === topics.length) return false;
  writeTopics(filtered);
  return true;
}

export function bulkCreateTopics(newTopics: Omit<Topic, "id" | "createdAt">[]): Topic[] {
  const topics = readTopics();
  const created: Topic[] = newTopics.map((t, i) => ({
    ...t,
    id: `topic-${Date.now().toString(36)}-${i}`,
    createdAt: new Date().toISOString(),
  }));
  topics.push(...created);
  writeTopics(topics);
  return created;
}
