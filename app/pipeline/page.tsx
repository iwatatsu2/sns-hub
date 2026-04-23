"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GeneratedContent from "@/components/GeneratedContent";
import type { Topic } from "@/lib/topics";
import type { GeneratedResult } from "@/lib/content-types";

/* ---------- strategy 定義（クライアント側で再定義、server import不可） ---------- */

interface DailyTask {
  platform: "instagram" | "x" | "note" | "antaa";
  action: string;
  type: "auto" | "manual";
}

const DAILY_TASKS: Record<number, DailyTask[]> = {
  0: [
    { platform: "instagram", action: "ストーリーズ（週まとめ）", type: "manual" },
    { platform: "x", action: "振り返り・来週告知", type: "auto" },
  ],
  1: [
    { platform: "x", action: "テーマ告知ツイート", type: "auto" },
    { platform: "note", action: "テーマ決定・構成", type: "auto" },
  ],
  2: [
    { platform: "x", action: "ミニ解説ツイート", type: "auto" },
    { platform: "note", action: "記事を執筆・公開", type: "auto" },
  ],
  3: [
    { platform: "instagram", action: "カルーセル投稿", type: "auto" },
    { platform: "x", action: "noteへの誘導", type: "auto" },
  ],
  4: [
    { platform: "instagram", action: "リール投稿", type: "auto" },
    { platform: "x", action: "テック裏話", type: "auto" },
    { platform: "antaa", action: "スライド公開", type: "auto" },
  ],
  5: [
    { platform: "instagram", action: "ストーリーズQ&A", type: "manual" },
    { platform: "x", action: "スレッド投稿", type: "auto" },
  ],
  6: [
    { platform: "x", action: "ゆるツイート", type: "manual" },
  ],
};

const WEEK_THEMES = [
  { week: 1, theme: "CGM・血糖モニタリング", category: "diabetes" },
  { week: 2, theme: "インスリン療法", category: "diabetes" },
  { week: 3, theme: "糖尿病と食事", category: "diabetes" },
  { week: 4, theme: "医師×AI", category: "ai" },
];

const EPOCH = new Date("2026-04-20T00:00:00+09:00");

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  x: "𝕏",
  note: "📝",
  antaa: "🏥",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  x: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  note: "bg-green-500/20 text-green-300 border-green-500/30",
  antaa: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getWeekTheme(date: Date) {
  const diffMs = date.getTime() - EPOCH.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = diffDays - mondayOffset;
  const weekNum = Math.floor(weekStart / 7);
  const rotationIdx = ((weekNum % 4) + 4) % 4;
  return WEEK_THEMES[rotationIdx];
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

interface PostSummary {
  id: string;
  title: string;
  scheduledDate: string;
  status: string;
}

export default function PipelinePage() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockMessage, setStockMessage] = useState("");

  const weekDates = getWeekDates(weekOffset);
  const weekTheme = getWeekTheme(weekDates[0]);
  const todayStr = new Date().toISOString().slice(0, 10);

  const fetchData = useCallback(async () => {
    const [topicsRes, postsRes] = await Promise.all([
      fetch("/api/topics?filter=pending"),
      fetch("/api/posts"),
    ]);
    const topicsData: Topic[] = await topicsRes.json();
    const postsData: PostSummary[] = await postsRes.json();
    setTopics(topicsData);
    setPosts(postsData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}〜${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;

  const selectedDate = selectedDayIdx !== null ? weekDates[selectedDayIdx] : null;
  const selectedDayOfWeek = selectedDate ? selectedDate.getDay() : -1;
  const selectedTasks = selectedDayOfWeek >= 0 ? (DAILY_TASKS[selectedDayOfWeek] || []) : [];
  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : "";
  const hasAutoTask = selectedTasks.some((t) => t.type === "auto");
  const dayPosts = posts.filter((p) => p.scheduledDate === selectedDateStr);

  const handleGenerate = async () => {
    if (!selectedTopicId) return;
    setLoading(true);
    try {
      await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStatus", id: selectedTopicId, status: "approved" }),
      });
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopicId }),
      });
      const result = await res.json();
      setGenerated(result);
    } catch (err) {
      alert("エラー: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  const handleSaveToPost = async () => {
    if (!generated || !selectedTopicId) return;
    setLoading(true);
    const topic = topics.find((t) => t.id === selectedTopicId);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: topic?.title || selectedTopicId,
        theme: topic?.hook || "",
        status: "scheduled",
        scheduledDate: selectedDateStr,
        platforms: generated.platforms,
        assets: [],
      }),
    });
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", id: selectedTopicId, status: "generated" }),
    });
    setLoading(false);
    setGenerated(null);
    setSelectedTopicId("");
    await fetchData();
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { setWeekOffset((o) => o - 1); setSelectedDayIdx(null); setGenerated(null); }}
              className="text-gray-400 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800 transition">◀</button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white">{weekLabel}</h1>
              <p className="text-teal-400 text-xs font-bold">第{weekTheme.week}週: {weekTheme.theme}</p>
            </div>
            <button onClick={() => { setWeekOffset((o) => o + 1); setSelectedDayIdx(null); setGenerated(null); }}
              className="text-gray-400 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-800 transition">▶</button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {weekOffset !== 0 && (
              <button onClick={() => { setWeekOffset(0); setSelectedDayIdx(null); setGenerated(null); }}
                className="text-[10px] text-teal-400 hover:text-teal-300 whitespace-nowrap">今週</button>
            )}
            <button
              onClick={async () => {
                setStockLoading(true); setStockMessage("");
                try {
                  const res = await fetch("/api/topics/stock", { method: "POST" });
                  const data = await res.json();
                  setStockMessage(data.message);
                  if (data.added > 0) await fetchData();
                } catch { setStockMessage("エラー"); }
                setStockLoading(false);
                setTimeout(() => setStockMessage(""), 5000);
              }}
              disabled={stockLoading}
              className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              {stockLoading ? "..." : "＋ ストック"}
            </button>
          </div>
        </div>
        {stockMessage && <p className="text-xs text-teal-400 text-right">{stockMessage}</p>}
      </div>

      {/* 週間カレンダー — モバイル縦並び / PC横並び */}
      <div className="space-y-1.5 md:space-y-0 md:grid md:grid-cols-7 md:gap-1.5">
        {weekDates.map((date, idx) => {
          const dateStr = date.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;
          const isSelected = selectedDayIdx === idx;
          const dayOfWeek = date.getDay();
          const tasks = DAILY_TASKS[dayOfWeek] || [];
          const hasAuto = tasks.some((t) => t.type === "auto");
          const scheduledPosts = posts.filter((p) => p.scheduledDate === dateStr);
          const isPast = dateStr < todayStr;

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDayIdx(isSelected ? null : idx);
                setGenerated(null);
                setSelectedTopicId("");
              }}
              className={`w-full rounded-xl p-3 text-left transition-all border ${
                isSelected
                  ? "border-teal-400 bg-teal-900/30 ring-1 ring-teal-400/50"
                  : isToday
                  ? "border-teal-500/50 bg-gray-800/80"
                  : "border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/70"
              }`}
            >
              {/* モバイル: 横レイアウト */}
              <div className="flex items-center gap-3 md:flex-col md:items-stretch md:gap-0">
                {/* 曜日・日付 */}
                <div className="flex items-center gap-1.5 md:justify-between md:mb-2 flex-shrink-0 w-14 md:w-auto">
                  <span className={`text-sm font-bold md:text-xs ${isToday ? "text-teal-400" : "text-gray-400"}`}>
                    {DAY_LABELS[idx]}
                  </span>
                  <span className={`text-xs md:text-[10px] ${isToday ? "text-teal-400 font-bold" : "text-gray-500"}`}>
                    {date.getMonth() + 1}/{date.getDate()}
                  </span>
                </div>

                {/* タスク一覧 */}
                <div className="flex flex-wrap gap-1 md:flex-col md:space-y-1 md:gap-0 flex-1 min-w-0">
                  {tasks.map((task, ti) => (
                    <div key={ti} className={`text-xs md:text-[10px] px-2 py-1 md:px-1.5 md:py-0.5 rounded border inline-flex items-center gap-1 ${PLATFORM_COLORS[task.platform]}`}>
                      <span>{PLATFORM_ICONS[task.platform]}</span>
                      <span className="truncate">{task.action}</span>
                      {task.type === "manual" && <span className="opacity-60 text-[10px]">手動</span>}
                    </div>
                  ))}
                </div>

                {/* 状態 */}
                <div className="flex-shrink-0 text-right md:text-left md:mt-1.5">
                  {scheduledPosts.length > 0 ? (
                    scheduledPosts.map((p) => (
                      <div key={p.id} className="text-[10px] text-teal-400 truncate max-w-[120px] md:max-w-none">
                        {isPast ? "✅" : "📅"} {p.title}
                      </div>
                    ))
                  ) : hasAuto ? (
                    <span className={`text-[10px] ${isPast ? "text-red-400" : "text-gray-500"}`}>
                      {isPast ? "⚠ 未投稿" : "空き"}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 選択日の詳細パネル */}
      {selectedDayIdx !== null && selectedDate && !generated && (
        <div className="mt-4 bg-gray-800/60 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-sm">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()}({DAY_LABELS[selectedDayIdx]}) のタスク
            </h2>
            <button onClick={() => { setSelectedDayIdx(null); setGenerated(null); }}
              className="text-gray-500 hover:text-gray-300 text-xs">閉じる</button>
          </div>

          <div className="space-y-2 mb-3">
            {selectedTasks.map((task, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${PLATFORM_COLORS[task.platform]}`}>
                <span>{PLATFORM_ICONS[task.platform]}</span>
                <span className="font-bold text-xs">{task.platform}</span>
                <span className="text-xs">{task.action}</span>
                {task.type === "manual" && (
                  <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">手動</span>
                )}
              </div>
            ))}
          </div>

          {dayPosts.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 mb-1">登録済み:</p>
              {dayPosts.map((p) => (
                <div key={p.id} className="text-xs text-teal-400 flex items-center gap-1">
                  <span>{p.status === "posted" ? "✅" : "📅"}</span>
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          )}

          {hasAutoTask && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-[10px] text-gray-400 mb-2">トピックを選んでコンテンツ生成:</p>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white text-xs rounded-lg px-3 py-2 mb-2"
              >
                <option value="">トピックを選択...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category}] {t.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedTopicId || loading}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-lg transition text-sm"
              >
                {loading ? "生成中..." : "コンテンツ生成"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 生成結果 */}
      {generated && (
        <div className="mt-4">
          <GeneratedContent
            platforms={generated.platforms}
            reelScenes={generated.reelScenes}
            slideOutline={generated.slideOutline}
            reelHtml={generated.reelHtml}
            slides={generated.slides}
            references={generated.references}
            factChecks={generated.factChecks}
            topicId={selectedTopicId}
          />
          <div className="flex flex-col sm:flex-row gap-2 mt-6 max-w-2xl mx-auto">
            <button
              onClick={handleSaveToPost}
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              {loading ? "保存中..." : `${selectedDateStr} に投稿登録`}
            </button>
            <button
              onClick={() => { setGenerated(null); setSelectedTopicId(""); }}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-xl transition text-sm"
            >
              ボツ
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-center text-[10px] text-gray-500">
        ストック: {topics.length}件
      </div>
    </div>
  );
}
