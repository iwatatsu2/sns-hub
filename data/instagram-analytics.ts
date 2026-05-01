// Instagram投稿分析データ（2026年5月1日 PDF解析レポートより）
// コンテンツ生成時に参照し、高エンゲージメントなテーマ・形式を優先する

export interface InstagramAnalytics {
  reportDate: string;
  followers: number;
  postsAnalyzed: number;
  totalLikes: number;
  avgLikesPerPost: number;
  avgCommentsPerPost: number;
  formatPerformance: FormatPerformance[];
  topPosts: TopPost[];
  themePerformance: ThemePerformance[];
  insights: string[];
  contentStrategy: ContentStrategyRule[];
}

export interface FormatPerformance {
  format: "carousel" | "reel";
  avgLikes: number;
  count: number;
}

export interface TopPost {
  rank: number;
  title: string;
  likes: number;
  format: "carousel" | "reel";
  topic: string;
}

export interface ThemePerformance {
  theme: string;
  avgLikes: number;
  tier: "S" | "A" | "B" | "C"; // S=40+, A=25-39, B=15-24, C=<15
}

export interface ContentStrategyRule {
  rule: string;
  detail: string;
}

export const INSTAGRAM_ANALYTICS: InstagramAnalytics = {
  reportDate: "2026-05-01",
  followers: 962,
  postsAnalyzed: 20,
  totalLikes: 599,
  avgLikesPerPost: 29.9,
  avgCommentsPerPost: 0.4,

  formatPerformance: [
    { format: "carousel", avgLikes: 37.0, count: 12 },
    { format: "reel", avgLikes: 19.4, count: 8 },
  ],

  topPosts: [
    { rank: 1, title: "インスリンの種類と使い分け", likes: 81, format: "carousel", topic: "インスリン・基礎知識" },
    { rank: 2, title: "HbA1cの正しい見方", likes: 66, format: "carousel", topic: "患者教育・基礎知識" },
    { rank: 3, title: "TIRとは", likes: 58, format: "carousel", topic: "CGM・最新指標" },
    { rank: 4, title: "シックデイの正しい対応", likes: 46, format: "carousel", topic: "インスリン・患者教育" },
    { rank: 5, title: "旅行中の血糖管理", likes: 42, format: "carousel", topic: "生活管理・CGM" },
  ],

  themePerformance: [
    { theme: "インスリン・基礎知識", avgLikes: 81.0, tier: "S" },
    { theme: "患者教育・基礎知識", avgLikes: 66.0, tier: "S" },
    { theme: "CGM・最新指標", avgLikes: 58.0, tier: "S" },
    { theme: "インスリン・患者教育", avgLikes: 46.0, tier: "S" },
    { theme: "生活管理・CGM", avgLikes: 42.0, tier: "S" },
    { theme: "季節・生活管理", avgLikes: 34.0, tier: "A" },
    { theme: "生活習慣・食事", avgLikes: 30.0, tier: "A" },
    { theme: "合併症・フットケア", avgLikes: 26.0, tier: "A" },
    { theme: "患者・家族向け", avgLikes: 26.0, tier: "A" },
    { theme: "薬・副作用注意", avgLikes: 21.0, tier: "B" },
    { theme: "患者教育", avgLikes: 19.5, tier: "B" },
    { theme: "薬・患者教育", avgLikes: 18.0, tier: "B" },
    { theme: "アプリ宣伝", avgLikes: 17.8, tier: "B" },
    { theme: "お知らせ", avgLikes: 13.0, tier: "C" },
    { theme: "最新情報・GLP-1", avgLikes: 10.0, tier: "C" },
  ],

  insights: [
    "カルーセル投稿（平均37.0いいね）がリール（平均19.4いいね）を大幅に上回る",
    "インスリン関連・基礎知識テーマが最高エンゲージメント（81いいね）",
    "HbA1c、TIR等の検査指標・最新指標テーマも高反応",
    "シックデイ・旅行中など具体的な生活管理テーマが人気",
    "アプリ直接宣伝はエンゲージメント低め（10-20台）",
    "GLP-1薬のFDA承認など最新薬剤情報もエンゲージメント低め",
  ],

  contentStrategy: [
    {
      rule: "基礎知識・生活管理を優先",
      detail: "インスリンの種類、HbA1c、TIR等の基礎的テーマをカルーセルで定期発信。季節ごとの注意点や患者のよくある質問も効果的",
    },
    {
      rule: "カルーセル優先",
      detail: "重要な医療情報はカルーセルで発信。リールは親しみやすさの演出やアプリ操作画面など用途を明確に分ける",
    },
    {
      rule: "アプリ紹介はストーリー仕立て",
      detail: "アプリの直接宣伝ではなく、患者の具体的な困りごとを提示→解決手段としてアプリを紹介するストーリー形式に",
    },
    {
      rule: "具体的な患者の声をテーマに",
      detail: "実際の診療でよく聞かれる質問や困りごとをテーマにすると共感を生みやすい",
    },
  ],
};

// コンテンツ生成時にテーマの推奨度を判定
export function getThemeRecommendation(themeKeywords: string): {
  tier: "S" | "A" | "B" | "C" | "unknown";
  avgLikes: number;
  suggestion: string;
} {
  const text = themeKeywords.toLowerCase();

  // キーワードマッチでテーマ判定
  if (/インスリン.*(基礎|種類|使い分け)/.test(text) || /基礎知識.*インスリン/.test(text)) {
    return { tier: "S", avgLikes: 81, suggestion: "最高エンゲージメントテーマ。カルーセルで詳しく解説" };
  }
  if (/hba1c|ヘモグロビン/.test(text)) {
    return { tier: "S", avgLikes: 66, suggestion: "高反応テーマ。患者教育の観点でカルーセル推奨" };
  }
  if (/tir|cgm|リブレ|デキスコム|血糖モニタ/.test(text)) {
    return { tier: "S", avgLikes: 58, suggestion: "最新指標テーマは関心が高い。カルーセルで図解推奨" };
  }
  if (/シックデイ|旅行|低血糖.*対処|生活管理/.test(text)) {
    return { tier: "S", avgLikes: 44, suggestion: "具体的な生活場面テーマは共感を得やすい。カルーセル推奨" };
  }
  if (/食事|カーボ|糖質|栄養/.test(text)) {
    return { tier: "A", avgLikes: 30, suggestion: "食事テーマは安定した関心。実践的な内容をカルーセルで" };
  }
  if (/合併症|腎症|網膜|神経障害|フットケア/.test(text)) {
    return { tier: "A", avgLikes: 26, suggestion: "合併症テーマは一定の関心あり。予防の観点で" };
  }
  if (/家族|サポート/.test(text)) {
    return { tier: "A", avgLikes: 26, suggestion: "家族向けテーマは共感を得やすい。カルーセル推奨" };
  }
  if (/アプリ|insucalc|dm compass/.test(text)) {
    return { tier: "B", avgLikes: 18, suggestion: "アプリ紹介は直接宣伝を避け、患者の困りごと→解決策の構成で" };
  }
  if (/glp-1|新薬|fda|承認/.test(text)) {
    return { tier: "C", avgLikes: 10, suggestion: "最新薬剤情報は反応低め。患者の実生活への影響と絡めて" };
  }

  return { tier: "unknown", avgLikes: 30, suggestion: "過去データなし。カルーセル形式で基礎知識寄りの切り口推奨" };
}

// Instagram投稿生成時の推奨フォーマットを返す
export function getRecommendedFormat(topic: string): "carousel" | "reel" {
  const text = topic.toLowerCase();
  // リールが適するケース: アプリデモ、日常紹介、親しみやすさ演出
  if (/アプリ.*デモ|操作画面|日常|vlog|ルーティン/.test(text)) {
    return "reel";
  }
  // それ以外は基本カルーセル推奨
  return "carousel";
}
