"use client";

const styles: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-700", text: "text-gray-300", label: "下書き" },
  scheduled: { bg: "bg-blue-900", text: "text-blue-300", label: "予定" },
  posted: { bg: "bg-green-900", text: "text-green-300", label: "投稿済み" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = styles[status] || styles.draft;
  return (
    <span className={`${s.bg} ${s.text} text-xs font-bold px-2 py-1 rounded`}>
      {s.label}
    </span>
  );
}
