"use client";

import { useState } from "react";
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

function PlatformCard({
  platform,
  content,
  onTogglePosted,
}: {
  platform: Platform;
  content: PlatformContent[Platform];
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
  } else {
    const a = content as PlatformContent["antaa"];
    displayText = `タイトル: ${a.title}\n説明: ${a.description}\nタグ: ${a.tags.join(", ")}`;
  }

  return (
    <div className={`border-l-4 ${cfg.color} bg-gray-800 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icon}</span>
          <span className="font-bold text-white text-sm">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={displayText} />
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
      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
        {displayText}
      </pre>
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
          onTogglePosted={() => toggle(p)}
        />
      ))}
    </div>
  );
}
