"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Post } from "@/lib/posts";

export default function Calendar({ posts }: { posts: Post[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const postsByDate: Record<string, Post[]> = {};
  posts.forEach((p) => {
    const d = p.scheduledDate;
    if (!postsByDate[d]) postsByDate[d] = [];
    postsByDate[d].push(p);
  });

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="text-gray-400 hover:text-white text-xl px-3">
          ←
        </button>
        <h2 className="text-xl font-bold text-white">
          {year}年{month + 1}月
        </h2>
        <button onClick={next} className="text-gray-400 hover:text-white text-xl px-3">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayPosts = postsByDate[dateStr] || [];
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={`min-h-[80px] rounded-lg p-1 ${
                isToday ? "bg-gray-700 ring-1 ring-teal-500" : "bg-gray-800/50"
              }`}
            >
              <div className={`text-xs mb-1 ${isToday ? "text-teal-400 font-bold" : "text-gray-500"}`}>
                {day}
              </div>
              {dayPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="block text-xs bg-gray-700 hover:bg-gray-600 rounded px-1 py-0.5 mb-0.5 truncate text-gray-200 transition"
                >
                  <StatusBadge status={p.status} /> {p.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
