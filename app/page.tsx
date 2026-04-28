"use client";

import React, { useState, useEffect, useCallback } from "react";
import { POST_LINKS } from "@/lib/post-links";
import NoteThumbnail from "@/components/NoteThumbnail";

/* ---------- 型定義 ---------- */
interface Topic {
  id: string;
  title: string;
  category: string;
  hook: string;
  source: string;
  aiAngle: string;
  appTieIn: string;
  priority: number;
  status: string;
}
interface DailyTask {
  platform: string;
  action: string;
  type: string;
}
interface WeekTheme {
  week: number;
  theme: string;
  category: string;
}

/* ---------- 小物コンポーネント ---------- */

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded transition"
    >
      {copied ? "✓" : label || "コピー"}
    </button>
  );
}

const IMPACT_KW = [
  "糖尿病", "血糖値", "HbA1c", "インスリン", "低血糖", "高血糖",
  "肥満", "GLP-1", "SGLT2", "DPP-4", "CGM", "FGM",
  "AI", "DKA", "ケトアシドーシス",
  "危険", "注意", "最新", "革命", "必須", "重要", "緊急",
  "合併症", "透析", "失明", "壊疽", "腎症", "網膜症",
  "健康診断", "専門医", "新薬", "ガイドライン",
  "甲状腺", "副腎", "内分泌", "メトホルミン",
];

function ThumbTitle({ title, color }: { title: string; color: "teal" | "orange" }) {
  const highlight = color === "teal"
    ? "text-teal-300 bg-teal-400/20 px-1 rounded"
    : "text-orange-300 bg-orange-400/20 px-1 rounded";

  const parts: React.ReactNode[] = [];
  let remaining = title;
  let key = 0;
  while (remaining.length > 0) {
    let earliest = -1;
    let matchedKw = "";
    for (const kw of IMPACT_KW) {
      const idx = remaining.indexOf(kw);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        matchedKw = kw;
      }
    }
    if (earliest === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (earliest > 0) parts.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    parts.push(<span key={key++} className={highlight}>{matchedKw}</span>);
    remaining = remaining.slice(earliest + matchedKw.length);
  }

  return (
    <div className="text-white font-black text-lg md:text-2xl lg:text-3xl leading-tight"
      style={{ wordBreak: "keep-all", overflowWrap: "anywhere", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
      {parts}
    </div>
  );
}

function PostLink({ platform }: { platform: keyof typeof POST_LINKS }) {
  return (
    <a href={POST_LINKS[platform]} target="_blank" rel="noopener noreferrer"
      className="text-xs bg-teal-800 hover:bg-teal-700 text-teal-200 px-2 py-1 rounded transition">
      投稿画面 →
    </a>
  );
}

/* ---------- 生成結果の型 ---------- */
interface GeneratedResult {
  noteTitle: string;
  noteBody: string;
  xText: string;
  igCaption: string;
  igHashtags: string[];
  noteBodyPublic: string;
  review: string;
  reelHtml: string;
}

/* ---------- メインページ ---------- */

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [weekTheme, setWeekTheme] = useState<WeekTheme | null>(null);
  const [dayName, setDayName] = useState("");
  const [today, setToday] = useState("");

  // 生成状態
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  // 投稿チェック（localStorage）
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // 投稿済みアーカイブ（localStorage）
  interface PostedArchiveItem { id: string; title: string; postedAt: string }
  const [postedArchive, setPostedArchive] = useState<PostedArchiveItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  // 初期データ取得
  useEffect(() => {
    const now = new Date();
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    setDayName(dayNames[now.getDay()]);
    setToday(now.toISOString().slice(0, 10));

    fetch("/api/topics?filter=pending")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          // localStorage の投稿済みアーカイブを除外
          try {
            const arch = localStorage.getItem("sns-hub-posted-archive");
            if (arch) {
              const postedIds = new Set(JSON.parse(arch).map((a: { id: string }) => a.id));
              setTopics(d.filter((t: Topic) => !postedIds.has(t.id)));
              return;
            }
          } catch { /* ignore */ }
          setTopics(d);
        }
      })
      .catch(() => {});

    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => {
        if (d.tasks) setTasks(d.tasks);
        if (d.weekTheme) setWeekTheme(d.weekTheme);
      })
      .catch(() => {});
  }, []);

  // localStorage から投稿チェック復元
  useEffect(() => {
    if (!today) return;
    try {
      const saved = localStorage.getItem(`sns-hub-checks-${today}`);
      if (saved) setChecks(JSON.parse(saved));
    } catch { /* ignore */ }
    // 投稿済みアーカイブ復元
    try {
      const arch = localStorage.getItem("sns-hub-posted-archive");
      if (arch) setPostedArchive(JSON.parse(arch));
    } catch { /* ignore */ }
  }, [today]);

  // トピックを投稿済みに移動
  const markAsPosted = useCallback((topicId: string, topicTitle: string) => {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
    const newItem: PostedArchiveItem = { id: topicId, title: topicTitle, postedAt: dateStr };
    const updated = [newItem, ...postedArchive.filter(a => a.id !== topicId)];
    setPostedArchive(updated);
    try { localStorage.setItem("sns-hub-posted-archive", JSON.stringify(updated)); } catch { /* ignore */ }
    // ストックから除外
    setTopics(prev => prev.filter(t => t.id !== topicId));
    // 選択解除＆結果クリア
    setSelectedId("");
    setResult(null);
  }, [postedArchive]);

  const saveChecks = useCallback((c: Record<string, boolean>) => {
    setChecks(c);
    try { if (today) localStorage.setItem(`sns-hub-checks-${today}`, JSON.stringify(c)); } catch { /* ignore */ }
  }, [today]);

  /* ---------- 全自動生成 ---------- */
  const generateAll = async () => {
    if (!selectedId) return;
    const topic = topics.find((t) => t.id === selectedId);
    if (!topic) return;

    setGenerating(true);
    setResult(null);
    setProgress("ベースデータ取得中...");

    try {
      // 1. サーバーでベースデータ取得
      const baseRes = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedId }),
      });
      const baseData = await baseRes.json();
      if (!baseRes.ok) throw new Error(baseData.error || "生成失敗");

      setProgress("コンテンツ生成中...");

      // baseDataからすべて取得（API不要、content-generator.tsで生成済み）
      const noteBody = baseData.platforms?.note?.body || "";
      const xText = baseData.platforms?.x?.text || "";
      const igCaption = baseData.platforms?.instagram?.caption || "";
      const igHashtags = baseData.platforms?.instagram?.hashtags || [];

      // AI生成コンテンツがあれば優先（Claude Codeで事前生成→generated-index.jsonに保存済み）
      const aiNote = baseData.aiContent?.noteBody || "";
      const aiNotePublic = baseData.aiContent?.noteBodyPublic || "";
      const aiXText = baseData.aiContent?.xText || "";
      const aiReview = baseData.aiContent?.review || "";

      setProgress("完了！");

      setResult({
        noteTitle: `【専門医が解説】${topic.title}`,
        noteBody: aiNote || noteBody,
        xText: aiXText || xText,
        noteBodyPublic: aiNotePublic,
        igCaption,
        igHashtags,
        review: aiReview || "💡 高品質なレビューはClaude Codeで「/sns テーマ名」を実行すると生成されます",
        reelHtml: baseData.reelHtml || "",
      });

      // トピックステータス更新
      fetch("/api/topics/generated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedId }),
      }).catch(() => {});

    } catch (e) {
      setProgress(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    }
    setGenerating(false);
  };

  const selectedTopic = topics.find((t) => t.id === selectedId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-white font-black text-lg">
              {today && `${today.slice(5).replace("-", "/")}(${dayName})`}
            </div>
            {weekTheme && (
              <div className="text-teal-400 text-sm font-bold">第{weekTheme.week}週: {weekTheme.theme}</div>
            )}
          </div>
        </div>

        {/* 今日のタスク */}
        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tasks.map((t, i) => {
              const key = `${t.platform}-${i}`;
              const done = checks[key] || false;
              return (
                <button key={key}
                  onClick={() => saveChecks({ ...checks, [key]: !done })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${done ? "bg-teal-900/50 border-teal-600 text-teal-300 line-through" : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"}`}
                >
                  {done ? "✓ " : "○ "}{t.action}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* トピック選択 + 生成ボタン */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="text-sm font-bold text-gray-400 mb-2">トピック選択</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-teal-500 outline-none min-w-0"
          >
            <option value="">-- トピックを選択 --</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>
          <button
            onClick={generateAll}
            disabled={!selectedId || generating}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-black px-4 py-2 rounded-lg transition text-sm whitespace-nowrap"
          >
            {generating ? "生成中..." : "🚀 全自動生成"}
          </button>
        </div>
        {selectedTopic && (
          <div className="mt-2 text-xs text-gray-500">{selectedTopic.hook}</div>
        )}
        {generating && (
          <div className="mt-2 text-sm text-teal-400 animate-pulse">{progress}</div>
        )}
      </div>

      {/* 生成結果 */}
      {result && (
        <div className="space-y-4">
          {/* note 医師向け */}
          {result.noteBody && <div className="border-l-4 border-teal-500 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className="font-bold text-white text-sm">📝 note（医師向け）</span>
              <div className="flex gap-1.5 flex-wrap">
                {!result.noteBody.includes("まだ生成されていません") && (
                  <>
                    <CopyBtn text={`${result.noteTitle}\n\n${result.noteBody}`} />
                    <PostLink platform="note" />
                  </>
                )}
              </div>
            </div>
            {result.noteBody.includes("まだ生成されていません") ? (
              <div className="py-6 px-4 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
                <div className="text-2xl mb-3">📝</div>
                <p className="text-white font-bold text-sm mb-2">note記事は未生成です</p>
                <p className="text-gray-400 text-xs mb-4">Claude Codeで以下を実行すると生成されます</p>
                <div className="inline-block bg-gray-800 border border-teal-500/30 rounded-lg px-4 py-2.5 mb-3">
                  <code className="text-teal-400 text-sm font-mono">/sns {selectedTopic?.title || "テーマ名"}</code>
                </div>
                <p className="text-gray-500 text-xs">生成後、自動的にこの画面に反映されます</p>
              </div>
            ) : (
              <>
                <NoteThumbnail
                  title={result.noteTitle}
                  variant="medical"
                  category={selectedTopic?.category}
                  subtitle={selectedTopic?.hook}
                />
                <div className="max-h-[400px] overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.noteBody}</pre>
                </div>
                <div className="text-xs text-gray-500 mt-1">{result.noteBody.length}文字</div>
              </>
            )}
          </div>}

          {/* note 一般向け */}
          {result.noteBodyPublic && (
            <div className="border-l-4 border-orange-500 bg-gray-800 rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <span className="font-bold text-white text-sm">📝 note（一般の方向け）</span>
                <div className="flex gap-1.5 flex-wrap">
                  <CopyBtn text={`${result.noteTitle}\n\n${result.noteBodyPublic}`} />
                  <PostLink platform="note" />
                </div>
              </div>
              {/* 一般向けサムネイル */}
              <NoteThumbnail
                title={result.noteTitle}
                variant="public"
                category={selectedTopic?.category}
                subtitle={selectedTopic?.hook}
              />
              <div className="max-h-[400px] overflow-y-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.noteBodyPublic}</pre>
              </div>
              <div className="text-xs text-gray-500 mt-1">{result.noteBodyPublic.length}文字</div>
            </div>
          )}

          {/* X */}
          <div className="border-l-4 border-gray-400 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className="font-bold text-white text-sm">𝕏 X</span>
              <div className="flex gap-1.5 flex-wrap">
                <CopyBtn text={result.xText} />
                <PostLink platform="x" />
              </div>
            </div>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{result.xText}</pre>
          </div>

          {/* Instagram */}
          <div className="border-l-4 border-pink-500 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className="font-bold text-white text-sm">📷 Instagram</span>
              <div className="flex gap-1.5 flex-wrap">
                <CopyBtn text={result.igCaption + "\n\n" + result.igHashtags.map((h) => `#${h}`).join(" ")} />
                <PostLink platform="instagram" />
              </div>
            </div>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{result.igCaption}</pre>
            <div className="flex gap-1 mt-2 flex-wrap">
              {result.igHashtags.map((h) => (
                <span key={h} className="text-xs bg-pink-900 text-pink-300 px-2 py-0.5 rounded">#{h}</span>
              ))}
            </div>
          </div>

          {/* リール動画 */}
          {result.reelHtml && (
            <div className="border-l-4 border-purple-500 bg-gray-800 rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <span className="font-bold text-white text-sm">🎬 リール動画</span>
                <button
                  onClick={() => {
                    const blob = new Blob([result.reelHtml], { type: "text/html" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "reel.html";
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-2 py-1 rounded transition"
                >
                  HTMLダウンロード
                </button>
              </div>
              {/* プレビュー（シンプル表示） */}
              <div className="rounded-lg overflow-hidden border border-gray-700 bg-black" style={{ aspectRatio: "9/16", maxHeight: "400px" }}>
                <iframe
                  srcDoc={result.reelHtml}
                  style={{ width: "1080px", height: "1920px", transform: "scale(0.2)", transformOrigin: "top left", border: "none" }}
                  sandbox="allow-scripts allow-same-origin"
                  title="リールプレビュー"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">HTMLをダウンロードしてフル解像度で確認できます</p>
            </div>
          )}

          {/* AIレビュー */}
          <div className="border-l-4 border-amber-500 bg-gray-800 rounded-lg p-4">
            <span className="font-bold text-white text-sm mb-2 block">🔍 AIレビュー</span>
            <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto">{result.review}</pre>
          </div>

          {/* 投稿チェック */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-sm font-bold text-gray-400 mb-3">投稿チェック</div>
            <div className="flex flex-wrap gap-3">
              {(["note", "x", "instagram"] as const).map((p) => {
                const key = `posted-${p}`;
                const done = checks[key] || false;
                const labels = { note: "📝 note", x: "𝕏 X", instagram: "📷 IG" };
                return (
                  <button key={p}
                    onClick={() => saveChecks({ ...checks, [key]: !done })}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${done ? "bg-teal-900/50 border-teal-500 text-teal-300" : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"}`}
                  >
                    {done ? "✓ " : "○ "}{labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 投稿保存 */}
          <SavePostBtn
            noteTitle={result.noteTitle}
            noteBody={result.noteBody}
            xText={result.xText}
            igCaption={result.igCaption}
            igHashtags={result.igHashtags}
            today={today}
          />

          {/* 投稿完了→アーカイブ移動 */}
          {selectedTopic && (
            <button
              onClick={() => markAsPosted(selectedTopic.id, selectedTopic.title)}
              className="w-full py-3 rounded-xl font-bold text-sm transition bg-green-700 hover:bg-green-600 text-white"
            >
              ✅ 投稿完了（ストックから削除）
            </button>
          )}
        </div>
      )}

      {/* 投稿済みアーカイブ */}
      {postedArchive.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="flex justify-between items-center w-full"
          >
            <span className="font-bold text-white text-sm">✅ 投稿済み（{postedArchive.length}件）</span>
            <span className="text-gray-500 text-xs">{showArchive ? "▲ 閉じる" : "▼ 開く"}</span>
          </button>
          {showArchive && (
            <div className="mt-3 space-y-1.5">
              {postedArchive.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-gray-700/50 rounded-lg px-3 py-2">
                  <span className="text-gray-300 truncate flex-1 mr-2">{item.title}</span>
                  <span className="text-green-400 text-xs whitespace-nowrap">{item.postedAt} 投稿済み</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manusタスク（ブランディング施策） */}
      <ManusTaskList />
    </div>
  );
}

/* ---------- 投稿保存ボタン ---------- */
function SavePostBtn({ noteTitle, noteBody, xText, igCaption, igHashtags, today }: {
  noteTitle: string; noteBody: string; xText: string; igCaption: string; igHashtags: string[]; today: string;
}) {
  const [saved, setSaved] = useState(false);
  const save = async () => {
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          theme: noteTitle,
          status: "draft",
          scheduledDate: today,
          platforms: {
            note: { title: noteTitle, body: noteBody, posted: false },
            x: { text: xText, posted: false },
            instagram: { caption: igCaption, hashtags: igHashtags, posted: false },
            antaa: { title: "", description: "", tags: [], posted: false },
          },
        }),
      });
      setSaved(true);
    } catch { /* ignore */ }
  };

  return (
    <button onClick={save} disabled={saved}
      className={`w-full py-3 rounded-xl font-bold text-sm transition ${saved ? "bg-teal-900/50 text-teal-300 border border-teal-600" : "bg-teal-600 hover:bg-teal-500 text-white"}`}
    >
      {saved ? "✓ 投稿一覧に保存済み" : "💾 投稿一覧に保存"}
    </button>
  );
}


/* ---------- Manusブランディングタスク ---------- */

const MANUS_TASKS = [
  // プロフィール統一（最優先）
  { id: "m1", cat: "プロフィール", text: "全SNSのプロフィール名を「Dr. いわたつ｜AIで医療アプリを作る糖尿病専門医」に統一", priority: 5 },
  { id: "m2", cat: "プロフィール", text: "全プロフィールに公式サイトURL（driwatatsu.readdy.co）を追加", priority: 5 },
  { id: "m3", cat: "プロフィール", text: "プロフィール文を統一：キャッチフレーズ「AIで医療アプリを作る糖尿病専門医」を反映", priority: 5 },
  { id: "m4", cat: "プロフィール", text: "antaaプロフィール欄にX・IG・note・公式サイトのリンクを追加", priority: 4 },
  // コンテンツ施策
  { id: "m5", cat: "コンテンツ", text: "既存antaaスライド末尾にCTAページ追加（「詳しくはnoteで」「DM Compassを使ってみよう」）", priority: 4 },
  { id: "m6", cat: "コンテンツ", text: "過去のIG投稿で反応が良かったものをカルーセルにリライト", priority: 3 },
  { id: "m7", cat: "コンテンツ", text: "note記事の無料→有料段階戦略を設計（300円〜3,000円）", priority: 3 },
  // エンゲージメント施策
  { id: "m8", cat: "エンゲージメント", text: "Xリプライ戦略開始：医師・テック系アカウントに質の高いリプライ1日5-10件", priority: 4 },
  { id: "m9", cat: "エンゲージメント", text: "IGストーリーズで毎日Q&A・アンケート実施（テーマ選定・ニーズ調査）", priority: 4 },
  { id: "m10", cat: "エンゲージメント", text: "X投稿後15-30分のコメントに即座に返信（会話成立で75x評価ブースト）", priority: 4 },
  // クロスプラットフォーム
  { id: "m11", cat: "クロスPF", text: "1ソース・マルチユース運用：note → IGカルーセル → リール → Xスレッド の流れを毎週実行", priority: 5 },
  { id: "m12", cat: "クロスPF", text: "各プラットフォーム間の相互誘導リンクを投稿に必ず含める", priority: 4 },
  // KPI
  { id: "m13", cat: "KPI", text: "3ヶ月目標: IG +500 / X +200 / note +100フォロワー / アプリ月2,000アクセス", priority: 3 },
];

function ManusTaskList() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sns-hub-manus-tasks");
      if (saved) setDone(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem("sns-hub-manus-tasks", JSON.stringify(next)); } catch { /* ignore */ }
  };

  const cats = ["プロフィール", "コンテンツ", "エンゲージメント", "クロスPF", "KPI"];
  const doneCount = MANUS_TASKS.filter((t) => done[t.id]).length;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-white text-sm">📋 Manusブランディング施策</span>
        <span className="text-xs text-gray-500">{doneCount}/{MANUS_TASKS.length} 完了</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
        <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${(doneCount / MANUS_TASKS.length) * 100}%` }} />
      </div>
      <div className="space-y-4">
        {cats.map((cat) => {
          const items = MANUS_TASKS.filter((t) => t.cat === cat);
          return (
            <div key={cat}>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{cat}</div>
              <div className="space-y-1">
                {items.map((t) => (
                  <button key={t.id} onClick={() => toggle(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${done[t.id] ? "bg-gray-700/30 text-gray-600 line-through" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"}`}
                  >
                    <span className="mr-2">{done[t.id] ? "✓" : "○"}</span>
                    {t.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
