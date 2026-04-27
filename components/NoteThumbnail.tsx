"use client";

import React from "react";

/* ---------- インパクトキーワード ---------- */
const IMPACT_KEYWORDS_MEDICAL = [
  "糖尿病", "血糖値", "HbA1c", "インスリン", "低血糖", "高血糖",
  "GLP-1", "SGLT2", "DPP-4", "CGM", "FGM", "DKA",
  "ケトアシドーシス", "合併症", "透析", "失明", "腎症", "網膜症",
  "専門医", "新薬", "ガイドライン", "AI",
];

const IMPACT_KEYWORDS_PUBLIC = [
  "糖尿病", "血糖値", "健康診断", "肥満", "ダイエット",
  "食事", "運動", "注射", "薬", "予防",
  "危険", "注意", "最新", "必須", "重要",
];

/* ---------- ポーズ選択（記事内容に合わせる） ---------- */
const POSE_MAP: Record<string, string> = {
  explain: "/dr-pose-explain.png",
  think: "/dr-pose-think.png",
  hello: "/dr-pose-hello.png",
  confident: "/dr-pose-confident.png",
  thumbsup: "/dr-pose-thumbsup.png",
  pc: "/dr-pose-pc.png",
  warning: "/dr-pose-warning.png",
  point: "/dr-pose-point.png",
  clipboard: "/dr-pose-clipboard.png",
  great: "/dr-pose-great.png",
  default: "/dr-iwatatsu.png",
};

function selectPoseFromTitle(title: string, category?: string): string {
  if (category === "ai") return POSE_MAP.pc;
  if (/危険|注意|見逃|誤診|リスク|警告|DKA|ケトアシドーシス/.test(title)) return POSE_MAP.warning;
  if (/？|疑問|本当に|いいの|どう|落とし穴|罠/.test(title)) return POSE_MAP.think;
  if (/最新|革命|ついに|発見|新薬|承認/.test(title)) return POSE_MAP.hello;
  if (/ガイドライン|マニュアル|データ|診断|基準/.test(title)) return POSE_MAP.clipboard;
  if (/おすすめ|良い|すごい|成功|改善|効果/.test(title)) return POSE_MAP.thumbsup;
  if (/解説|知って|学|基本|入門/.test(title)) return POSE_MAP.point;
  if (/自信|確実|プロ|専門/.test(title)) return POSE_MAP.confident;
  return POSE_MAP.explain;
}

/* ---------- タイトルセグメント化 ---------- */
interface TitleSegment {
  text: string;
  isImpact: boolean;
}

function segmentTitle(title: string, keywords: string[]): TitleSegment[] {
  const sortedKw = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedKw.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "g");

  const segments: TitleSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(title)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: title.slice(lastIndex, match.index), isImpact: false });
    }
    segments.push({ text: match[1], isImpact: true });
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < title.length) {
    segments.push({ text: title.slice(lastIndex), isImpact: false });
  }

  return segments.length > 0 ? segments : [{ text: title, isImpact: false }];
}

/* ---------- コンポーネント ---------- */
interface NoteThumbnailProps {
  title: string;
  variant: "medical" | "public";
  category?: string;
  subtitle?: string;
}

export default function NoteThumbnail({ title, variant, category, subtitle }: NoteThumbnailProps) {
  const isMedical = variant === "medical";

  const theme = isMedical
    ? {
        bg: "linear-gradient(135deg, #0a1628 0%, #0c2a3a 30%, #134e4a 70%, #0d4a4a 100%)",
        accentColor: "#2dd4bf",
        accentBg: "rgba(20,184,166,0.15)",
        accentGlow: "0 0 20px rgba(45,212,191,0.3)",
        badge: "⚕ 専門医が解説",
        badgeBg: "rgba(20,184,166,0.2)",
        badgeColor: "#5eead4",
        tagBg: "rgba(20,184,166,0.12)",
        tagColor: "#99f6e4",
        brandColor: "#14b8a6",
      }
    : {
        bg: "linear-gradient(135deg, #1a0a02 0%, #2e1506 30%, #c2410c 70%, #ea580c 100%)",
        accentColor: "#fb923c",
        accentBg: "rgba(251,146,60,0.15)",
        accentGlow: "0 0 20px rgba(251,146,60,0.3)",
        badge: "🩺 やさしく解説",
        badgeBg: "rgba(251,146,60,0.2)",
        badgeColor: "#fdba74",
        tagBg: "rgba(251,146,60,0.12)",
        tagColor: "#fed7aa",
        brandColor: "#ea580c",
      };

  const keywords = isMedical ? IMPACT_KEYWORDS_MEDICAL : IMPACT_KEYWORDS_PUBLIC;
  const segments = segmentTitle(title, keywords);
  const pose = selectPoseFromTitle(title, category);
  const tags = keywords.filter(kw => title.includes(kw)).slice(0, 3);

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-700 mb-3 w-full max-w-xl"
      style={{ aspectRatio: "1280/670" }}
    >
      <div
        className="w-full h-full relative flex"
        style={{ background: theme.bg }}
      >
        {/* 装飾グロー */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-30"
          style={{ background: theme.accentColor }} />
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10"
          style={{ background: theme.accentColor }} />

        {/* ===== 左側: テキスト (65%) ===== */}
        <div className="flex-1 flex flex-col justify-center px-5 py-4 z-10 min-w-0"
          style={{ maxWidth: "65%" }}>

          {/* バッジ */}
          <div className="mb-3">
            <span
              className="text-base font-bold px-3 py-1 rounded-full inline-block"
              style={{ background: theme.badgeBg, color: theme.badgeColor }}
            >
              {theme.badge}
            </span>
          </div>

          {/* タイトル（インパクトワード強調 + フォント大きめ） */}
          <div
            className="font-black leading-[1.3] mb-3"
            style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}
          >
            {segments.map((seg, i) =>
              seg.isImpact ? (
                <span
                  key={i}
                  style={{
                    color: theme.accentColor,
                    background: theme.accentBg,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    boxShadow: theme.accentGlow,
                    fontSize: "1.75rem",
                    lineHeight: 1.4,
                  }}
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i} className="text-white" style={{ fontSize: "1.25rem" }}>
                  {seg.text}
                </span>
              )
            )}
          </div>

          {/* サブタイトル（hook文） */}
          {subtitle && (
            <div className="text-sm text-gray-300 leading-snug mb-3 line-clamp-2"
              style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>
              {subtitle}
            </div>
          )}

          {/* タグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: theme.tagBg, color: theme.tagColor, border: `1px solid ${theme.tagColor}33` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Dr.いわたつ 著者表記 */}
          <div className="mt-auto flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
              style={{ background: theme.brandColor }}
            >
              D
            </div>
            <span className="text-sm font-bold text-white">
              Dr.いわたつ<span className="text-gray-300 font-normal">｜AIで医療アプリを作る糖尿病専門医</span>
            </span>
          </div>
        </div>

        {/* ===== 右側: Dr.いわたつイラスト (35%) ===== */}
        <div className="w-[35%] flex-shrink-0 flex items-end justify-center relative">
          <img
            src={pose}
            alt="Dr.いわたつ"
            className="object-contain"
            style={{
              maxHeight: "92%",
              maxWidth: "100%",
              marginBottom: "-1px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
