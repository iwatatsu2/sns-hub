"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyPlatforms = {
  instagram: { caption: "", hashtags: [] as string[], posted: false },
  x: { text: "", posted: false },
  note: { title: "", body: "", posted: false },
  antaa: { title: "", description: "", tags: [] as string[], posted: false },
};

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled">("draft");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [igCaption, setIgCaption] = useState("");
  const [igHashtags, setIgHashtags] = useState("");
  const [xText, setXText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [antaaTitle, setAntaaTitle] = useState("");
  const [antaaDesc, setAntaaDesc] = useState("");
  const [antaaTags, setAntaaTags] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        theme,
        status,
        scheduledDate,
        platforms: {
          instagram: {
            caption: igCaption,
            hashtags: igHashtags.split(/[,\s]+/).filter(Boolean),
            posted: false,
          },
          x: { text: xText, posted: false },
          note: { title: noteTitle, body: noteBody, posted: false },
          antaa: {
            title: antaaTitle,
            description: antaaDesc,
            tags: antaaTags.split(/[,、\s]+/).filter(Boolean),
            posted: false,
          },
        },
        assets: [],
      }),
    });
    router.push("/posts");
    router.refresh();
  };

  const inputCls = "w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none";
  const labelCls = "block text-sm font-bold text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <h1 className="text-xl font-bold text-white mb-4">新規投稿作成</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>タイトル</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>テーマ</label>
          <input className={inputCls} value={theme} onChange={(e) => setTheme(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>投稿予定日</label>
          <input type="date" className={inputCls} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>ステータス</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as "draft" | "scheduled")}>
            <option value="draft">下書き</option>
            <option value="scheduled">予定</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-l-4 border-pink-500 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-white text-sm mb-2">📷 Instagram</h3>
          <label className={labelCls}>キャプション</label>
          <textarea className={inputCls} rows={4} value={igCaption} onChange={(e) => setIgCaption(e.target.value)} />
          <label className={`${labelCls} mt-2`}>ハッシュタグ（カンマ区切り・5個まで）</label>
          <input className={inputCls} value={igHashtags} onChange={(e) => setIgHashtags(e.target.value)} placeholder="糖尿病, DKA, 研修医" />
        </div>

        <div className="border-l-4 border-gray-400 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-white text-sm mb-2">𝕏 X (Twitter)</h3>
          <textarea className={inputCls} rows={3} value={xText} onChange={(e) => setXText(e.target.value)} maxLength={280} />
          <div className="text-xs text-gray-500 mt-1">{xText.length}/280</div>
        </div>

        <div className="border-l-4 border-green-500 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-white text-sm mb-2">📝 note</h3>
          <label className={labelCls}>タイトル</label>
          <input className={inputCls} value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
          <label className={`${labelCls} mt-2`}>本文</label>
          <textarea className={inputCls} rows={4} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} />
        </div>

        <div className="border-l-4 border-blue-500 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold text-white text-sm mb-2">🏥 antaa</h3>
          <label className={labelCls}>タイトル</label>
          <input className={inputCls} value={antaaTitle} onChange={(e) => setAntaaTitle(e.target.value)} />
          <label className={`${labelCls} mt-2`}>説明文</label>
          <textarea className={inputCls} rows={3} value={antaaDesc} onChange={(e) => setAntaaDesc(e.target.value)} />
          <label className={`${labelCls} mt-2`}>タグ（カンマ区切り）</label>
          <input className={inputCls} value={antaaTags} onChange={(e) => setAntaaTags(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2 rounded transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
