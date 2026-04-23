"use client";

import { useState } from "react";
import type { Topic } from "@/lib/topics";

const categoryLabels: Record<string, { label: string; color: string }> = {
  diabetes: { label: "糖尿病", color: "bg-blue-900 text-blue-300" },
  obesity: { label: "肥満症", color: "bg-purple-900 text-purple-300" },
  ai: { label: "AI医療", color: "bg-cyan-900 text-cyan-300" },
  endocrine: { label: "内分泌", color: "bg-amber-900 text-amber-300" },
  app: { label: "アプリ", color: "bg-teal-900 text-teal-300" },
};

function TopicTools({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [memo, setMemo] = useState("");

  const copyContext = () => {
    const text = `【トピック深掘り依頼】
タイトル: ${topic.title}
カテゴリ: ${topic.category}
フック: ${topic.hook}
ソース: ${topic.source || "なし"}
AI角度: ${topic.aiAngle || "なし"}

以下について教えてください：
- このソースは信頼できるか？
- データの正確性は？
- 臨床的に重要なポイントは？
- 最新の関連論文やガイドラインは？`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm py-2.5 rounded-xl transition border border-gray-600/50 hover:border-gray-500"
      >
        🔍 深掘り・ファクトチェック
      </button>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-600 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-bold text-gray-300">🔍 深掘りツール</span>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 text-xs">
          閉じる
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* コピーボタン */}
        <button
          onClick={copyContext}
          className="w-full bg-teal-800 hover:bg-teal-700 text-teal-100 text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          {copied ? "✓ コピーしました！" : "📋 トピック情報をコピー → Claude Codeで深掘り"}
        </button>
        <p className="text-xs text-gray-500">
          コピーした内容をClaude Codeに貼り付けて、無料で詳しく調べられます
        </p>

        {/* メモ欄 */}
        <div>
          <div className="text-xs font-bold text-gray-400 mb-1">📝 確認メモ</div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="ファクトチェック結果や修正メモを記録..."
            rows={3}
            className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-teal-500 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function TopicCard({
  topic,
  onApprove,
  onReject,
  loading,
  approveLabel,
}: {
  topic: Topic;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
  approveLabel?: string;
}) {
  const cat = categoryLabels[topic.category] || categoryLabels.diabetes;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${cat.color}`}>
          {cat.label}
        </span>
        <span className="text-xs text-gray-500">
          優先度: {"★".repeat(topic.priority)}{"☆".repeat(5 - topic.priority)}
        </span>
      </div>

      <h2 className="text-2xl font-black text-white mb-3">{topic.title}</h2>

      <div className="space-y-3 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs font-bold text-teal-400 mb-1">🎣 フック</div>
          <div className="text-gray-200 text-sm">{topic.hook}</div>
        </div>

        {topic.source && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs font-bold text-gray-400 mb-1">📰 ソース</div>
            <div className="text-gray-300 text-sm">{topic.source}</div>
          </div>
        )}

        {topic.aiAngle && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="text-xs font-bold text-cyan-400 mb-1">🤖 AI角度</div>
            <div className="text-gray-200 text-sm">{topic.aiAngle}</div>
          </div>
        )}

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs font-bold text-green-400 mb-1">📱 アプリ連動</div>
          <div className="text-gray-200 text-sm">{topic.appTieIn}</div>
        </div>
      </div>

      {/* 深掘りチャット */}
      <div className="mb-4">
        <TopicTools topic={topic} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onApprove}
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm sm:text-lg"
        >
          {loading ? "生成中..." : approveLabel || "✓ OK → 全生成"}
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="px-4 sm:px-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 font-bold py-3 rounded-xl transition text-sm sm:text-base"
        >
          ✗ ボツ
        </button>
      </div>
    </div>
  );
}
