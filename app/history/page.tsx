"use client";

import { useState, useEffect } from "react";
import GeneratedContent from "@/components/GeneratedContent";
import type { Topic } from "@/lib/topics";
import type { GeneratedResult } from "@/lib/content-types";

interface HistoryEntry {
  topic: Topic;
  platforms: GeneratedResult["platforms"];
  reelScenes: string[];
  slideOutline: string[];
  references: string[];
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<GeneratedResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetch("/api/topics/generated")
      .then((r) => r.json())
      .then(setEntries);
  }, []);

  const handleSelect = async (topicId: string) => {
    if (selectedId === topicId) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    setSelectedId(topicId);
    setLoadingDetail(true);
    const res = await fetch("/api/topics/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    });
    const data = await res.json();
    setDetail(data);
    setLoadingDetail(false);
  };

  const categoryLabel: Record<string, string> = {
    diabetes: "糖尿病",
    obesity: "肥満症",
    ai: "AI医療",
    endocrine: "内分泌",
    app: "アプリ",
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-2">生成済みコンテンツ</h1>
      <p className="text-gray-500 text-sm mb-6">{entries.length}件</p>

      {entries.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">生成済みコンテンツがありません</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.topic.id}>
            <button
              onClick={() => handleSelect(e.topic.id)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selectedId === e.topic.id
                  ? "bg-gray-700 border-teal-500"
                  : "bg-gray-800 border-gray-700 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs bg-teal-900 text-teal-300 px-2 py-0.5 rounded">
                  {categoryLabel[e.topic.category] || e.topic.category}
                </span>
                <span className="font-bold text-white text-sm flex-1">
                  {e.topic.title}
                </span>
                <span className="text-gray-500 text-xs">
                  {selectedId === e.topic.id ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                {e.topic.hook}
              </p>
            </button>

            {selectedId === e.topic.id && (
              <div className="mt-2 mb-4">
                {loadingDetail ? (
                  <div className="text-center py-8 text-gray-400">読み込み中...</div>
                ) : detail ? (
                  <GeneratedContent
                    platforms={detail.platforms}
                    reelScenes={detail.reelScenes}
                    slideOutline={detail.slideOutline}
                    reelHtml={detail.reelHtml}
                    slides={detail.slides}
                    references={detail.references}
                    factChecks={detail.factChecks}
                    topicId={e.topic.id}
                  />
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
