"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ---------- 戦略定義（クライアント側） ---------- */

interface DailyTask {
  platform: string;
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
  { week: 1, theme: "CGM・血糖モニタリング" },
  { week: 2, theme: "インスリン療法" },
  { week: 3, theme: "糖尿病と食事" },
  { week: 4, theme: "医師×AI" },
];
const EPOCH = new Date("2026-04-20T00:00:00+09:00");
const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", x: "𝕏", note: "📝", antaa: "🏥",
};

function getWeekTheme(date: Date) {
  const diffMs = date.getTime() - EPOCH.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const dow = date.getDay();
  const mondayOff = dow === 0 ? 6 : dow - 1;
  const weekStart = diffDays - mondayOff;
  const weekNum = Math.floor(weekStart / 7);
  return WEEK_THEMES[((weekNum % 4) + 4) % 4];
}

/* ---------- データ型 ---------- */

interface DailyLog {
  date: string;
  step1: { reflection: string; good: string; improve: string };
  step2: { notes: string };
  step3: { focus: string };
  step4: { checklist: Record<string, boolean> };
  step5: { rating: number; notes: string };
  step6: { extraTodos: string[] };
  currentStep: number;
}

interface PostSummary {
  id: string;
  title: string;
  scheduledDate: string;
  status: string;
}

const STORAGE_KEY = "sns-hub-daily-log";
const STEPS = [
  { num: 1, label: "振り返り", icon: "🔍" },
  { num: 2, label: "リサーチ", icon: "📊" },
  { num: 3, label: "改善", icon: "🔧" },
  { num: 4, label: "投稿", icon: "📮" },
  { num: 5, label: "レビュー", icon: "⭐" },
  { num: 6, label: "明日TODO", icon: "📋" },
];

function emptyLog(date: string): DailyLog {
  return {
    date,
    step1: { reflection: "", good: "", improve: "" },
    step2: { notes: "" },
    step3: { focus: "" },
    step4: { checklist: {} },
    step5: { rating: 3, notes: "" },
    step6: { extraTodos: [] },
    currentStep: 1,
  };
}

export default function DailyPage() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const tomorrow = new Date(today.getTime() + 86400000);
  const dayName = DAY_NAMES[today.getDay()];
  const weekTheme = getWeekTheme(today);
  const todayTasks = DAILY_TASKS[today.getDay()] || [];
  const tomorrowTasks = DAILY_TASKS[tomorrow.getDay()] || [];

  const [log, setLog] = useState<DailyLog>(emptyLog(todayStr));
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DailyLog = JSON.parse(saved);
        if (parsed.date === todayStr) {
          setLog(parsed);
        } else {
          // New day — reset
          const fresh = emptyLog(todayStr);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
          setLog(fresh);
        }
      }
    } catch { /* ignore */ }
  }, [todayStr]);

  // Save to localStorage on change
  const saveLog = useCallback((updated: DailyLog) => {
    setLog(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Fetch posts
  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const yesterdayPosts = posts.filter(p => p.scheduledDate === yesterdayStr);
  const todayPosts = posts.filter(p => p.scheduledDate === todayStr);
  const step = log.currentStep;

  const goStep = (n: number) => saveLog({ ...log, currentStep: n });
  const updateStep1 = (field: keyof DailyLog["step1"], value: string) =>
    saveLog({ ...log, step1: { ...log.step1, [field]: value } });
  const updateStep2 = (value: string) =>
    saveLog({ ...log, step2: { ...log.step2, notes: value } });
  const updateStep3 = (value: string) =>
    saveLog({ ...log, step3: { ...log.step3, focus: value } });
  const toggleCheck = (key: string) =>
    saveLog({ ...log, step4: { ...log.step4, checklist: { ...log.step4.checklist, [key]: !log.step4.checklist[key] } } });
  const updateStep5 = (field: string, value: string | number) =>
    saveLog({ ...log, step5: { ...log.step5, [field]: value } });
  const addTodo = () => {
    if (!newTodo.trim()) return;
    saveLog({ ...log, step6: { ...log.step6, extraTodos: [...log.step6.extraTodos, newTodo.trim()] } });
    setNewTodo("");
  };
  const removeTodo = (idx: number) =>
    saveLog({ ...log, step6: { ...log.step6, extraTodos: log.step6.extraTodos.filter((_, i) => i !== idx) } });

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">
          {today.getMonth() + 1}/{today.getDate()}({dayName}) デイリーワークフロー
        </h1>
        <p className="text-teal-400 text-xs font-bold">第{weekTheme.week}週: {weekTheme.theme}</p>
      </div>

      {/* ステップナビ */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {STEPS.map((s) => (
          <button
            key={s.num}
            onClick={() => goStep(s.num)}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              step === s.num
                ? "bg-teal-600 text-white"
                : s.num < step
                ? "bg-teal-900/40 text-teal-400"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: 昨日の振り返り */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">🔍 Step 1: 昨日の振り返り</h2>

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">昨日({yesterday.getMonth() + 1}/{yesterday.getDate()})の投稿:</p>
            {yesterdayPosts.length === 0 ? (
              <p className="text-gray-500 text-xs">投稿記録なし</p>
            ) : (
              yesterdayPosts.map(p => (
                <div key={p.id} className="text-sm text-gray-300 flex items-center gap-2 py-1">
                  <span>{p.status === "posted" ? "✅" : "📅"}</span>
                  <span>{p.title}</span>
                </div>
              ))
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">反省メモ（うまくいかなかったこと）</label>
            <textarea
              value={log.step1.reflection}
              onChange={e => updateStep1("reflection", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-20 resize-none"
              placeholder="例: フック文が弱かった、投稿時間が遅かった..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">良かった点</label>
            <textarea
              value={log.step1.good}
              onChange={e => updateStep1("good", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-20 resize-none"
              placeholder="例: note記事のいいね数が増えた..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">次回の改善点</label>
            <textarea
              value={log.step1.improve}
              onChange={e => updateStep1("improve", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-20 resize-none"
              placeholder="例: フックを問題提起型に変える..."
            />
          </div>

          <button onClick={() => goStep(2)} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
            次へ: リサーチ →
          </button>
        </div>
      )}

      {/* Step 2: リサーチ */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">📊 Step 2: リサーチ</h2>

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">今週のテーマ: <span className="text-teal-400 font-bold">{weekTheme.theme}</span></p>
            <p className="text-xs text-gray-500">SNS Hubのパイプラインでストックを確認し、トレンドを把握しましょう。</p>
            <Link href="/pipeline" className="inline-block mt-2 text-xs text-teal-400 hover:text-teal-300 underline">
              → パイプラインを確認
            </Link>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">リサーチメモ（気になったトレンド・ネタ）</label>
            <textarea
              value={log.step2.notes}
              onChange={e => updateStep2(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-28 resize-none"
              placeholder="例: GLP-1の新しい臨床試験結果が出た..."
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => goStep(1)} className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm">
              ← 戻る
            </button>
            <button onClick={() => goStep(3)} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
              次へ: 改善 →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 改善（Plan→Do） */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">🔧 Step 3: 改善プラン</h2>

          {/* 前ステップからの引用 */}
          {log.step1.improve && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
              <p className="text-[10px] text-amber-400 font-bold mb-1">前回の改善点:</p>
              <p className="text-xs text-amber-200">{log.step1.improve}</p>
            </div>
          )}
          {log.step2.notes && (
            <div className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-3">
              <p className="text-[10px] text-violet-400 font-bold mb-1">リサーチメモ:</p>
              <p className="text-xs text-violet-200">{log.step2.notes}</p>
            </div>
          )}

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">今日のタスク:</p>
            {todayTasks.map((t, i) => (
              <div key={i} className="text-sm text-gray-300 flex items-center gap-2 py-1">
                <span>{PLATFORM_ICONS[t.platform]}</span>
                <span className="font-bold">{t.platform}</span>
                <span>{t.action}</span>
                {t.type === "manual" && <span className="text-[10px] text-yellow-400">手動</span>}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">今日意識すること</label>
            <textarea
              value={log.step3.focus}
              onChange={e => updateStep3(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-20 resize-none"
              placeholder="例: フック文を問題提起型にする、投稿を12時に合わせる..."
            />
          </div>

          <Link href="/pipeline" className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl transition text-sm text-center">
            → パイプラインでコンテンツ生成
          </Link>

          <div className="flex gap-2">
            <button onClick={() => goStep(2)} className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm">
              ← 戻る
            </button>
            <button onClick={() => goStep(4)} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
              次へ: 投稿チェック →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 投稿チェック */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">📮 Step 4: 投稿チェック</h2>

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-3">今日の投稿予定:</p>
            {todayPosts.length === 0 && todayTasks.length === 0 ? (
              <p className="text-gray-500 text-xs">今日の投稿はありません</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t, i) => {
                  const key = `${t.platform}-${t.action}`;
                  const checked = log.step4.checklist[key] || false;
                  return (
                    <label key={i} className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCheck(key)}
                        className="w-4 h-4 rounded accent-teal-500"
                      />
                      <span className={`text-sm ${checked ? "text-teal-400 line-through" : "text-gray-300"}`}>
                        {PLATFORM_ICONS[t.platform]} {t.platform} — {t.action}
                      </span>
                      {t.type === "manual" && <span className="text-[10px] text-yellow-400">手動</span>}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {todayPosts.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">登録済みの投稿:</p>
              {todayPosts.map(p => (
                <div key={p.id} className="text-sm text-gray-300 py-1">
                  {p.status === "posted" ? "✅" : "📅"} {p.title}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => goStep(3)} className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm">
              ← 戻る
            </button>
            <button onClick={() => goStep(5)} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
              次へ: レビュー →
            </button>
          </div>
        </div>
      )}

      {/* Step 5: 1日のレビュー */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">⭐ Step 5: 今日のレビュー</h2>

          {/* 自動サマリー */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">今日の実績:</p>
            <div className="text-sm text-gray-300 space-y-1">
              <p>投稿チェック: {Object.values(log.step4.checklist).filter(Boolean).length}/{todayTasks.length} 完了</p>
              {log.step3.focus && <p>意識したこと: {log.step3.focus}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">今日の自己評価</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => updateStep5("rating", n)}
                  className={`w-10 h-10 rounded-lg text-lg transition ${
                    n <= log.step5.rating
                      ? "bg-teal-600 text-white"
                      : "bg-gray-800 text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">気づき・メモ</label>
            <textarea
              value={log.step5.notes}
              onChange={e => updateStep5("notes", e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 h-24 resize-none"
              placeholder="例: カルーセルの保存率が上がった、フック文を変えたら反応が良かった..."
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => goStep(4)} className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm">
              ← 戻る
            </button>
            <button onClick={() => goStep(6)} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
              次へ: 明日TODO →
            </button>
          </div>
        </div>
      )}

      {/* Step 6: 明日のTODO */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-sm">📋 Step 6: 明日のTODO</h2>

          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">
              明日({tomorrow.getMonth() + 1}/{tomorrow.getDate()} {DAY_NAMES[tomorrow.getDay()]})のタスク:
            </p>
            {tomorrowTasks.map((t, i) => (
              <div key={i} className="text-sm text-gray-300 flex items-center gap-2 py-1">
                <span>{PLATFORM_ICONS[t.platform]}</span>
                <span className="font-bold">{t.platform}</span>
                <span>{t.action}</span>
                {t.type === "manual" && <span className="text-[10px] text-yellow-400">手動</span>}
              </div>
            ))}
          </div>

          {/* 追加TODO */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">追加TODO</label>
            <div className="flex gap-2">
              <input
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTodo()}
                className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
                placeholder="やるべきことを追加..."
              />
              <button onClick={addTodo} className="bg-teal-700 hover:bg-teal-600 text-white text-sm font-bold px-3 py-2 rounded-lg transition">
                追加
              </button>
            </div>
            {log.step6.extraTodos.length > 0 && (
              <div className="mt-2 space-y-1">
                {log.step6.extraTodos.map((todo, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300">・{todo}</span>
                    <button onClick={() => removeTodo(i)} className="text-gray-600 hover:text-red-400 text-xs">削除</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 今日の改善点を明日に引き継ぎ */}
          {log.step1.improve && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
              <p className="text-[10px] text-amber-400 font-bold mb-1">引き継ぎ改善点:</p>
              <p className="text-xs text-amber-200">{log.step1.improve}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => goStep(5)} className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 rounded-xl transition text-sm">
              ← 戻る
            </button>
          </div>

          <div className="bg-teal-900/30 border border-teal-500/30 rounded-xl p-4 text-center">
            <p className="text-teal-400 font-bold text-sm">お疲れさまでした！</p>
            <p className="text-gray-400 text-xs mt-1">明日もこのページからスタートしましょう。</p>
          </div>
        </div>
      )}
    </div>
  );
}
