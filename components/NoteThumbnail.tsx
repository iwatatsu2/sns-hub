"use client";

import React, { useCallback } from "react";

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

/* ---------- 文節改行マップ ---------- */
// タイトルの意味の通る位置で明示的に改行を指定
// キー: 元タイトル（部分一致）、値: 改行済みの行配列
const TITLE_BREAKS: [string, string[]][] = [
  ["糖尿病専門医が白米をやめない理由", ["糖尿病専門医が", "白米をやめない理由"]],
  ["CGMつけてコンビニ飯1週間生活した結果", ["CGMつけて", "コンビニ飯1週間", "生活した結果"]],
  ["食後に眠くなる人、それ血糖スパイクです", ["食後に眠くなる人、", "それ血糖スパイクです"]],
  ["医師がClaude Codeで医療アプリを作ってみた", ["医師がClaude Codeで", "医療アプリを", "作ってみた"]],
  ["ChatGPTに糖尿病の診断させてみた", ["ChatGPTに", "糖尿病の診断させてみた", "→専門医が採点"]],
  ["「カロリーゼロなら太らない」は嘘", ["「カロリーゼロなら", "太らない」は嘘"]],
  ["健康診断「異常なし」でも糖尿病になる理由", ["健康診断「異常なし」でも", "糖尿病になる理由"]],
  ["朝食を抜くと痩せる？太る？", ["朝食を抜くと", "痩せる？太る？", "専門医の結論"]],
  ["血糖値を制する者は仕事を制す", ["血糖値を制する者は", "仕事を制す"]],
  ["CGMつけてサウナに入ったら血糖値が激変した", ["CGMつけて", "サウナに入ったら", "血糖値が激変した"]],
  ["筋トレ vs 有酸素運動", ["筋トレ vs 有酸素運動、", "血糖値に効くのは", "どっち？"]],
  ["GLP-1ダイエットを専門医が勧めない", ["GLP-1ダイエットを", "専門医が勧めない", "3つの理由"]],
];

function getTitleLines(title: string): string[] | null {
  for (const [key, lines] of TITLE_BREAKS) {
    if (title.includes(key)) return lines;
  }
  return null;
}

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
  if (category === "ai" || category === "ai-medicine") return POSE_MAP.pc;
  if (/危険|注意|見逃|誤診|リスク|警告|DKA|ケトアシドーシス|勧めない/.test(title)) return POSE_MAP.warning;
  if (/？|疑問|本当に|いいの|どう|落とし穴|罠|嘘/.test(title)) return POSE_MAP.think;
  if (/最新|革命|ついに|発見|新薬|承認|激変/.test(title)) return POSE_MAP.hello;
  if (/ガイドライン|マニュアル|データ|診断|基準|採点/.test(title)) return POSE_MAP.clipboard;
  if (/おすすめ|良い|すごい|成功|改善|効果|制す/.test(title)) return POSE_MAP.thumbsup;
  if (/解説|知って|学|基本|入門|理由/.test(title)) return POSE_MAP.point;
  if (/自信|確実|プロ|専門|vs/.test(title)) return POSE_MAP.confident;
  return POSE_MAP.explain;
}

/* ---------- タイトルセグメント化（1行ずつ） ---------- */
interface TitleSegment {
  text: string;
  isImpact: boolean;
}

function segmentLine(line: string, keywords: string[]): TitleSegment[] {
  const sortedKw = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedKw.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "g");

  const segments: TitleSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), isImpact: false });
    }
    segments.push({ text: match[1], isImpact: true });
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), isImpact: false });
  }

  return segments.length > 0 ? segments : [{ text: line, isImpact: false }];
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
  const titleLines = getTitleLines(title);
  const pose = selectPoseFromTitle(title, category);
  const tags = keywords.filter(kw => title.includes(kw)).slice(0, 3);

  const downloadPptx = useCallback(async () => {
    const PptxGenJS = (await import("pptxgenjs")).default;
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";

    const slide = pptx.addSlide();
    const bgColor = isMedical ? "0a1628" : "1a0a02";
    slide.background = { color: bgColor };

    // アクセントグロー
    slide.addShape(pptx.ShapeType.ellipse, {
      x: -0.5, y: -0.5, w: 3, h: 3,
      fill: { color: isMedical ? "14b8a6" : "ea580c", transparency: 75 },
      shadow: { type: "outer", blur: 40, color: isMedical ? "14b8a6" : "ea580c", opacity: 0.3, offset: 0, angle: 0 },
    });

    // バッジ
    slide.addText(theme.badge, {
      x: 0.6, y: 0.4, w: 2.5, h: 0.45,
      fontSize: 14, fontFace: "Noto Sans JP", bold: true,
      color: isMedical ? "5eead4" : "fdba74",
      fill: { color: isMedical ? "14b8a6" : "ea580c", transparency: 80 },
      align: "left", valign: "middle",
    });

    // タイトル（文節改行対応）
    const lines = titleLines || [title];
    const titleRuns: { text: string; options: Record<string, unknown> }[] = [];
    lines.forEach((line, lineIdx) => {
      const segs = segmentLine(line, keywords);
      segs.forEach(seg => {
        titleRuns.push({
          text: seg.text,
          options: {
            fontSize: 32,
            fontFace: "Noto Sans JP",
            bold: true,
            color: seg.isImpact ? (isMedical ? "2dd4bf" : "fb923c") : "FFFFFF",
            breakType: lineIdx === 0 && titleRuns.length === 0 ? undefined : undefined,
          },
        });
      });
      // 行末に改行を追加（最後の行以外）
      if (lineIdx < lines.length - 1) {
        titleRuns.push({ text: "\n", options: { fontSize: 32, fontFace: "Noto Sans JP", breakType: "break" as const } });
      }
    });
    slide.addText(titleRuns, {
      x: 0.6, y: 1.1, w: 7.5, h: 3.5,
      valign: "top", paraSpaceAfter: 6,
      lineSpacingMultiple: 1.3,
    });

    // サブタイトル
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.6, y: 4.5, w: 7.5, h: 1.2,
        fontSize: 16, fontFace: "Noto Sans JP",
        color: "d1d5db", valign: "top",
      });
    }

    // タグ
    tags.forEach((tag, i) => {
      slide.addText(tag, {
        x: 0.6 + i * 1.8, y: 5.8, w: 1.6, h: 0.4,
        fontSize: 11, fontFace: "Noto Sans JP", bold: true,
        color: isMedical ? "99f6e4" : "fed7aa",
        fill: { color: isMedical ? "14b8a6" : "ea580c", transparency: 85 },
        align: "center", valign: "middle",
        shape: pptx.ShapeType.roundRect, rectRadius: 0.05,
      });
    });

    // 著者表記
    slide.addText([
      { text: "Dr.いわたつ", options: { fontSize: 13, bold: true, color: "FFFFFF", fontFace: "Noto Sans JP" } },
      { text: " ｜AIで医療アプリを作る糖尿病専門医", options: { fontSize: 12, color: "d1d5db", fontFace: "Noto Sans JP" } },
    ], { x: 0.6, y: 6.6, w: 7, h: 0.5, valign: "middle" });

    // Dr.いわたつイラスト
    try {
      const imgUrl = pose.startsWith("/") ? window.location.origin + pose : pose;
      const resp = await fetch(imgUrl);
      const blob = await resp.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      slide.addImage({
        data: dataUrl,
        x: 8.5, y: 1.0, w: 4.2, h: 6.0,
        sizing: { type: "contain", w: 4.2, h: 6.0 },
      });
    } catch { /* イラスト無しでも続行 */ }

    const fileName = `note-thumbnail-${title.slice(0, 20).replace(/[^\w\u3000-\u9fff]/g, "")}.pptx`;
    await pptx.writeFile({ fileName });
  }, [title, subtitle, titleLines, keywords, tags, pose, isMedical, theme]);

  // タイトル行の描画
  const lines = titleLines || [title];

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

          {/* タイトル（文節改行 + インパクトワード強調） */}
          <div
            className="font-black leading-[1.4] mb-3"
            style={{ wordBreak: "keep-all", lineBreak: "strict" }}
          >
            {lines.map((line, lineIdx) => {
              const segs = segmentLine(line, keywords);
              return (
                <React.Fragment key={lineIdx}>
                  {lineIdx > 0 && <br />}
                  {segs.map((seg, i) =>
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
                </React.Fragment>
              );
            })}
          </div>

          {/* サブタイトル（hook文） */}
          {subtitle && (
            <div className="text-sm text-gray-300 leading-snug mb-3 line-clamp-2"
              style={{ wordBreak: "keep-all", lineBreak: "strict" }}>
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
          <div className="mt-auto flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
              style={{ background: theme.brandColor }}
            >
              D
            </div>
            <span className="text-[11px] font-bold text-white">
              Dr.いわたつ
            </span>
            <span className="text-[11px] text-gray-300">
              ｜AIで医療アプリを作る糖尿病専門医
            </span>
          </div>
        </div>

        {/* PPTXダウンロードボタン */}
        <button
          onClick={downloadPptx}
          className="absolute top-2 right-2 z-20 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition backdrop-blur-sm"
        >
          PPTX
        </button>

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
              filter: "drop-shadow(0 0 3px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 1px #fff)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
