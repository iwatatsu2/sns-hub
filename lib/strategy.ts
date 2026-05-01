// SNS戦略ロジック（2026年5月〜 医療×AI×実装 戦略）

export interface DailyTask {
  platform: "instagram" | "x" | "note" | "antaa";
  action: string;
  type: "auto" | "manual"; // auto = Claude Code生成可, manual = 本人対応
}

export interface WeekTheme {
  week: number; // 1-4
  theme: string;
  category: string; // topics.jsonのcategoryに対応
  medical: string;
  tech: string;
}

const WEEK_THEMES: WeekTheme[] = [
  { week: 1, theme: "vibe codingツール紹介", category: "ai", medical: "臨床ツールのデモ・使い方", tech: "Claude Codeでどう作ったか" },
  { week: 2, theme: "AI活用Tips", category: "ai", medical: "医師の業務をAIで効率化", tech: "Claude Code / AI使いこなし術" },
  { week: 3, theme: "臨床×AIエピソード", category: "diabetes", medical: "外来で感じた課題とAI解決", tech: "現場の課題→プロトタイプ化" },
  { week: 4, theme: "ツール活用レポート", category: "ai", medical: "作ったツールの臨床活用報告", tech: "InsuCalc/DM Compass等の実績" },
];

// 曜日別タスク定義（0=日, 1=月, ..., 6=土）
export const DAILY_TASKS: Record<number, DailyTask[]> = {
  0: [ // 日
    { platform: "x", action: "週の振り返り・来週告知", type: "auto" },
    { platform: "instagram", action: "ストーリーズ（週まとめ）", type: "manual" },
  ],
  1: [ // 月
    { platform: "x", action: "ツール紹介 or Tips投稿", type: "auto" },
  ],
  2: [ // 火
    { platform: "x", action: "臨床×AIエピソード投稿", type: "auto" },
  ],
  3: [ // 水
    { platform: "x", action: "スレッド投稿（深掘り）", type: "auto" },
    { platform: "instagram", action: "カルーセル（Xネタを図解化）", type: "auto" },
  ],
  4: [ // 木
    { platform: "x", action: "引用RT・リプライ戦略", type: "manual" },
    { platform: "instagram", action: "リール（デモ動画）", type: "auto" },
    { platform: "antaa", action: "スライド公開（随時）", type: "auto" },
  ],
  5: [ // 金
    { platform: "x", action: "週のまとめ or 問題提起", type: "auto" },
    { platform: "note", action: "note記事公開", type: "auto" },
  ],
  6: [ // 土
    { platform: "x", action: "ゆるツイート（息抜き枠）", type: "manual" },
  ],
};

export const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

// 基準日（2026-04-20が月曜＝第4週スタート）から4週ローテーション判定
const EPOCH = new Date("2026-04-20T00:00:00+09:00");

export function getCurrentWeek(date?: Date): WeekTheme {
  const now = date || new Date();
  const diffMs = now.getTime() - EPOCH.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  // 月曜始まりの週番号
  const dayOfWeek = now.getDay(); // 0=日
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = diffDays - mondayOffset;
  const weekNum = Math.floor(weekStart / 7);
  const rotationIdx = ((weekNum % 4) + 4) % 4; // 0-3
  return WEEK_THEMES[rotationIdx];
}

export function getTodayTasks(date?: Date): DailyTask[] {
  const now = date || new Date();
  return DAILY_TASKS[now.getDay()] || [];
}

export function getDayName(date?: Date): string {
  const now = date || new Date();
  return DAY_NAMES[now.getDay()];
}

/** 指定オフセット（0=今週, -1=先週, +1=来週）の月〜日のDate配列を返す */
export function getWeekDates(offset: number = 0, base?: Date): Date[] {
  const now = base || new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getWeekProgressFixed(posts: { scheduledDate: string; status: string }[], date?: Date) {
  const now = date || new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - mondayOffset);

  const days = ["月", "火", "水", "木", "金", "土", "日"];
  return days.map((day, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === now.toISOString().slice(0, 10);
    const hasPost = posts.some((p) => p.scheduledDate === dateStr && p.status !== "draft");
    return { day, done: hasPost, isToday, date: dateStr };
  });
}
