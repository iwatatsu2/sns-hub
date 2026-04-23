import { getAllPosts } from "@/lib/posts";
import { getPendingTopics } from "@/lib/topics";
import { getCurrentWeek, getTodayTasks, getDayName, getWeekProgressFixed } from "@/lib/strategy";
import Calendar from "@/components/Calendar";
import TodayAction from "@/components/TodayAction";
import ActionTasks from "@/components/ActionTasks";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default function Home() {
  const posts = getAllPosts();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayName = getDayName(now);
  const weekTheme = getCurrentWeek(now);
  const dailyTasks = getTodayTasks(now);
  const weekProgress = getWeekProgressFixed(posts, now);

  // おすすめトピック: 今週のカテゴリに合うpendingトピックを優先、なければ全体から
  const pendingTopics = getPendingTopics();
  const categoryTopics = pendingTopics.filter((t) => t.category === weekTheme.category);
  const otherTopics = pendingTopics.filter((t) => t.category !== weekTheme.category);
  const recommendedTopics = [...categoryTopics, ...otherTopics]
    .slice(0, 3)
    .map((t) => ({ id: t.id, title: t.title, priority: t.priority, category: t.category }));

  const upcoming = posts
    .filter((p) => p.status !== "posted")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 今日のアクション（フルワイド） */}
      <TodayAction
        today={today}
        dayName={dayName}
        weekTheme={weekTheme}
        dailyTasks={dailyTasks}
        weekProgress={weekProgress}
        recommendedTopics={recommendedTopics}
      />

      {/* タスク + 投稿予定 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActionTasks />
        <div>
          <h3 className="text-lg font-bold text-white mb-3">次の投稿予定</h3>
          {upcoming.length === 0 && (
            <p className="text-gray-500 text-sm">予定なし</p>
          )}
          {upcoming.map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="block bg-gray-800 rounded-lg p-3 mb-2 hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-500">{p.scheduledDate}</span>
              </div>
              <div className="text-sm text-white font-semibold">{p.title}</div>
            </Link>
          ))}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-400 mb-2">統計</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "下書き", count: posts.filter((p) => p.status === "draft").length, color: "text-gray-300" },
                { label: "予定", count: posts.filter((p) => p.status === "scheduled").length, color: "text-blue-300" },
                { label: "投稿済", count: posts.filter((p) => p.status === "posted").length, color: "text-green-300" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-800 rounded-lg p-2">
                  <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* カレンダー（フルワイド） */}
      <Calendar posts={posts} />
    </div>
  );
}
