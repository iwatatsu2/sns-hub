"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { PlatformContent } from "@/lib/posts";
import type { FactCheckItem, FactCheckLevel, SlideData } from "@/lib/content-types";
import { POST_LINKS } from "@/lib/post-links";

function AutoPostBtn({
  platform,
  text,
  postId,
}: {
  platform: "x" | "instagram";
  text: string;
  postId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/posts/publish")
      .then((r) => r.json())
      .then((d) => setConfigured(d[platform] ?? false))
      .catch(() => setConfigured(false));
  }, [platform]);

  if (configured !== true || done) return null;

  const handlePost = async () => {
    if (!confirm(`${platform === "x" ? "X" : "Instagram"}に投稿しますか？`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postId || "pipeline", platform, text }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        if (data.url) window.open(data.url, "_blank");
      } else {
        alert(`投稿エラー: ${data.error}`);
      }
    } catch (e) {
      alert(`投稿エラー: ${e}`);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePost}
      disabled={loading}
      className="text-xs bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-2 py-1 rounded transition"
    >
      {loading ? "投稿中..." : done ? "✓ 投稿済み" : "自動投稿"}
    </button>
  );
}

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
      {copied ? "✓ コピー済み" : "コピー"}
    </button>
  );
}

function PostLink({ platform }: { platform: keyof typeof POST_LINKS }) {
  return (
    <a
      href={POST_LINKS[platform]}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs bg-teal-800 hover:bg-teal-700 text-teal-200 px-2 py-1 rounded transition"
    >
      投稿画面を開く →
    </a>
  );
}

const factCheckIcon: Record<FactCheckLevel, { icon: string; color: string; label: string }> = {
  verified: { icon: "⭕", color: "text-green-400", label: "確認済み" },
  partial: { icon: "🔺", color: "text-yellow-400", label: "要確認" },
  unverified: { icon: "❌", color: "text-red-400", label: "未確認" },
};

function FactCheckSection({ items }: { items: FactCheckItem[] }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="font-bold text-white text-sm mb-3">🔍 ファクトチェック</h4>
      <div className="space-y-2">
        {items.map((item, i) => {
          const fc = factCheckIcon[item.level];
          return (
            <div key={i} className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className={`text-lg ${fc.color}`}>{fc.icon}</span>
                <div className="flex-1">
                  <div className="text-gray-200 text-sm">{item.claim}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    出典: {item.source}
                    <span className={`ml-2 font-bold ${fc.color}`}>{fc.label}</span>
                  </div>
                  {item.note && (
                    <div className="text-yellow-500/80 text-xs mt-1">⚠ {item.note}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReferenceSection({ references }: { references: string[] }) {
  if (references.length === 0) return null;
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="font-bold text-white text-sm mb-2">📚 引用情報</h4>
      <ol className="list-decimal list-inside space-y-1">
        {references.map((ref, i) => (
          <li key={i} className="text-gray-300 text-sm">{ref}</li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- プラットフォーム別モックプレビュー ---------- */

function XPreview({ text }: { text: string }) {
  return (
    <div className="bg-black rounded-xl p-4 border border-gray-700 max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-sm">岩</div>
        <div>
          <div className="text-white text-sm font-bold">Dr. いわたつ</div>
          <div className="text-gray-500 text-xs">@kenkyu1019799</div>
        </div>
      </div>
      <pre className="text-white text-sm whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
      <div className="flex gap-8 mt-3 text-gray-500 text-xs">
        <span>💬</span><span>🔄</span><span>❤️</span><span>📤</span>
      </div>
    </div>
  );
}

function NotePreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-xl p-5 max-w-sm">
      <div className="text-gray-900 font-bold text-lg mb-2 leading-tight">{title}</div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">岩</div>
        <span className="text-gray-500 text-xs">Dr. いわたつ</span>
      </div>
      <pre className="text-gray-700 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-hidden">
        {body.slice(0, 300)}...
      </pre>
      <div className="mt-2 text-teal-600 text-xs font-bold">続きを読む →</div>
    </div>
  );
}

function InstagramPreview({ caption, hashtags }: { caption: string; hashtags: string[] }) {
  return (
    <div className="bg-black rounded-xl max-w-sm border border-gray-700">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-0.5">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">岩</div>
        </div>
        <span className="text-white text-sm font-bold">dr.iwatatsu</span>
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-square flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-teal-400 text-3xl mb-2">🎬</div>
          <div className="text-white text-sm font-bold">リール動画</div>
          <div className="text-gray-400 text-xs mt-1">19秒 / 1080×1920</div>
        </div>
      </div>
      <div className="px-3 py-2">
        <pre className="text-white text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-20 overflow-hidden">{caption.slice(0, 150)}...</pre>
        <div className="flex gap-1 mt-1 flex-wrap">
          {hashtags.map((h) => (
            <span key={h} className="text-blue-400 text-xs">#{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AntaaPreview({ title, description, tags }: { title: string; description: string; tags: string[] }) {
  return (
    <div className="bg-white rounded-xl p-4 max-w-sm">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg aspect-video flex items-center justify-center mb-3 px-4">
        <div className="text-center">
          <div className="text-teal-600 text-sm font-black leading-tight">{title.slice(0, 40)}</div>
          <div className="text-gray-400 text-xs mt-1">DM Compass シリーズ</div>
        </div>
      </div>
      <div className="text-gray-900 font-bold text-sm mb-1 leading-tight">{title}</div>
      <div className="text-gray-500 text-xs mb-2">{description}</div>
      <div className="flex gap-1 flex-wrap">
        {tags.map((t) => (
          <span key={t} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-[8px] font-bold">岩</div>
        <span className="text-gray-500 text-xs">Dr. いわたつ</span>
      </div>
    </div>
  );
}

/* ---------- リール動画プレビュー ---------- */

function ReelPreview({ html }: { html: string }) {
  const [showModal, setShowModal] = useState(false);

  if (!html) return <div className="text-gray-500 text-xs text-center">リールHTML未生成</div>;

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reel.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex justify-center mt-2 gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-3 rounded-xl transition text-sm flex flex-col items-center gap-2"
        >
          <span className="text-2xl">🎬</span>
          <span>リールプレビュー</span>
        </button>
        <button
          onClick={downloadHtml}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-3 rounded-xl transition text-sm flex flex-col items-center gap-2"
        >
          <span className="text-2xl">💾</span>
          <span>ダウンロード</span>
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center" onClick={() => setShowModal(false)}>
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white text-xl w-10 h-10 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 360, height: 640, border: "3px solid #333", borderRadius: 24, overflow: "hidden", position: "relative" }}>
              <iframe
                srcDoc={html}
                style={{ width: 1080, height: 1920, border: "none", transform: "scale(0.333)", transformOrigin: "top left" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- スライドカルーセル ---------- */

function SlideCarousel({ slides }: { slides: SlideData[] }) {
  const [current, setCurrent] = useState(0);

  if (!slides || slides.length === 0) return <div className="text-gray-500 text-xs">スライド未生成</div>;
  const slide = slides[current];
  if (!slide) return null;

  return (
    <div>
      <div className="bg-gradient-to-br from-[#0a1a1a] to-[#132e2e] rounded-xl aspect-video flex items-center p-8 relative overflow-hidden">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-400/20 text-teal-300">{slide.num}</span>
          <span className="text-xs text-teal-400 font-bold">DM Compass</span>
        </div>
        {/* 左側: コンテンツ */}
        <div className="flex-1 mt-4">
          <h3 className="text-xl font-black text-white mb-3">{slide.title}</h3>
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-300">{slide.content}</pre>
        </div>
        {/* 右側: Dr.いわたつイラスト（1枚目のみ） */}
        {current === 0 && (
          <div className="flex-shrink-0 w-[30%] h-full flex items-end justify-center">
            <img src="/dr-iwatatsu.png" alt="Dr.いわたつ" className="max-h-[85%] object-contain drop-shadow-lg" />
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] text-gray-600">
          <span>© Dr. いわたつ</span><span>DM Compass シリーズ</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="text-gray-400 hover:text-white disabled:opacity-30 text-sm px-2"
        >
          ← 前
        </button>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition ${i === current ? "bg-teal-400" : "bg-gray-600"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
          disabled={current === slides.length - 1}
          className="text-gray-400 hover:text-white disabled:opacity-30 text-sm px-2"
        >
          次 →
        </button>
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">{current + 1} / {slides.length} スライド</div>
    </div>
  );
}

/* ---------- AIダメ出し（コンテンツレビュー） ---------- */

function AiReview({ xText, noteTitle, noteBody, igCaption }: {
  xText: string; noteTitle: string; noteBody: string; igCaption: string;
}) {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runReview = async () => {
    if (typeof puter === "undefined") {
      setError("Puter.js未読込。ページをリロードしてください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const prompt = `あなたはSNSマーケティングの専門家です。以下の医療系SNSコンテンツを厳しくレビューしてください。

■ X投稿（最初の140文字がフック）:
${xText.slice(0, 500)}

■ note記事タイトル:
${noteTitle}

■ note記事冒頭:
${noteBody.slice(0, 500)}

■ Instagramキャプション:
${igCaption.slice(0, 300)}

以下の観点で採点（各10点満点）と改善提案を日本語で出してください:
1. フック力（最初の3秒/140文字の引きつけ力）
2. 構成力（PREP法/AIDA法則の準拠度）
3. ターゲット適合性（糖尿病患者・医療者への訴求）
4. CTA（行動喚起の明確さ）
5. 独自性（他の医療アカウントとの差別化）

最後に「総合評価」と「具体的な修正案を3つ」出してください。遠慮なくダメ出ししてください。`;

      const res = await puter.ai.chat(prompt);
      setReview(res.message.content);
    } catch (e) {
      setError("レビュー失敗: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  return (
    <div className="border-l-4 border-amber-500 bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white text-sm">🔍 AIダメ出し</span>
        {!review && (
          <button
            onClick={runReview}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            {loading ? "レビュー中..." : "ダメ出しを受ける"}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {review && (
        <div>
          <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto">
            {review}
          </pre>
          <button
            onClick={() => { setReview(null); }}
            className="mt-2 text-xs text-gray-500 hover:text-gray-300"
          >
            再レビュー
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- note本文表示（プレーンテキスト） ---------- */

function NoteBodyWithImages({ body }: { body: string }) {
  return <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>;
}

/* ---------- AI画像生成ボタン ---------- */

function AiImageGen({ prompt, label, aspectHint }: { prompt: string; label: string; aspectHint?: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (typeof puter === "undefined") {
      setError("Puter.js未読込。ページをリロードしてください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fullPrompt = `${prompt}。スタイル: 清潔感のある医療系インフォグラフィック、プロフェッショナル、ミニマルデザイン、日本の医療テーマ、ティールとダークブルーの配色、日本語テキストを使用。重要: 日本語テキストは絶対に単語の途中で改行しないこと。必ず意味のまとまり（文節）で改行し、読みやすく配置する${aspectHint ? `。${aspectHint}` : ""}`;
      const img = await puter.ai.txt2img(fullPrompt, { model: "dall-e-3" });
      setImgSrc(img.src);
    } catch (e) {
      setError("生成失敗: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  return (
    <div className="mt-3">
      {!imgSrc && (
        <button
          onClick={generate}
          disabled={loading}
          className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
        >
          {loading ? "AI画像生成中..." : `🎨 ${label}`}
        </button>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {imgSrc && (
        <div className="mt-2">
          <img src={imgSrc} alt={label} className="rounded-lg border border-gray-700 max-w-full" />
          <div className="flex gap-2 mt-1">
            <a href={imgSrc} download={`${label}.png`} className="text-xs text-teal-400 hover:text-teal-300">ダウンロード</a>
            <button onClick={() => { setImgSrc(null); }} className="text-xs text-gray-500 hover:text-gray-300">再生成</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- サムネイルプレビュー（レスポンシブ） ---------- */

function ThumbnailPreview({ topicId, title, subtitle }: { topicId: string; title?: string; subtitle?: string }) {
  return (
    <div className="border-l-4 border-yellow-500 bg-gray-800 rounded-lg p-4">
      <span className="font-bold text-white text-sm mb-3 block">🖼 noteサムネイル</span>
      <div className="rounded-xl overflow-hidden border border-gray-700"
        style={{ aspectRatio: "1280/670", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)" }}
      >
        <div className="h-full flex items-center relative p-6">
          <div className="absolute top-3 left-3 w-24 h-24 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="absolute bottom-3 right-[30%] w-20 h-20 rounded-full bg-violet-500/10 blur-2xl" />
          <div className="flex-1 pr-4 z-10">
            <div className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black px-2 py-0.5 rounded-full mb-2 tracking-wider inline-block">専門医が解説</div>
            <div className="text-white font-black text-sm md:text-base leading-tight mb-2">{title || topicId}</div>
            {subtitle && <div className="text-gray-400 text-[10px] leading-relaxed line-clamp-2">{subtitle}</div>}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <span className="text-[6px] font-black text-white">Dr</span>
              </div>
              <span className="text-gray-400 text-[9px] font-bold">Dr.いわたつ｜糖尿病専門医×アプリ開発者</span>
            </div>
          </div>
          <div className="flex-shrink-0 w-[35%] h-full flex items-end justify-center relative">
            <img src="/dr-iwatatsu.png" alt="Dr.いわたつ" className="max-h-full object-contain drop-shadow-lg" style={{ maxHeight: "90%" }} />
          </div>
        </div>
      </div>
      <AiImageGen
        prompt={`医療ブログ記事「${title || topicId}」のサムネイル画像。糖尿病専門医が解説するイメージ、信頼感のあるデザイン`}
        label="AIサムネイル生成"
        aspectHint="横長 16:9 比率"
      />
    </div>
  );
}

/* ---------- メインコンポーネント ---------- */

export default function GeneratedContent({
  platforms,
  reelScenes,
  reelHtml,
  slides,
  slideOutline,
  references,
  factChecks,
  topicId,
}: {
  platforms: PlatformContent;
  reelScenes: string[];
  reelHtml: string;
  slides: SlideData[];
  slideOutline: string[];
  references: string[];
  factChecks: FactCheckItem[];
  topicId?: string;
}) {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-white">生成結果</h3>

      {/* X */}
      <div className="border-l-4 border-gray-400 bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="font-bold text-white text-sm">𝕏 X</span>
          <div className="flex gap-1.5 flex-wrap">
            <CopyBtn text={platforms.x.text} />
            <AutoPostBtn platform="x" text={platforms.x.text} />
            <PostLink platform="x" />
          </div>
        </div>
        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{platforms.x.text}</pre>
      </div>

      {/* note */}
      <div className="border-l-4 border-green-500 bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="font-bold text-white text-sm">📝 note</span>
          <div className="flex gap-1.5 flex-wrap">
            <CopyBtn text={`${platforms.note.title}\n\n${platforms.note.body}`} />
            <PostLink platform="note" />
          </div>
        </div>
        <div className="text-teal-400 font-bold text-sm mb-1">{platforms.note.title}</div>
        <div className="max-h-[500px] overflow-y-auto">
          <NoteBodyWithImages body={platforms.note.body} />
        </div>
        <div className="text-xs text-gray-500 mt-1">{platforms.note.body.length}文字</div>
      </div>

      {/* サムネイル */}
      {topicId && <ThumbnailPreview topicId={topicId} title={platforms.note.title} subtitle={platforms.note.body.split("\n")[0]} />}

      {/* AIダメ出し */}
      <AiReview
        xText={platforms.x.text}
        noteTitle={platforms.note.title}
        noteBody={platforms.note.body}
        igCaption={platforms.instagram.caption}
      />

      {/* Instagram */}
      <div className="border-l-4 border-pink-500 bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="font-bold text-white text-sm">📷 Instagram</span>
          <div className="flex gap-1.5 flex-wrap">
            <CopyBtn text={platforms.instagram.caption + "\n\n" + platforms.instagram.hashtags.map((h) => `#${h}`).join(" ")} />
            <AutoPostBtn platform="instagram" text={platforms.instagram.caption + "\n\n" + platforms.instagram.hashtags.map((h) => `#${h}`).join(" ")} />
            <PostLink platform="instagram" />
          </div>
        </div>
        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{platforms.instagram.caption}</pre>
        <div className="flex gap-1 mt-2 flex-wrap">
          {platforms.instagram.hashtags.map((h) => (
            <span key={h} className="text-xs bg-pink-900 text-pink-300 px-2 py-0.5 rounded">#{h}</span>
          ))}
        </div>
        <AiImageGen
          prompt={`Instagramカルーセルの表紙スライド「${platforms.instagram.caption.split("\n")[0]}」。糖尿病患者向け医療教育インフォグラフィック`}
          label="AIカルーセル画像生成"
          aspectHint="正方形 1:1 比率、1080x1080px"
        />
      </div>

      {/* antaa */}
      <div className="border-l-4 border-blue-500 bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="font-bold text-white text-sm">🏥 antaa</span>
          <div className="flex gap-1.5 flex-wrap">
            <CopyBtn text={`${platforms.antaa.title}\n${platforms.antaa.description}`} />
            <PostLink platform="antaa" />
          </div>
        </div>
        <div className="text-blue-300 font-bold text-sm">{platforms.antaa.title}</div>
        <div className="text-gray-300 text-sm mt-1">{platforms.antaa.description}</div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {platforms.antaa.tags.map((t) => (
            <span key={t} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
      </div>

      {/* 詳細セクション（折りたたみ） */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-sm text-gray-400 hover:text-gray-200 py-2 transition"
      >
        {showDetails ? "▼ 詳細を閉じる" : "▶ リール・スライド・引用情報を表示"}
      </button>

      {showDetails && (
        <div className="space-y-4">
          <FactCheckSection items={factChecks} />
          <ReferenceSection references={references} />

          {/* リール */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="font-bold text-white text-sm mb-2">🎬 リール構成</div>
            {reelScenes.map((s, i) => {
              const text = typeof s === "string" ? s : (typeof s === "object" && s !== null ? Object.values(s as Record<string, unknown>).join(" | ") : String(s));
              return <div key={i} className="text-gray-400 text-xs bg-gray-700/50 rounded p-2 mb-1">{text}</div>;
            })}
            <ReelPreview html={reelHtml} />
          </div>

          {/* スライド */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="font-bold text-white text-sm mb-2">🏥 スライド構成</div>
            <SlideCarousel slides={slides} />
          </div>
        </div>
      )}
    </div>
  );
}
