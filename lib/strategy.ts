// SNS戦略ロジック（Manusリサーチに基づく）

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
  { week: 1, theme: "CGM・血糖モニタリング", category: "diabetes", medical: "CGMの種類・使い方・保険適用", tech: "DM Compassの開発背景・使い方" },
  { week: 2, theme: "インスリン療法", category: "diabetes", medical: "インスリンの種類と使い分け", tech: "医療アプリを使った血糖管理" },
  { week: 3, theme: "糖尿病と食事", category: "diabetes", medical: "血糖値を上げない食事の科学", tech: "食事管理アプリの比較・活用法" },
  { week: 4, theme: "医師×AI", category: "ai", medical: "生成AIが変える糖尿病診療", tech: "医師がAIツールを使って何をしているか" },
];

// 曜日別タスク定義（0=日, 1=月, ..., 6=土）
export const DAILY_TASKS: Record<number, DailyTask[]> = {
  0: [ // 日
    { platform: "instagram", action: "ストーリーズ（週まとめ）", type: "manual" },
    { platform: "x", action: "週の振り返り・来週告知", type: "auto" },
  ],
  1: [ // 月
    { platform: "x", action: "今週のテーマ告知（問題提起ツイート）", type: "auto" },
    { platform: "note", action: "テーマ決定・構成作成", type: "auto" },
  ],
  2: [ // 火
    { platform: "x", action: "専門知識のミニ解説（2-3ツイート）", type: "auto" },
    { platform: "note", action: "長文記事を執筆・公開", type: "auto" },
  ],
  3: [ // 水
    { platform: "instagram", action: "カルーセル投稿（8-10枚）", type: "auto" },
    { platform: "x", action: "noteへの誘導ツイート", type: "auto" },
  ],
  4: [ // 木
    { platform: "instagram", action: "リール投稿（30-60秒）", type: "auto" },
    { platform: "x", action: "テック系の裏話ツイート", type: "auto" },
    { platform: "antaa", action: "スライド公開（随時）", type: "auto" },
  ],
  5: [ // 金
    { platform: "instagram", action: "ストーリーズ（アンケート・Q&A）", type: "manual" },
    { platform: "x", action: "Xスレッド投稿（5-7ツイート）", type: "auto" },
  ],
  6: [ // 土
    { platform: "x", action: "週末ゆるツイート（医療現場の日常）", type: "manual" },
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
