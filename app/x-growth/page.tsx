"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  generateXPosts,
  TOOL_DATABASE,
  type GeneratedPost,
} from "@/lib/x-post-generator";

/* ---------- 型定義 ---------- */
interface TargetAccount {
  id: string;
  name: string;
  xHandle: string;
  url: string;
  category: string;
  memo: string;
  lastReplied: string | null;
  followed?: boolean;
}

/* ---------- 小物 ---------- */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded transition"
    >
      {copied ? "✓ コピー済" : "コピー"}
    </button>
  );
}

/* ---------- リプライテンプレート ---------- */
function generateReplies(tweet: string, category: string): string[] {
  const keywords = tweet.slice(0, 20);
  const patterns: string[] = [];

  if (category === "医師AI" || category === "テック") {
    patterns.push(
      `糖尿病専門医ですが、まさにこれ実感してます。外来で${keywords}に関連する課題、vibe codingで解決できないか試行錯誤中です。`,
      `臨床現場から見ると、${keywords}は本当に大きな変化ですね。医師がAIで実装できる時代、やれることが一気に広がった感覚があります。`,
      `これ共感します。自分もClaude Codeで臨床ツール作ってますが、${keywords}の視点は盲点でした。参考になります。`
    );
  } else if (category === "医療") {
    patterns.push(
      `糖尿病専門医として、${keywords}は日々の外来で感じる課題です。最近はAIで解決できないか模索しています。`,
      `まさに現場のリアルですね。${keywords}についてはvibe codingでツール化できないか考えてました。`,
      `専門医としてこの問題意識に共感します。AIの力を借りて、少しでも現場の負担を減らしたいですね。`
    );
  } else {
    patterns.push(
      `医師の立場から見ても、${keywords}は興味深いです。医療×AIの文脈で考えると可能性が広がりますね。`,
      `これは面白い視点ですね。糖尿病診療でも${keywords}に近い課題があり、AIで解決を試みています。`,
      `共感します。テクノロジーで仕事も生活もアップデートできる時代、医療も例外じゃないですね。`
    );
  }

  // 120文字に収める
  return patterns.map((p) => (p.length > 120 ? p.slice(0, 117) + "..." : p));
}

/* ---------- デイリータスク ---------- */
const DAILY_TASKS = [
  { id: "post", label: "X投稿 1本", icon: "📝" },
  { id: "reply", label: "リプライ 5件", icon: "💬" },
  { id: "like", label: "いいね・RT 10件", icon: "❤️" },
  { id: "follow", label: "フォロー 3件", icon: "👥" },
];

function getStorageKey() {
  return `xgrowth-tasks-${new Date().toISOString().split("T")[0]}`;
}

/* ---------- メイン ---------- */
export default function XGrowthPage() {
  // タスク
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);

  // 投稿生成
  const [postTheme, setPostTheme] = useState("");
  const [postPillar, setPostPillar] = useState("ツール紹介");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  // リプライ
  const [targets, setTargets] = useState<TargetAccount[]>([]);
  const [todayTargets, setTodayTargets] = useState<TargetAccount[]>([]);
  const [replyTweet, setReplyTweet] = useState("");
  const [replyTarget, setReplyTarget] = useState<TargetAccount | null>(null);
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([]);

  // ターゲット追加
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: "",
    xHandle: "",
    url: "",
    category: "医師AI",
    memo: "",
  });

  // リプライ実績
  const [replyCount, setReplyCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // データ取得（初期化 & 更新ボタン共通）
  const loadData = useCallback(async () => {
    setRefreshing(true);

    // タスク
    const saved = localStorage.getItem(getStorageKey());
    if (saved) setTaskDone(JSON.parse(saved));

    // ストリーク
    const streakData = localStorage.getItem("xgrowth-streak");
    if (streakData) {
      const { count, lastDate } = JSON.parse(streakData);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const todayStr = new Date().toISOString().split("T")[0];
      if (lastDate === todayStr || lastDate === yesterdayStr) {
        setStreak(count);
      }
    }

    // ターゲット
    try {
      const res = await fetch("/api/x-growth/targets");
      const data = await res.json();
      setTargets(data);
      const sorted = [...data]
        .filter((t: TargetAccount) => t.name || t.xHandle)
        .sort((a: TargetAccount, b: TargetAccount) => {
          if (!a.lastReplied) return -1;
          if (!b.lastReplied) return 1;
          return a.lastReplied.localeCompare(b.lastReplied);
        });
      setTodayTargets(sorted.slice(0, 5));
    } catch {}

    // リプライ履歴
    try {
      const res = await fetch("/api/x-growth/reply-log");
      const logs = await res.json();
      const today = new Date().toISOString().split("T")[0];
      setReplyCount(
        logs.filter((l: { date: string }) => l.date === today).length
      );
    } catch {}

    setRefreshing(false);
  }, []);

  // 初期化
  useEffect(() => {
    loadData();
  }, [loadData]);

  // タスク保存
  const toggleTask = useCallback(
    (id: string) => {
      const next = { ...taskDone, [id]: !taskDone[id] };
      setTaskDone(next);
      localStorage.setItem(getStorageKey(), JSON.stringify(next));

      const allDone = DAILY_TASKS.every((t) => next[t.id]);
      if (allDone) {
        const todayStr = new Date().toISOString().split("T")[0];
        const streakData = localStorage.getItem("xgrowth-streak");
        let newStreak = 1;
        if (streakData) {
          const { count, lastDate } = JSON.parse(streakData);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toISOString().split("T")[0]) {
            newStreak = count + 1;
          } else if (lastDate === todayStr) {
            newStreak = count;
          }
        }
        localStorage.setItem(
          "xgrowth-streak",
          JSON.stringify({ count: newStreak, lastDate: todayStr })
        );
        setStreak(newStreak);
      }
    },
    [taskDone]
  );

  // 投稿生成（クライアントサイド）
  const generatePost = () => {
    if (!postTheme.trim()) return;
    const posts = generateXPosts(postTheme, postPillar);
    setGeneratedPosts(posts);
  };

  // リプライ生成（クライアントサイド）
  const handleGenerateReply = () => {
    if (!replyTweet.trim() || !replyTarget) return;
    const replies = generateReplies(replyTweet, replyTarget.category);
    setGeneratedReplies(replies);
  };

  // リプライ記録 + クリップボードにコピー
  const replyOnX = async (replyText: string) => {
    // 記録
    await fetch("/api/x-growth/reply-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetId: replyTarget?.id,
        targetName: replyTarget?.name,
        tweetContent: replyTweet,
        replyText,
      }),
    }).catch(() => {});
    setReplyCount((c) => c + 1);

    // クリップボードにコピー（ユーザーが自分でXのリプライ欄に貼る）
    await navigator.clipboard.writeText(replyText);
  };

  // ターゲット追加
  const addTarget = async () => {
    if (!newTarget.name && !newTarget.xHandle) return;
    try {
      const res = await fetch("/api/x-growth/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...newTarget }),
      });
      const added = await res.json();
      setTargets((prev) => [...prev, added]);
      setTodayTargets((prev) => {
        if (prev.length < 5) return [...prev, added];
        return prev;
      });
      setNewTarget({
        name: "",
        xHandle: "",
        url: "",
        category: "医師AI",
        memo: "",
      });
      setShowAddTarget(false);
    } catch {}
  };

  // ターゲット削除
  const deleteTarget = async (id: string) => {
    await fetch("/api/x-growth/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    }).catch(() => {});
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setTodayTargets((prev) => prev.filter((t) => t.id !== id));
    if (replyTarget?.id === id) setReplyTarget(null);
  };

  const completedCount = DAILY_TASKS.filter((t) => taskDone[t.id]).length;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">𝕏 Growth Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            医療 × AI × 実装 の第一人者へ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 px-3 py-2 rounded-lg text-sm transition"
          >
            {refreshing ? "↻ 更新中..." : "↻ 更新"}
          </button>
          <div className="text-right">
            <div className="text-3xl">{streak > 0 ? "🔥" : "⚪"}</div>
            <div className="text-xs text-gray-400">
              {streak > 0 ? `${streak}日連続` : "今日から始めよう"}
            </div>
          </div>
        </div>
      </div>

      {/* デイリータスク */}
      <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">✅ デイリータスク</h2>
          <span className="text-sm text-gray-400">
            {completedCount}/{DAILY_TASKS.length} 完了
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DAILY_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition text-left ${
                taskDone[task.id]
                  ? "bg-teal-900/30 border-teal-600 text-teal-300"
                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500"
              }`}
            >
              <span className="text-lg">{task.icon}</span>
              <span
                className={`text-sm ${taskDone[task.id] ? "line-through" : ""}`}
              >
                {task.label}
              </span>
              {taskDone[task.id] && (
                <span className="ml-auto text-teal-400">✓</span>
              )}
            </button>
          ))}
        </div>
        {completedCount === DAILY_TASKS.length && (
          <div className="mt-3 text-center text-teal-400 text-sm font-bold">
            🎉 今日のタスク全完了！ストリーク継続！
          </div>
        )}
      </section>

      {/* 投稿生成 */}
      <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">📝 X投稿を生成</h2>
        <div className="space-y-3">
          {/* 柱選択 */}
          <div className="flex gap-2 flex-wrap">
            {["ツール紹介", "AI Tips", "臨床エピソード", "ツール活用", "息抜き"].map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPostPillar(p)}
                  className={`text-xs px-3 py-1.5 rounded-full transition ${
                    postPillar === p
                      ? "bg-teal-600 text-white"
                      : "bg-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* ツール候補クイックボタン */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 self-center">ツール:</span>
            {Object.values(TOOL_DATABASE).map((tool) => (
              <button
                key={tool.name}
                onClick={() => {
                  setPostTheme(tool.name);
                  setGeneratedPosts(generateXPosts(tool.name, postPillar));
                }}
                className={`text-xs px-2 py-1 rounded transition ${
                  postTheme === tool.name
                    ? "bg-teal-700 text-teal-200"
                    : "bg-gray-700/50 text-gray-400 hover:text-white"
                }`}
              >
                {tool.name}
              </button>
            ))}
          </div>

          {/* テーマ入力 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={postTheme}
              onChange={(e) => setPostTheme(e.target.value)}
              placeholder="テーマを入力 or 上のツールボタンをクリック"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              onKeyDown={(e) => e.key === "Enter" && generatePost()}
            />
            <button
              onClick={generatePost}
              disabled={!postTheme.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              生成
            </button>
          </div>

          {/* 生成結果 */}
          {generatedPosts.length > 0 && (
            <div className="space-y-3">
              {generatedPosts.map((post, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">
                      案{i + 1}（{post.charCount}文字）
                      {post.charCount > 120 && (
                        <span className="text-red-400 ml-1">
                          ⚠ 120文字超
                        </span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      <CopyBtn text={post.text} />
                      <button
                        onClick={() => {
                          const tweetText = post.url
                            ? `${post.text}\n${post.url}`
                            : post.text;
                          window.open(
                            `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
                            "_blank"
                          );
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition"
                      >
                        Xに投稿
                      </button>
                    </div>
                  </div>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {post.text}
                  </pre>
                  {post.screenshot && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-600">
                      <div className="bg-gray-700 px-3 py-1.5 flex items-center justify-between">
                        <span className="text-xs text-gray-400">📱 アプリ画面プレビュー（投稿に添付推奨）</span>
                        <a
                          href={post.screenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-400 hover:text-teal-300"
                        >
                          開く ↗
                        </a>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.screenshot}
                        alt="アプリ画面"
                        className="w-full max-h-64 object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {post.url && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">🔗 添付URL:</span>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:text-teal-300 underline truncate"
                      >
                        {post.url}
                      </a>
                      <CopyBtn text={post.url} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* リプライ支援 */}
      <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">💬 リプライ支援</h2>
          <span className="text-sm text-gray-400">今日 {replyCount}/5 件</span>
        </div>

        {/* ステップ1: ターゲットを選ぶ → プロフィールを開く */}
        <div className="space-y-3 mb-4">
          <p className="text-xs text-teal-400 font-bold">
            ① ターゲットを選んでプロフィールを開く
          </p>
          {todayTargets.length === 0 ? (
            <p className="text-xs text-gray-500">
              ターゲットを追加してください ↓
            </p>
          ) : (
            <div className="space-y-2">
              {todayTargets.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                    replyTarget?.id === t.id
                      ? "bg-blue-900/30 border-blue-500"
                      : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => setReplyTarget(t)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.category === "医師AI"
                          ? "bg-teal-900 text-teal-300"
                          : t.category === "テック"
                          ? "bg-blue-900 text-blue-300"
                          : t.category === "医療"
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {t.category}
                    </span>
                    <span className="text-sm text-white">
                      {t.name || t.xHandle}
                    </span>
                    {t.xHandle && (
                      <span className="text-xs text-gray-500">{t.xHandle}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {t.lastReplied ? `最終: ${t.lastReplied}` : "未"}
                    </span>
                    {t.xHandle && (
                      <a
                        href={`https://x.com/${t.xHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition"
                      >
                        Xを開く ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ステップ2: ツイートを貼り付け */}
        {replyTarget && (
          <div className="space-y-3">
            <p className="text-xs text-teal-400 font-bold">
              ② {replyTarget.name || replyTarget.xHandle} のツイートを貼り付け
            </p>
            <textarea
              value={replyTweet}
              onChange={(e) => {
                setReplyTweet(e.target.value);
                setGeneratedReplies([]);
              }}
              placeholder="気になるツイートをコピーして貼り付け"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleGenerateReply}
              disabled={!replyTweet.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition w-full"
            >
              リプライ案を生成
            </button>

            {/* ステップ3: リプライを選んで送信 */}
            {generatedReplies.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-teal-400 font-bold">
                  ③ リプライを選んでXで返信
                </p>
                {generatedReplies.map((reply, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                  >
                    <p className="text-sm text-gray-200 mb-2">{reply}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {reply.length}文字
                      </span>
                      <div className="flex gap-2">
                        <CopyBtn text={reply} />
                        <button
                          onClick={() => replyOnX(reply)}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition font-bold"
                        >
                          コピー & 記録
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ターゲット管理 */}
      <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            📊 フォロー & ターゲット管理
          </h2>
          <div className="flex gap-2">
            <span className="text-xs text-gray-400 self-center">
              {targets.filter((t) => t.followed).length}/{targets.filter((t) => t.name || t.xHandle).length} フォロー済
            </span>
            <button
              onClick={() => setShowAddTarget(!showAddTarget)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              {showAddTarget ? "閉じる" : "+ 追加"}
            </button>
          </div>
        </div>

        {showAddTarget && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="名前"
                value={newTarget.name}
                onChange={(e) =>
                  setNewTarget((p) => ({ ...p, name: e.target.value }))
                }
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="@ハンドル（例: @example）"
                value={newTarget.xHandle}
                onChange={(e) =>
                  setNewTarget((p) => ({ ...p, xHandle: e.target.value }))
                }
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newTarget.category}
                onChange={(e) =>
                  setNewTarget((p) => ({ ...p, category: e.target.value }))
                }
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
              >
                <option>医師AI</option>
                <option>テック</option>
                <option>医療</option>
                <option>製薬</option>
                <option>その他</option>
              </select>
              <input
                type="text"
                placeholder="メモ（どんな人か）"
                value={newTarget.memo}
                onChange={(e) =>
                  setNewTarget((p) => ({ ...p, memo: e.target.value }))
                }
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={addTarget}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded text-sm font-bold transition"
            >
              追加
            </button>
          </div>
        )}

        {/* 未フォロー */}
        {targets.filter((t) => (t.name || t.xHandle) && !t.followed).length >
          0 && (
          <div className="mb-4">
            <p className="text-xs text-yellow-400 font-bold mb-2">
              ⚡ まだフォローしてない人（{targets.filter((t) => (t.name || t.xHandle) && !t.followed).length}件）
            </p>
            <div className="space-y-2">
              {targets
                .filter((t) => (t.name || t.xHandle) && !t.followed)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between bg-yellow-900/10 rounded-lg px-3 py-2 border border-yellow-900/30"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          t.category === "医師AI"
                            ? "bg-teal-900 text-teal-300"
                            : t.category === "テック"
                            ? "bg-blue-900 text-blue-300"
                            : t.category === "医療"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {t.category}
                      </span>
                      <span className="text-sm text-white shrink-0">
                        {t.name}
                      </span>
                      {t.memo && (
                        <span className="text-xs text-gray-500 truncate">
                          {t.memo}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.xHandle && (
                        <a
                          href={`https://x.com/intent/follow?screen_name=${t.xHandle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={async () => {
                            // フォロー済みに更新
                            await fetch("/api/x-growth/targets", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "update",
                                id: t.id,
                                data: { followed: true },
                              }),
                            }).catch(() => {});
                            setTargets((prev) =>
                              prev.map((x) =>
                                x.id === t.id ? { ...x, followed: true } : x
                              )
                            );
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition font-bold"
                        >
                          フォローする ↗
                        </a>
                      )}
                      {!t.xHandle && (
                        <span className="text-xs text-gray-600">
                          ハンドル未登録
                        </span>
                      )}
                      <button
                        onClick={() => deleteTarget(t.id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* フォロー済み */}
        {targets.filter((t) => (t.name || t.xHandle) && t.followed).length >
          0 && (
          <div>
            <p className="text-xs text-gray-400 font-bold mb-2">
              ✅ フォロー済み（{targets.filter((t) => (t.name || t.xHandle) && t.followed).length}件）
            </p>
            <div className="space-y-2">
              {targets
                .filter((t) => (t.name || t.xHandle) && t.followed)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between bg-gray-700/30 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          t.category === "医師AI"
                            ? "bg-teal-900 text-teal-300"
                            : t.category === "テック"
                            ? "bg-blue-900 text-blue-300"
                            : t.category === "医療"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {t.category}
                      </span>
                      <span className="text-sm text-white shrink-0">
                        {t.name}
                      </span>
                      {t.xHandle && (
                        <span className="text-xs text-gray-500">
                          {t.xHandle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">
                        {t.lastReplied ? `最終リプ: ${t.lastReplied}` : "未リプ"}
                      </span>
                      <button
                        onClick={() => deleteTarget(t.id)}
                        className="text-xs text-gray-600 hover:text-red-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
