import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "tasks.json");

export type TaskCategory = "profile" | "content" | "engagement";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: number;
  done: boolean;
  createdAt: string;
}

let tasksCache: Task[] | null = null;

function getTasks(): Task[] {
  if (tasksCache === null) {
    try {
      tasksCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
      tasksCache = [];
    }
  }
  return tasksCache!;
}

function saveTasks(tasks: Task[]) {
  tasksCache = tasks;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch {
    // read-only env
  }
}

export function getAllTasks(): Task[] {
  return getTasks().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.priority - a.priority;
  });
}

export function getPendingTasks(): Task[] {
  return getAllTasks().filter((t) => !t.done);
}

export function getNextTask(): Task | null {
  const pending = getPendingTasks();
  return pending.length > 0 ? pending[0] : null;
}

export function toggleTaskDone(id: string): Task | null {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx].done = !tasks[idx].done;
  saveTasks(tasks);
  return tasks[idx];
}
