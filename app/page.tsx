"use client";

import React, { useState, useEffect, useCallback } from "react";
import { POST_LINKS } from "@/lib/post-links";

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
  review: string;
  thumbnailSrc: string | null;
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

  // 初期データ取得
  useEffect(() => {
    const now = new Date();
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    setDayName(dayNames[now.getDay()]);
    setToday(now.toISOString().slice(0, 10));

    fetch("/api/topics?filter=pending")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTopics(d); })
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
    const saved = localStorage.getItem(`sns-hub-checks-${today}`);
    if (saved) setChecks(JSON.parse(saved));
  }, [today]);

  const saveChecks = useCallback((c: Record<string, boolean>) => {
    setChecks(c);
    if (today) localStorage.setItem(`sns-hub-checks-${today}`, JSON.stringify(c));
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

      // Puter.js チェック
      if (typeof puter === "undefined") {
        throw new Error("Puter.js未読込。ページをリロードしてください");
      }

      setProgress("AIがnote記事を執筆中...");

      // 2. AI並列生成（note + X + レビュー + サムネイル）
      const notePrompt = buildNotePrompt(topic);
      const xPrompt = buildXPrompt(topic);
      const reviewPrompt = buildReviewPrompt(topic);
      const imgPrompt = `医療ブログ記事の背景画像。テーマ: ${topic.title}。糖尿病・医療をイメージするアイコンや図形のみ。文字は一切入れない。スタイル: 清潔感のある医療系インフォグラフィック、ティールとダークブルーの配色。横長 16:9 比率`;

      const [noteRes, xRes, reviewRes, imgRes] = await Promise.allSettled([
        puter.ai.chat(notePrompt),
        puter.ai.chat(xPrompt),
        puter.ai.chat(reviewPrompt),
        puter.ai.txt2img(imgPrompt, { model: "dall-e-3" }),
      ]);

      setProgress("完了！");

      const noteBody = noteRes.status === "fulfilled" ? noteRes.value.message.content : baseData.platforms?.note?.body || "";
      const xText = xRes.status === "fulfilled" ? xRes.value.message.content : baseData.platforms?.x?.text || "";
      const review = reviewRes.status === "fulfilled" ? reviewRes.value.message.content : "レビュー生成に失敗しました";
      const thumbnailSrc = imgRes.status === "fulfilled" ? imgRes.value.src : null;

      setResult({
        noteTitle: `【専門医が解説】${topic.title}`,
        noteBody,
        xText,
        igCaption: baseData.platforms?.instagram?.caption || "",
        igHashtags: baseData.platforms?.instagram?.hashtags || [],
        review,
        thumbnailSrc,
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
    <div className="space-y-6 max-w-2xl mx-auto">
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
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-teal-500 outline-none"
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
          {/* note */}
          <div className="border-l-4 border-green-500 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <span className="font-bold text-white text-sm">📝 note</span>
              <div className="flex gap-1.5 flex-wrap">
                <CopyBtn text={`${result.noteTitle}\n\n${result.noteBody}`} />
                <PostLink platform="note" />
              </div>
            </div>
            <div className="text-teal-400 font-bold text-sm mb-1">{result.noteTitle}</div>
            <div className="max-h-[400px] overflow-y-auto">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.noteBody}</pre>
            </div>
            <div className="text-xs text-gray-500 mt-1">{result.noteBody.length}文字</div>
          </div>

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

          {/* サムネイル */}
          <div className="border-l-4 border-yellow-500 bg-gray-800 rounded-lg p-4">
            <span className="font-bold text-white text-sm mb-3 block">🖼 noteサムネイル</span>
            {/* CSSプレビュー */}
            <div className="rounded-xl overflow-hidden border border-gray-700 mb-3"
              style={{ aspectRatio: "1280/670", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)" }}>
              <div className="h-full flex items-center relative p-6">
                <div className="absolute top-3 left-3 w-24 h-24 rounded-full bg-teal-500/10 blur-2xl" />
                <div className="flex-1 pr-4 z-10">
                  <div className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black px-2 py-0.5 rounded-full mb-2 tracking-wider inline-block">専門医が解説</div>
                  <div className="text-white font-black text-sm md:text-base leading-tight mb-2" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>{result.noteTitle}</div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      <span className="text-[6px] font-black text-white">Dr</span>
                    </div>
                    <span className="text-gray-400 text-[9px] font-bold">Dr.いわたつ｜糖尿病専門医×アプリ開発者</span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-[35%] h-full flex items-end justify-center">
                  <img src="/dr-iwatatsu.png" alt="Dr.いわたつ" className="max-h-full object-contain drop-shadow-lg" style={{ maxHeight: "90%" }} />
                </div>
              </div>
            </div>
            {/* AI生成画像 */}
            {result.thumbnailSrc && (
              <div className="relative rounded-lg border border-gray-700 overflow-hidden">
                <img src={result.thumbnailSrc} alt="AI生成サムネイル" className="max-w-full block" />
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
                    <div className="text-white font-black text-lg md:text-xl leading-tight drop-shadow-lg" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>{result.noteTitle}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                        <span className="text-[7px] font-black text-white">Dr</span>
                      </div>
                      <span className="text-gray-300 text-xs font-bold">Dr.いわたつ｜糖尿病専門医</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <a href={result.thumbnailSrc} download="thumbnail.png" className="bg-black/60 text-white text-xs px-2 py-1 rounded">保存</a>
                </div>
              </div>
            )}
          </div>

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
        </div>
      )}
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

/* ---------- AIプロンプト ---------- */

function buildNotePrompt(topic: Topic): string {
  return `あなたは糖尿病・肥満症専門医「Dr.いわたつ」です。以下のタイトルでnote記事を書いてください。

タイトル: 【専門医が解説】${topic.title}
フック: ${topic.hook}
情報ソース: ${topic.source}
AI活用の切り口: ${topic.aiAngle}
アプリ誘導: ${topic.appTieIn}

━━━ 執筆ルール ━━━
1. マークダウン記法（#, *, **）は絶対に使わない
2. 見出しは「━━━━━━━━━━━━━━━」と「■ 見出し」で装飾する
3. 3000〜5000文字の読み応えのある記事にする
4. 具体的なデータ、数字、研究名、薬剤名を入れる（一般名使用）
5. 「〜について解説します」のような空虚な文は禁止。必ず具体的な内容を書く
6. 同じフレーズの繰り返しは禁止
7. 薬の否定は禁止、医師法遵守

━━━ 構成 ━━━
リード文（悩み代弁→メリット→権威性→結論チラ見せ）

━━━━━━━━━━━━━━━
■ この話題の背景
━━━━━━━━━━━━━━━
（なぜ今このテーマが重要か、具体的な背景・最新動向）

━━━━━━━━━━━━━━━
■ 知っておくべきポイント
━━━━━━━━━━━━━━━
（3〜5つの具体的なポイントを詳しく解説）

━━━━━━━━━━━━━━━
■ 日本人特有の注意点
━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━
■ 明日からの外来で使える実践ポイント
━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━
■ まとめ
━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━
著者: Dr.いわたつ
糖尿病専門医・指導医 / 内分泌専門医 / 肥満症専門医 / 医学博士
DM Compass 開発者
Instagram: @dr.iwatatsu / X: @kenkyu1019799
フォローで応援してもらえると嬉しいです！

重要: テンプレートの穴埋めではなく、専門医として具体的なデータとエビデンスを交えて書いてください。`;
}

function buildXPrompt(topic: Topic): string {
  return `あなたは糖尿病専門医「Dr.いわたつ」（@kenkyu1019799）です。
以下のテーマでX（旧Twitter）投稿文を1つ書いてください。

テーマ: ${topic.title}
フック: ${topic.hook}

ルール:
- PREP法（結論→理由→具体例→結論）
- 最初の140文字がフック（問題提起→権威性→ベネフィット）
- 280文字以内
- 最後に「👇詳しくはプロフィールのリンクから」で誘導
- ハッシュタグ2-3個
- 絵文字は控えめ（1-2個）
- マークダウン記法は使わない

投稿文のみを出力してください（説明不要）。`;
}

function buildReviewPrompt(topic: Topic): string {
  return `あなたはSNSマーケティングの専門家です。以下のSNSコンテンツ計画を厳しくレビューしてください。

テーマ: ${topic.title}
フック: ${topic.hook}
ターゲット: 糖尿病患者・医療従事者（特に研修医・若手医師）

以下の観点で採点（各10点満点）と改善提案を出してください:
1. フック力（最初の3秒/140文字の引きつけ力）
2. 構成力（PREP法/AIDA法則の準拠度）
3. ターゲット適合性（糖尿病患者・医療者への訴求）
4. CTA（行動喚起の明確さ）
5. 独自性（他の医療アカウントとの差別化）

最後に「総合評価」と「具体的な修正案を3つ」出してください。遠慮なくダメ出ししてください。`;
}
