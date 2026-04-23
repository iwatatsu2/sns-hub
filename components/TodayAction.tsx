"use client";

import Link from "next/link";
import type { DailyTask, WeekTheme } from "@/lib/strategy";

interface WeekDay {
  day: string;
  done: boolean;
  isToday: boolean;
  date: string;
}

interface TopicSummary {
  id: string;
  title: string;
  priority: number;
  category: string;
}

interface Props {
  today: string; // "2026-04-23"
  dayName: string; // "木"
  weekTheme: WeekTheme;
  dailyTasks: DailyTask[];
  weekProgress: WeekDay[];
  recommendedTopics: TopicSummary[];
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  x: "𝕏",
  note: "note",
  antaa: "antaa",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  x: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  note: "bg-green-500/20 text-green-400 border-green-500/30",
  antaa: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function TodayAction({ today, dayName, weekTheme, dailyTasks, weekProgress, recommendedTopics }: Props) {
  const autoTasks = dailyTasks.filter((t) => t.type === "auto");
  const manualTasks = dailyTasks.filter((t) => t.type === "manual");

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">{today.slice(5).replace("-", "/")}（{dayName}）</span>
            <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-sm font-bold">
              第{weekTheme.week}週：{weekTheme.theme}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            医療 {weekTheme.medical} / テック {weekTheme.tech}
          </p>
        </div>
        <Link
          href="/pipeline"
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-3 rounded-xl transition flex items-center gap-2"
        >
          コンテンツ生成 →
        </Link>
      </div>

      {/* Today's Tasks */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Auto Tasks */}
        {autoTasks.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">自動生成（Claude Code）</h4>
            <div className="space-y-2">
              {autoTasks.map((task, i) => (
                <div key={i} className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${PLATFORM_COLORS[task.platform]}`}>
                  <span className="text-xs font-black w-10">{PLATFORM_ICONS[task.platform]}</span>
                  <span className="text-sm">{task.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Manual Tasks */}
        {manualTasks.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">あなたが対応</h4>
            <div className="space-y-2">
              {manualTasks.map((task, i) => (
                <div key={i} className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${PLATFORM_COLORS[task.platform]}`}>
                  <span className="text-xs font-black w-10">{PLATFORM_ICONS[task.platform]}</span>
                  <span className="text-sm">{task.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Topics */}
      {recommendedTopics.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">おすすめトピック</h4>
          <div className="flex gap-2 flex-wrap">
            {recommendedTopics.map((topic) => (
              <Link
                key={topic.id}
                href="/pipeline"
                className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 transition"
              >
                <span className="text-yellow-400 text-xs mr-1">{"★".repeat(Math.min(topic.priority, 5))}</span>
                <span className="text-sm text-white">{topic.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Week Progress */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">今週の投稿進捗</h4>
        <div className="flex gap-1">
          {weekProgress.map((d) => (
            <div
              key={d.date}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold ${
                d.isToday
                  ? "ring-2 ring-teal-400 bg-teal-500/20 text-teal-300"
                  : d.done
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-800 text-gray-600"
              }`}
            >
              <div>{d.day}</div>
              <div className="text-lg mt-0.5">{d.done ? "✓" : d.isToday ? "●" : "−"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
