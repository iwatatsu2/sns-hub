"use client";

import React, { useState, useEffect } from "react";
import { getOodaData, type OodaEntry, type BrandProfile } from "@/lib/ooda";

/* ---------- 共有OODAデータを取得 ---------- */
const oodaData = getOodaData();
const BRAND_PROFILE = oodaData.brandProfile;
const OODA_LATEST = oodaData.latest;
const OODA_HISTORY: OodaEntry[] = [OODA_LATEST];

/* ---------- フェーズカラー ---------- */
const PHASE_CONFIG = {
  observe: { label: "Observe（観察）", icon: "👁", color: "teal", desc: "市場・競合・トレンドの最新情報を収集" },
  orient: { label: "Orient（状況判断）", icon: "🧭", color: "blue", desc: "観察結果を分析し、自分のポジションを明確化" },
  decide: { label: "Decide（意思決定）", icon: "⚡", color: "amber", desc: "具体的なアクションプランを決定" },
  act: { label: "Act（実行）", icon: "🚀", color: "green", desc: "決定した施策を即座に実行" },
} as const;

type Phase = keyof typeof PHASE_CONFIG;

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  teal: { border: "border-teal-500", bg: "bg-teal-500/10", text: "text-teal-400", badge: "bg-teal-500/20 text-teal-300" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300" },
  amber: { border: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
  green: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-400", badge: "bg-green-500/20 text-green-300" },
};

/* ---------- コンポーネント ---------- */
export default function OodaPage() {
  const [activePhase, setActivePhase] = useState<Phase | "all">("all");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const data = OODA_LATEST;

  // localStorage で完了チェック管理
  useEffect(() => {
    const saved = localStorage.getItem("ooda-checks");
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleCheck = (key: string) => {
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
    localStorage.setItem("ooda-checks", JSON.stringify(next));
  };

  const phases: Phase[] = ["observe", "orient", "decide", "act"];

  const renderPhase = (phase: Phase) => {
    const config = PHASE_CONFIG[phase];
    const colors = colorMap[config.color];
    const items = data[phase];

    return (
      <div key={phase} className={`border-l-4 ${colors.border} ${colors.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className={`font-black text-lg ${colors.text}`}>{config.label}</h3>
            <p className="text-gray-500 text-xs">{config.desc}</p>
          </div>
        </div>
        <ul className="space-y-2">
          {items.map((item, i) => {
            const key = `${phase}-${i}`;
            const checked = checkedItems[key] || false;
            // 【】で囲まれた部分をラベルとして抽出
            const labelMatch = item.match(/^【(.+?)】/);
            const label = labelMatch ? labelMatch[1] : null;
            const content = label ? item.replace(/^【.+?】\s*/, "") : item;

            return (
              <li key={key} className="flex items-start gap-2">
                {(phase === "decide" || phase === "act") && (
                  <button
                    onClick={() => toggleCheck(key)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition ${
                      checked
                        ? `${colors.border} ${colors.bg} ${colors.text}`
                        : "border-gray-600 text-transparent hover:border-gray-400"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </button>
                )}
                <div className={`text-sm leading-relaxed ${checked ? "text-gray-500 line-through" : "text-gray-300"}`}>
                  {label && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-1.5 ${colors.badge}`}>
                      {label}
                    </span>
                  )}
                  {content}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Act完了率
  const actTotal = data.act.length + data.decide.length;
  const actDone = [...data.act, ...data.decide].filter((_, i) => {
    const phase = i < data.decide.length ? "decide" : "act";
    const idx = i < data.decide.length ? i : i - data.decide.length;
    return checkedItems[`${phase}-${idx}`];
  }).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-white font-black text-xl flex items-center gap-2">
              🔄 OODAブランディング
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              最新トレンドに基づくブランディング戦略アドバイス
            </p>
          </div>
          <div className="text-right">
            <div className="text-teal-400 text-sm font-bold">最終更新</div>
            <div className="text-white font-bold">{data.date}</div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Decide & Act 進捗</span>
            <span>{actDone}/{actTotal} 完了</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-teal-500 rounded-full h-2 transition-all"
              style={{ width: `${actTotal > 0 ? (actDone / actTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ブランドプロフィール */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h2 className="text-white font-bold text-sm mb-3">現在のブランドポジション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-gray-500 text-xs mb-1">タグライン</div>
            <div className="text-teal-400 font-bold text-sm">{BRAND_PROFILE.tagline}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">ターゲット</div>
            <div className="text-white text-sm">{BRAND_PROFILE.target.primary}</div>
            <div className="text-gray-400 text-xs">{BRAND_PROFILE.target.secondary}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">プラットフォーム</div>
            <div className="flex flex-wrap gap-1">
              {BRAND_PROFILE.platforms.map(p => (
                <span key={p} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">自作アプリ</div>
            <div className="flex flex-wrap gap-1">
              {BRAND_PROFILE.apps.map(a => (
                <span key={a} className="text-xs bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded">{a}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-gray-500 text-xs mb-1">強み</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {BRAND_PROFILE.strengths.map((s, i) => (
              <div key={i} className="text-xs text-gray-300 flex items-start gap-1">
                <span className="text-teal-400 mt-0.5">●</span>{s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フェーズフィルター */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActivePhase("all")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
            activePhase === "all"
              ? "bg-gray-600 border-gray-500 text-white"
              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
          }`}
        >
          全フェーズ
        </button>
        {phases.map(p => {
          const config = PHASE_CONFIG[p];
          const colors = colorMap[config.color];
          return (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                activePhase === p
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {config.icon} {config.label.split("（")[0]}
            </button>
          );
        })}
      </div>

      {/* OODAフェーズ表示 */}
      {activePhase === "all"
        ? phases.map(p => renderPhase(p))
        : renderPhase(activePhase)
      }

      {/* OODAループ説明 */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h3 className="text-gray-400 font-bold text-xs mb-2">OODAループとは？</h3>
        <p className="text-gray-500 text-xs leading-relaxed">
          OODAループ（Observe→Orient→Decide→Act）は、変化の激しい環境で迅速に意思決定するためのフレームワークです。
          PDCAと異なり、計画を待たず「観察→判断→即行動」のサイクルを高速で回します。
          SNSブランディングでは、トレンドの変化に素早く対応し、常に最適なポジションを取り続けることが重要です。
          このページのアドバイスは定期的に更新され、最新の状況に基づいた戦略提案を提供します。
        </p>
      </div>
    </div>
  );
}
