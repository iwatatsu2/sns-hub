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

/* ---------- ポーズ選択 ---------- */
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
  if (/危険|注意|見逃|誤診|リスク|警告|DKA/.test(title)) return POSE_MAP.warning;
  if (/？|疑問|本当に|いいの|どう/.test(title)) return POSE_MAP.think;
  if (/最新|革命|ついに|発見|新/.test(title)) return POSE_MAP.hello;
  if (/ガイドライン|マニュアル|データ|診断/.test(title)) return POSE_MAP.clipboard;
  if (/おすすめ|良い|すごい|革命/.test(title)) return POSE_MAP.thumbsup;
  return POSE_MAP.explain;
}

/* ---------- タイトル分割ロジック ---------- */
// 日本語の自然な区切りでタイトルを分割し、インパクトワードをマーク
interface TitleSegment {
  text: string;
  isImpact: boolean;
}

function segmentTitle(title: string, keywords: string[]): TitleSegment[] {
  // キーワードで分割してセグメント化
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

/* ---------- タイトル行分割（単語途中で改行しない） ---------- */
function splitTitleLines(title: string, maxCharsPerLine: number): string[] {
  // 自然な区切り文字で分割候補を作る
  const breakPoints = /([。、！？!?）】」』\s]|(?<=の|を|が|は|に|で|と|も|へ|や|か))/g;

  const lines: string[] = [];
  let remaining = title;

  while (remaining.length > maxCharsPerLine) {
    let bestBreak = maxCharsPerLine;
    // maxCharsPerLine以内で最後の区切り位置を探す
    const sub = remaining.slice(0, maxCharsPerLine + 2);
    let lastBreakPos = -1;
    let m: RegExpExecArray | null;
    const tempRegex = new RegExp(breakPoints.source, "g");
    while ((m = tempRegex.exec(sub)) !== null) {
      if (m.index > 0 && m.index <= maxCharsPerLine) {
        lastBreakPos = m.index + m[0].length;
      }
    }
    if (lastBreakPos > maxCharsPerLine * 0.4) {
      bestBreak = lastBreakPos;
    }
    lines.push(remaining.slice(0, bestBreak));
    remaining = remaining.slice(bestBreak);
  }
  if (remaining) lines.push(remaining);

  return lines;
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

  // カラーテーマ
  const theme = isMedical
    ? {
        bg: "linear-gradient(135deg, #0a1628 0%, #0c2a3a 30%, #134e4a 70%, #0d4a4a 100%)",
        accentColor: "#2dd4bf",       // teal-400
        accentBg: "rgba(20,184,166,0.15)",
        accentGlow: "0 0 20px rgba(45,212,191,0.3)",
        badge: "⚕ 専門医が解説",
        badgeBg: "rgba(20,184,166,0.2)",
        badgeColor: "#5eead4",
        tagBg: "rgba(20,184,166,0.12)",
        tagColor: "#99f6e4",
        brandColor: "#14b8a6",
        footerLabel: "DM Compass",
      }
    : {
        bg: "linear-gradient(135deg, #1a0a02 0%, #2e1506 30%, #c2410c 70%, #ea580c 100%)",
        accentColor: "#fb923c",       // orange-400
        accentBg: "rgba(251,146,60,0.15)",
        accentGlow: "0 0 20px rgba(251,146,60,0.3)",
        badge: "🩺 やさしく解説",
        badgeBg: "rgba(251,146,60,0.2)",
        badgeColor: "#fdba74",
        tagBg: "rgba(251,146,60,0.12)",
        tagColor: "#fed7aa",
        brandColor: "#ea580c",
        footerLabel: "Dr.いわたつ",
      };

  const keywords = isMedical ? IMPACT_KEYWORDS_MEDICAL : IMPACT_KEYWORDS_PUBLIC;
  const segments = segmentTitle(title, keywords);
  const pose = selectPoseFromTitle(title, category);

  // タイトルからタグを抽出（インパクトワードのうち最大3つ）
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
        {/* 装飾: 左上グロー */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-30"
          style={{ background: theme.accentColor }} />
        {/* 装飾: 右下グロー */}
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10"
          style={{ background: theme.accentColor }} />

        {/* ===== 左側: テキストエリア (65%) ===== */}
        <div className="flex-1 flex flex-col justify-center px-5 py-4 z-10 min-w-0"
          style={{ maxWidth: "65%" }}>

          {/* バッジ */}
          <div className="mb-2">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block"
              style={{ background: theme.badgeBg, color: theme.badgeColor }}
            >
              {theme.badge}
            </span>
          </div>

          {/* タイトル（インパクトワードを強調） */}
          <div
            className="font-black leading-[1.3] mb-2"
            style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}
          >
            {segments.map((seg, i) =>
              seg.isImpact ? (
                <span
                  key={i}
                  className="text-base"
                  style={{
                    color: theme.accentColor,
                    background: theme.accentBg,
                    padding: "1px 4px",
                    borderRadius: "3px",
                    boxShadow: theme.accentGlow,
                    fontSize: "1.15em",
                    lineHeight: 1.4,
                  }}
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i} className="text-white text-sm">
                  {seg.text}
                </span>
              )
            )}
          </div>

          {/* サブタイトル（hook文） */}
          {subtitle && (
            <div className="text-[9px] text-gray-300 leading-snug mb-2 line-clamp-2"
              style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>
              {subtitle}
            </div>
          )}

          {/* タグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: theme.tagBg, color: theme.tagColor, border: `1px solid ${theme.tagColor}33` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* フッター */}
          <div className="flex items-center gap-1.5 mt-auto">
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white"
              style={{ background: theme.brandColor }}
            >
              D
            </div>
            <span className="text-[8px] font-bold text-gray-400">{theme.footerLabel}</span>
            <span className="text-gray-600 text-[8px]">｜</span>
            <span className="text-[7px] text-gray-500">Dr.いわたつ｜糖尿病専門医・指導医</span>
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
              marginBottom: "-1px", // 底にぴったり付ける
            }}
          />
        </div>
      </div>
    </div>
  );
}
