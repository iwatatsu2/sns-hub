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
      <div className="bg-gradient-to-br from-[#0a1a1a] to-[#132e2e] rounded-xl aspect-video flex flex-col justify-center p-8 relative overflow-hidden">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-400/20 text-teal-300">{slide.num}</span>
          <span className="text-xs text-teal-400 font-bold">DM Compass</span>
        </div>
        <h3 className="text-xl font-black text-white mb-3 mt-4">{slide.title}</h3>
        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-300">{slide.content}</pre>
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

/* ---------- note本文のSVGイラスト挿絵 ---------- */

type IllustTheme = "cell" | "molecule" | "research" | "clinical" | "practice" | "intro";

const themeConfig: Record<IllustTheme, { grad: [string, string]; accent: string }> = {
  cell:     { grad: ["#0d9488", "#06b6d4"], accent: "#67e8f9" },
  molecule: { grad: ["#7c3aed", "#a78bfa"], accent: "#c4b5fd" },
  research: { grad: ["#ea580c", "#f59e0b"], accent: "#fcd34d" },
  clinical: { grad: ["#2563eb", "#60a5fa"], accent: "#93c5fd" },
  practice: { grad: ["#059669", "#34d399"], accent: "#6ee7b7" },
  intro:    { grad: ["#db2777", "#f472b6"], accent: "#f9a8d4" },
};

function detectTheme(text: string): IllustTheme {
  const t = text.toLowerCase();
  if (/β細胞|β-cell|膵臓|膵島|インスリン分泌|細胞死|アポトーシス|増殖/.test(t)) return "cell";
  if (/メカニズム|転写因子|chrebp|rgs16|シグナル|遺伝子|アイソフォーム|dna|分子/.test(t)) return "molecule";
  if (/エビデンス|研究|マウス|実験|論文|デザイン|モデル|データ|解析/.test(t)) return "research";
  if (/臨床|hba1c|患者|治療|薬剤|投薬|外来|診療|glp|メトホルミン/.test(t)) return "clinical";
  if (/実践|ポイント|まとめ|明日から|意識|説明|介入/.test(t)) return "practice";
  return "intro";
}

function extractSectionTitle(text: string): string {
  const lines = text.trim().split("\n");
  for (const line of lines) {
    const cleaned = line.replace(/^[■#]{1,4}\s*/, "").trim();
    if (cleaned.length > 0 && cleaned.length <= 40) return cleaned;
  }
  return lines[0]?.trim().slice(0, 30) || "ポイント";
}

/* SVG illustrations per theme */

function CellIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop stopColor={c.accent} stopOpacity="0.4" /><stop offset="1" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.15" />
      {/* 大きな細胞 */}
      <circle cx="80" cy="60" r="35" fill={c.grad[0]} opacity="0.3" stroke={c.accent} strokeWidth="2" />
      <circle cx="80" cy="60" r="12" fill={c.grad[1]} opacity="0.6" />
      <circle cx="75" cy="55" r="4" fill={c.accent} opacity="0.8" />
      {/* 細胞分裂の矢印 */}
      <path d="M120 50 Q140 35 160 45" stroke={c.accent} strokeWidth="2" fill="none" strokeDasharray="4 3" />
      <path d="M120 70 Q140 85 160 75" stroke={c.accent} strokeWidth="2" fill="none" strokeDasharray="4 3" />
      <polygon points="158,42 165,46 158,50" fill={c.accent} />
      <polygon points="158,72 165,76 158,80" fill={c.accent} />
      {/* 分裂後の小さい細胞 */}
      <circle cx="185" cy="42" r="20" fill={c.grad[0]} opacity="0.25" stroke={c.accent} strokeWidth="1.5" />
      <circle cx="185" cy="42" r="7" fill={c.grad[1]} opacity="0.5" />
      <circle cx="185" cy="82" r="20" fill={c.grad[0]} opacity="0.25" stroke={c.accent} strokeWidth="1.5" />
      <circle cx="185" cy="82" r="7" fill={c.grad[1]} opacity="0.5" />
      {/* 装飾: 小さな粒子 */}
      {[240,260,280,300,320,340,360].map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i % 3) * 30} r={3 + (i % 2) * 2} fill={c.accent} opacity={0.15 + (i % 3) * 0.1} />
      ))}
      {/* インスリン分子のシンボル */}
      <g transform="translate(300, 50)">
        <rect x="-12" y="-15" width="24" height="30" rx="6" fill={c.grad[1]} opacity="0.3" stroke={c.accent} strokeWidth="1" />
        <text x="0" y="5" textAnchor="middle" fill={c.accent} fontSize="14" fontWeight="bold">In</text>
      </g>
      {/* glow */}
      <circle cx="80" cy="60" r="50" fill={`url(#glow-${id})`} />
    </svg>
  );
}

function MoleculeIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.12" />
      {/* DNA二重螺旋 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 30 + i * 18;
        const y1 = 60 + Math.sin(i * 0.8) * 25;
        const y2 = 60 - Math.sin(i * 0.8) * 25;
        return (
          <React.Fragment key={i}>
            <circle cx={x} cy={y1} r="4" fill={c.grad[0]} opacity="0.6" />
            <circle cx={x} cy={y2} r="4" fill={c.grad[1]} opacity="0.6" />
            {i % 2 === 0 && <line x1={x} y1={y1} x2={x} y2={y2} stroke={c.accent} strokeWidth="1" opacity="0.3" />}
          </React.Fragment>
        );
      })}
      {/* 分子スイッチ ON/OFF */}
      <g transform="translate(270, 35)">
        <rect x="0" y="0" width="60" height="28" rx="14" fill={c.grad[0]} opacity="0.4" stroke={c.accent} strokeWidth="1.5" />
        <circle cx="42" cy="14" r="10" fill={c.accent} opacity="0.9" />
        <text x="42" y="18" textAnchor="middle" fill={c.grad[0]} fontSize="8" fontWeight="bold">ON</text>
      </g>
      <g transform="translate(270, 72)">
        <rect x="0" y="0" width="60" height="28" rx="14" fill="#374151" opacity="0.6" stroke="#6b7280" strokeWidth="1" />
        <circle cx="18" cy="14" r="10" fill="#6b7280" opacity="0.7" />
        <text x="18" y="18" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="bold">OFF</text>
      </g>
      {/* 矢印 connecting */}
      <path d="M248 50 L265 48" stroke={c.accent} strokeWidth="1.5" opacity="0.5" />
      <path d="M248 75 L265 80" stroke="#6b7280" strokeWidth="1.5" opacity="0.3" />
      {/* 装飾分子 */}
      <g transform="translate(360, 60)">
        <circle r="8" fill={c.grad[1]} opacity="0.3" />
        <circle r="3" fill={c.accent} opacity="0.5" />
      </g>
    </svg>
  );
}

function ResearchIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.12" />
      {/* フラスコ */}
      <g transform="translate(50, 15)">
        <path d="M30 0 L30 30 L10 80 Q8 88 15 90 L45 90 Q52 88 50 80 L30 30" fill={c.grad[0]} opacity="0.25" stroke={c.accent} strokeWidth="1.5" />
        <rect x="24" y="0" width="12" height="8" rx="2" fill={c.accent} opacity="0.5" />
        {/* 液体 */}
        <path d="M18 65 Q30 58 42 65 L50 80 Q52 88 45 90 L15 90 Q8 88 10 80 Z" fill={c.grad[1]} opacity="0.4" />
        {/* 泡 */}
        <circle cx="25" cy="72" r="3" fill={c.accent} opacity="0.4" />
        <circle cx="35" cy="68" r="2" fill={c.accent} opacity="0.3" />
        <circle cx="30" cy="62" r="2.5" fill={c.accent} opacity="0.35" />
      </g>
      {/* 棒グラフ */}
      <g transform="translate(150, 20)">
        {[0, 1, 2, 3, 4].map((i) => {
          const h = [40, 65, 55, 75, 50][i];
          return (
            <rect key={i} x={i * 22} y={80 - h} width="16" height={h} rx="3" fill={c.grad[i % 2 === 0 ? 0 : 1]} opacity={0.3 + i * 0.08} stroke={c.accent} strokeWidth="0.5" />
          );
        })}
        {/* トレンドライン */}
        <path d="M8 55 L30 25 L52 35 L74 10 L96 20" stroke={c.accent} strokeWidth="2" fill="none" />
        <circle cx="74" cy="10" r="3" fill={c.accent} />
      </g>
      {/* 顕微鏡シルエット */}
      <g transform="translate(310, 20)">
        <rect x="15" y="70" width="40" height="6" rx="3" fill={c.grad[0]} opacity="0.3" />
        <rect x="30" y="10" width="10" height="60" rx="3" fill={c.grad[1]} opacity="0.3" />
        <circle cx="35" cy="10" r="12" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.5" />
        <line x1="35" y1="22" x2="35" y2="35" stroke={c.accent} strokeWidth="1.5" opacity="0.3" />
        <rect x="20" y="55" width="30" height="4" rx="2" fill={c.accent} opacity="0.3" />
      </g>
    </svg>
  );
}

function ClinicalIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.12" />
      {/* 聴診器 */}
      <g transform="translate(40, 15)">
        <path d="M25 0 Q25 50 45 65" fill="none" stroke={c.accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M35 0 Q35 45 50 60" fill="none" stroke={c.accent} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
        <circle cx="48" cy="70" r="15" fill={c.grad[0]} opacity="0.3" stroke={c.accent} strokeWidth="2" />
        <circle cx="48" cy="70" r="6" fill={c.accent} opacity="0.4" />
      </g>
      {/* 心電図ライン */}
      <g transform="translate(130, 40)">
        <path d="M0 30 L30 30 L40 10 L50 50 L60 5 L70 45 L80 25 L90 30 L200 30" stroke={c.accent} strokeWidth="2" fill="none" opacity="0.6" />
      </g>
      {/* カルテ/チャートアイコン */}
      <g transform="translate(320, 20)">
        <rect x="0" y="0" width="50" height="70" rx="5" fill={c.grad[0]} opacity="0.2" stroke={c.accent} strokeWidth="1.5" />
        <rect x="8" y="10" width="34" height="3" rx="1.5" fill={c.accent} opacity="0.4" />
        <rect x="8" y="20" width="28" height="3" rx="1.5" fill={c.accent} opacity="0.3" />
        <rect x="8" y="30" width="32" height="3" rx="1.5" fill={c.accent} opacity="0.25" />
        <rect x="8" y="40" width="20" height="3" rx="1.5" fill={c.accent} opacity="0.2" />
        {/* チェックマーク */}
        <path d="M15 55 L22 62 L38 48" stroke={c.accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function PracticeIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.12" />
      {/* ターゲット */}
      <g transform="translate(60, 60)">
        <circle r="35" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.2" />
        <circle r="25" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.3" />
        <circle r="15" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.4" />
        <circle r="5" fill={c.accent} opacity="0.7" />
      </g>
      {/* チェックリスト */}
      <g transform="translate(150, 18)">
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <rect x="0" y={i * 22} width="16" height="16" rx="3" fill={c.grad[0]} opacity="0.2" stroke={c.accent} strokeWidth="1" />
            <path d={`M3 ${i * 22 + 8} L7 ${i * 22 + 12} L13 ${i * 22 + 4}`} stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity={i < 3 ? 0.7 : 0.2} />
            <rect x="24" y={i * 22 + 4} width={60 - i * 8} height="8" rx="4" fill={c.accent} opacity={0.12 + i * 0.03} />
          </React.Fragment>
        ))}
      </g>
      {/* 上昇矢印 */}
      <g transform="translate(300, 20)">
        <path d="M20 80 L20 20 L10 35 M20 20 L30 35" stroke={c.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
        <circle cx="20" cy="15" r="8" fill={c.accent} opacity="0.3" />
        <path d="M16 15 L19 18 L25 12" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* 装飾星 */}
      {[260,340,370].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${40 + i * 25})`}>
          <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill={c.accent} opacity={0.2 + i * 0.1} />
        </g>
      ))}
    </svg>
  );
}

function IntroIllust({ c }: { c: { grad: [string, string]; accent: string } }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.grad[0]} /><stop offset="1" stopColor={c.grad[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="12" fill={`url(#bg-${id})`} opacity="0.12" />
      {/* 本 */}
      <g transform="translate(50, 20)">
        <path d="M30 0 L0 10 L0 80 L30 70 L60 80 L60 10 Z" fill={c.grad[0]} opacity="0.2" stroke={c.accent} strokeWidth="1.5" />
        <line x1="30" y1="0" x2="30" y2="70" stroke={c.accent} strokeWidth="1" opacity="0.4" />
        {/* ページの線 */}
        {[20, 32, 44, 56].map((y) => (
          <React.Fragment key={y}>
            <line x1="6" y1={y} x2="26" y2={y - 3} stroke={c.accent} strokeWidth="0.8" opacity="0.2" />
            <line x1="34" y1={y - 3} x2="54" y2={y} stroke={c.accent} strokeWidth="0.8" opacity="0.2" />
          </React.Fragment>
        ))}
      </g>
      {/* 虫眼鏡 */}
      <g transform="translate(170, 30)">
        <circle cx="25" cy="25" r="20" fill="none" stroke={c.accent} strokeWidth="2.5" opacity="0.5" />
        <line x1="40" y1="40" x2="55" y2="55" stroke={c.accent} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <circle cx="25" cy="25" r="12" fill={c.accent} opacity="0.08" />
        {/* ハイライト */}
        <path d="M15 18 Q18 12 25 12" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
      </g>
      {/* 浮遊する知識の光 */}
      {[{x:270,y:30,r:6},{x:300,y:55,r:8},{x:330,y:35,r:5},{x:355,y:70,r:7},{x:280,y:80,r:5},{x:320,y:90,r:4}].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={c.accent} opacity={0.1 + (i % 3) * 0.08} />
      ))}
      {/* 接続線 */}
      <path d="M270 30 L300 55 L330 35 L355 70" stroke={c.accent} strokeWidth="1" opacity="0.15" strokeDasharray="3 3" />
    </svg>
  );
}

const illustMap: Record<IllustTheme, React.FC<{ c: { grad: [string, string]; accent: string } }>> = {
  cell: CellIllust,
  molecule: MoleculeIllust,
  research: ResearchIllust,
  clinical: ClinicalIllust,
  practice: PracticeIllust,
  intro: IntroIllust,
};

function SectionIllustration({ text, colorIndex }: { text: string; colorIndex: number }) {
  const theme = detectTheme(text);
  const title = extractSectionTitle(text);
  const config = themeConfig[theme];
  const Illust = illustMap[theme];
  // Rotate through color configs for variety when same theme repeats
  const themes = Object.keys(themeConfig) as IllustTheme[];
  const altTheme = themes[(colorIndex + themes.indexOf(theme)) % themes.length];
  const finalConfig = colorIndex > 0 && theme === detectTheme("") ? themeConfig[altTheme] : config;

  return (
    <div className="my-5 rounded-xl overflow-hidden">
      <Illust c={finalConfig} />
      <div className="text-center -mt-1 pb-2" style={{ background: `linear-gradient(90deg, ${finalConfig.grad[0]}15, ${finalConfig.grad[1]}15)` }}>
        <span className="text-xs font-bold" style={{ color: finalConfig.accent }}>{title}</span>
      </div>
    </div>
  );
}

function NoteBodyWithImages({ body }: { body: string }) {
  // ■ で始まるセクション見出し or ## 見出しで分割
  const sections = body.split(/(?=^(?:■|#{2,4})\s)/m).filter(s => s.trim());

  if (sections.length <= 1) {
    const fallbackSections = body.split(/\n{2,}/).filter(s => s.trim());
    if (fallbackSections.length <= 2) {
      return <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>;
    }
    const groups: string[][] = [];
    for (let i = 0; i < fallbackSections.length; i += 3) {
      groups.push(fallbackSections.slice(i, i + 3));
    }
    return (
      <div>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{group.join("\n\n")}</pre>
            {gi < groups.length - 1 && (
              <SectionIllustration text={group.join("\n")} colorIndex={gi} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div>
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{section}</pre>
          {i < sections.length - 1 && (
            <SectionIllustration text={sections[i + 1]} colorIndex={i} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- サムネイルプレビュー（レスポンシブ） ---------- */

function ThumbnailPreview({ topicId }: { topicId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setScale(containerWidth / 1280);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  return (
    <div className="border-l-4 border-yellow-500 bg-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <span className="font-bold text-white text-sm">🖼 noteサムネイル</span>
        <a
          href={`/thumbnails/${topicId}.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded transition"
        >
          別タブで開く
        </a>
      </div>
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-gray-700 relative"
        style={{ paddingBottom: `${(670 / 1280) * 100}%` }}
      >
        <iframe
          src={`/thumbnails/${topicId}.html`}
          className="absolute top-0 left-0 border-none"
          style={{
            width: 1280,
            height: 670,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
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
  const [showDetails, setShowDetails] = useState(false);

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
      {topicId && <ThumbnailPreview topicId={topicId} />}

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
