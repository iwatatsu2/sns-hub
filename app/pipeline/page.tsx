"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopicCard from "@/components/TopicCard";
import GeneratedContent from "@/components/GeneratedContent";
import type { Topic } from "@/lib/topics";
import type { GeneratedResult } from "@/lib/content-types";

export default function PipelinePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockMessage, setStockMessage] = useState("");

  const fetchTopics = useCallback(async () => {
    const res = await fetch("/api/topics?filter=pending");
    const data: Topic[] = await res.json();
    setTopics(data);
    setPendingCount(data.length);
    setCurrentIdx(0);
    setGenerated(null);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const currentTopic = topics[currentIdx] || null;

  const handleApprove = async () => {
    if (!currentTopic) return;
    setLoading(true);

    try {
      // Update topic status
      await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStatus", id: currentTopic.id, status: "approved" }),
      });

      // Generate content via API
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: currentTopic.id }),
      });
      const result = await res.json();
      console.log("Generate result keys:", Object.keys(result));
      console.log("Platforms keys:", result.platforms ? Object.keys(result.platforms) : "NO PLATFORMS");
      setGenerated(result);
    } catch (err) {
      console.error("handleApprove error:", err);
      alert("エラー: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!currentTopic) return;
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", id: currentTopic.id, status: "rejected" }),
    });
    // Move to next
    if (currentIdx + 1 < topics.length) {
      setCurrentIdx((prev) => prev + 1);
      setPendingCount((prev) => prev - 1);
    } else {
      await fetchTopics();
    }
    setGenerated(null);
  };

  const handleSaveToPost = async () => {
    if (!currentTopic || !generated) return;
    setLoading(true);

    // Save to posts
    const today = new Date();
    const scheduledDate = new Date(today.getTime() + 2 * 86400000)
      .toISOString()
      .slice(0, 10);

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: currentTopic.title,
        theme: currentTopic.hook,
        status: "scheduled",
        scheduledDate,
        platforms: generated.platforms,
        assets: [],
      }),
    });

    // Mark topic as generated
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", id: currentTopic.id, status: "generated" }),
    });

    setLoading(false);
    router.push("/posts");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">投稿ストック パイプライン</h1>
          <p className="text-gray-500 text-sm">
            ストック残り: {pendingCount - currentIdx}件
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stockMessage && (
            <span className="text-xs text-teal-400">{stockMessage}</span>
          )}
          <button
            onClick={async () => {
              setStockLoading(true);
              setStockMessage("");
              try {
                const res = await fetch("/api/topics/stock", { method: "POST" });
                const data = await res.json();
                setStockMessage(data.message);
                if (data.added > 0) {
                  await fetchTopics();
                }
              } catch {
                setStockMessage("エラーが発生しました");
              }
              setStockLoading(false);
              setTimeout(() => setStockMessage(""), 5000);
            }}
            disabled={stockLoading}
            className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
          >
            {stockLoading ? "生成中..." : "＋ ストック追加"}
          </button>
        </div>
      </div>

      {!currentTopic && !generated && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">ストックがありません</p>
          <p className="text-gray-500 text-sm mt-2">
            上の「＋ ストック追加」ボタンで最新トピックを自動生成
          </p>
        </div>
      )}

      {currentTopic && !generated && (
        <TopicCard
          topic={currentTopic}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      )}

      {generated && (
        <div>
          <GeneratedContent
            platforms={generated.platforms}
            reelScenes={generated.reelScenes}
            slideOutline={generated.slideOutline}
            reelHtml={generated.reelHtml}
            slides={generated.slides}
            references={generated.references}
            factChecks={generated.factChecks}
          />
          <div className="flex gap-3 mt-6 max-w-2xl mx-auto">
            <button
              onClick={handleSaveToPost}
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? "保存中..." : "📅 投稿予定に登録"}
            </button>
            <button
              onClick={() => {
                setGenerated(null);
                handleReject();
              }}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-xl transition"
            >
              やっぱりボツ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
