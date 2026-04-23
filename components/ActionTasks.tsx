"use client";

import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "profile" | "content" | "engagement";
  priority: number;
  done: boolean;
}

const CATEGORY_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  profile: { icon: "👤", label: "プロフィール", color: "text-purple-400" },
  content: { icon: "📝", label: "コンテンツ", color: "text-blue-400" },
  engagement: { icon: "💬", label: "エンゲージメント", color: "text-orange-400" },
};

export default function ActionTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then(setTasks);
  }, []);

  const handleToggle = async (id: string) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id }),
    });
    setTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        .sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return b.priority - a.priority;
        })
    );
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">
          やるべきタスク
          {pending.length > 0 && (
            <span className="ml-2 bg-teal-500/20 text-teal-400 text-sm px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h3>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-gray-400 text-sm">すべて完了！</p>
        </div>
      )}

      <div className="space-y-2">
        {pending.map((task) => {
          const cat = CATEGORY_ICONS[task.category];
          return (
            <button
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded border-2 border-gray-600 group-hover:border-teal-400 flex items-center justify-center flex-shrink-0 transition" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs ${cat.color}`}>{cat.icon} {cat.label}</span>
                    <span className="text-yellow-400 text-xs">{"★".repeat(Math.min(task.priority, 5))}</span>
                  </div>
                  <div className="text-sm text-white font-semibold">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {done.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowDone(!showDone)}
            className="text-xs text-gray-500 hover:text-gray-400 transition"
          >
            {showDone ? "▼" : "▶"} 完了済み（{done.length}件）
          </button>
          {showDone && (
            <div className="space-y-1 mt-2">
              {done.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleToggle(task.id)}
                  className="w-full text-left bg-gray-800/50 rounded-lg p-2 transition opacity-50 hover:opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-400 line-through">{task.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
