"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PlatformPreview from "@/components/PlatformPreview";
import StatusBadge from "@/components/StatusBadge";
import type { Post } from "@/lib/posts";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  const fetchPost = async () => {
    const res = await fetch("/api/posts");
    const posts: Post[] = await res.json();
    setPost(posts.find((p) => p.id === id) || null);
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) return;
    await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.push("/posts");
    router.refresh();
  };

  const handleStatusChange = async (status: string) => {
    await fetch("/api/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchPost();
  };

  if (!post) return <div className="text-gray-500">読み込み中...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          ← 戻る
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">{post.title}</h1>
          <p className="text-gray-400 text-sm">{post.theme}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={post.status} />
          <span className="text-xs text-gray-500">{post.scheduledDate}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["draft", "scheduled", "posted"] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`text-xs px-3 py-1 rounded transition ${
              post.status === s
                ? "bg-teal-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            {{ draft: "下書き", scheduled: "予定", posted: "投稿済み" }[s]}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="text-xs bg-red-900 text-red-300 hover:bg-red-800 px-3 py-1 rounded transition ml-auto"
        >
          削除
        </button>
      </div>

      <PlatformPreview platforms={post.platforms} postId={post.id} onUpdate={fetchPost} />
    </div>
  );
}
