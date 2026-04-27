"use client";

import { useState, useEffect } from "react";
import type { PlatformContent, Platform } from "@/lib/posts";
import { POST_LINKS } from "@/lib/post-links";

const platformConfig: Record<Platform, { label: string; icon: string; color: string }> = {
  instagram: { label: "Instagram", icon: "📷", color: "border-pink-500" },
  x: { label: "X (Twitter)", icon: "𝕏", color: "border-gray-400" },
  note: { label: "note", icon: "📝", color: "border-green-500" },
  antaa: { label: "antaa", icon: "🏥", color: "border-blue-500" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition"
    >
      {copied ? "✓ コピー済み" : "コピー"}
    </button>
  );
}

function AutoPostButton({
  postId,
  platform,
  posted,
  onSuccess,
}: {
  postId: string;
  platform: "x" | "instagram";
  posted: boolean;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/posts/publish")
      .then((r) => r.json())
      .then((d) => setConfigured(d[platform] ?? false))
      .catch(() => setConfigured(false));
  }, [platform]);

  if (configured === false || posted) return null;
  if (configured === null) return null;

  const handlePost = async () => {
    if (!confirm(`${platform === "x" ? "X" : "Instagram"}に投稿しますか？`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, platform }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
        if (data.url) window.open(data.url, "_blank");
      } else {
        alert(`投稿エ���ー: ${data.error}`);
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
      {loading ? "投稿中..." : "自動投稿"}
    </button>
  );
}

function PlatformCard({
  platform,
  content,
  postId,
  onTogglePosted,
}: {
  platform: Platform;
  content: PlatformContent[Platform];
  postId: string;
  onTogglePosted: () => void;
}) {
  const cfg = platformConfig[platform];
  let displayText = "";

  if (platform === "instagram") {
    const ig = content as PlatformContent["instagram"];
    displayText = ig.caption + "\n\n" + ig.hashtags.map((h) => `#${h}`).join(" ");
  } else if (platform === "x") {
    displayText = (content as PlatformContent["x"]).text;
  } else if (platform === "note") {
    const n = content as PlatformContent["note"];
    displayText = `【${n.title}】\n\n${n.body}`;
    // noteのイラストプレースホルダーは表示コンポーネントで画像化
  } else {
    const a = content as PlatformContent["antaa"];
    displayText = `タイトル: ${a.title}\n説明: ${a.description}\nタグ: ${a.tags.join(", ")}`;
  }

  return (
    <div className={`border-l-4 ${cfg.color} bg-gray-800 rounded-lg p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icon}</span>
          <span className="font-bold text-white text-sm">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CopyButton text={displayText} />
          {(platform === "x" || platform === "instagram") && (
            <AutoPostButton
              postId={postId}
              platform={platform}
              posted={content.posted}
              onSuccess={onTogglePosted}
            />
          )}
          <a
            href={POST_LINKS[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-teal-800 hover:bg-teal-700 text-teal-200 px-2 py-1 rounded transition"
          >
            投稿 →
          </a>
          <button
            onClick={onTogglePosted}
            className={`text-xs px-2 py-1 rounded transition ${
              content.posted
                ? "bg-green-800 text-green-300"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            {content.posted ? "✓ 投稿済み" : "未投稿"}
          </button>
        </div>
      </div>
      {platform === "note" ? (
        <div className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
          {displayText.split("[🖼 Dr.いわたつイラスト挿入]").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="block my-4 text-center">
                  <img
                    src="/dr-iwatatsu.png"
                    alt="Dr.いわたつ"
                    className="inline-block w-24 h-24 rounded-lg"
                    style={{ filter: "brightness(1.25) saturate(1.5)" }}
                  />
                  <span className="block text-xs text-gray-500 mt-1">↑ noteにイラスト挿入</span>
                </span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
          {displayText}
        </pre>
      )}
    </div>
  );
}

export default function PlatformPreview({
  platforms,
  postId,
  onUpdate,
}: {
  platforms: PlatformContent;
  postId: string;
  onUpdate?: () => void;
}) {
  const toggle = async (platform: Platform) => {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "togglePosted", id: postId, platform }),
    });
    onUpdate?.();
  };

  return (
    <div className="grid gap-3">
      {(["instagram", "x", "note", "antaa"] as Platform[]).map((p) => (
        <PlatformCard
          key={p}
          platform={p}
          content={platforms[p]}
          postId={postId}
          onTogglePosted={() => toggle(p)}
        />
      ))}
    </div>
  );
}
