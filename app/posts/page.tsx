import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">投稿一覧</h1>
        <Link
          href="/posts/new"
          className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold px-3 py-1.5 rounded transition"
        >
          + 新規作成
        </Link>
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500">まだ投稿がありません。</p>
      )}
      <div className="grid gap-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/posts/${p.id}`}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-500">{p.scheduledDate}</span>
              </div>
              <div className="text-white font-semibold">{p.title}</div>
              <div className="text-gray-400 text-sm">{p.theme}</div>
            </div>
            <div className="flex gap-1">
              {(["instagram", "x", "note", "antaa"] as const).map((pl) => (
                <span
                  key={pl}
                  className={`w-2 h-2 rounded-full ${
                    p.platforms[pl].posted ? "bg-green-400" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
