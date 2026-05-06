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
    "既存フォロワー内ではカルーセル(37.0)>リール(19.4)だが、新規リーチはリールが圧倒的",
    "インスリン・CGM・生活管理テーマが既存層に高反応 → カルーセルで維持",
    "実験系・常識破壊・代謝ハックは未検証だが一般層バズの可能性大 → リールで攻める",
    "GLP-1/薬剤情報は単体だと低反応。「専門医の本音」切り口なら一般層に刺さる",
    "アプリ直接宣伝NG。課題解決ストーリーの文脈で紹介",
  ],

  contentStrategy: [
    {
      rule: "リール優先（新規リーチ重視）",
      detail: "IGアルゴリズムがリール優遇。フォロワー外リーチはリールがカルーセルの10倍。週3リール+週2カルーセルの比率で運用",
    },
    {
      rule: "バズ構造を意識した企画設計",
      detail: "保存・シェアされるのは①意外性（専門医が◯◯する理由）②対立構造（A vs B）③実験系（CGMつけて◯◯した結果）④常識破壊（◯◯は嘘）の4パターン",
    },
    {
      rule: "ターゲットを一般層に拡大",
      detail: "糖尿病患者だけでなく、健康意識の高いビジネスパーソン・ダイエッターに刺さるテーマ（血糖スパイク、代謝ハック、食後の眠気）を7割に",
    },
    {
      rule: "AI実装コンテンツで差別化",
      detail: "自作アプリのデモ、AIで医療アプリを作る過程のリールは他の医師インフルエンサーとの最大の差別化ポイント。月2本以上",
    },
    {
      rule: "フックは最初の1秒で決まる",
      detail: "リールの冒頭・カルーセルの1枚目で「えっ？」と思わせるフック。数字・逆説・疑問形を活用",
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

  // === 新戦略: バズ構造テーマを最優先 ===
  // 実験系・CGM体験
  if (/cgm.*つけて|つけて.*cgm|実験|検証|やってみた|してみた|した結果/.test(text)) {
    return { tier: "S", avgLikes: 80, suggestion: "実験系は最高のバズ構造。リールで体験を見せる" };
  }
  // 常識破壊・myth-busting
  if (/嘘|本当|実は|逆に|間違い|常識|誤解|やめない理由|勧めない/.test(text)) {
    return { tier: "S", avgLikes: 75, suggestion: "常識を覆す切り口はシェアされやすい。リール推奨" };
  }
  // 代謝ハック・ビジネスパーソン向け
  if (/血糖スパイク|眠気|集中力|パフォーマンス|代謝|ダイエット|痩せ/.test(text)) {
    return { tier: "S", avgLikes: 70, suggestion: "一般層に刺さるテーマ。リールで短く解説" };
  }
  // AI×医療
  if (/ai|claude|chatgpt|アプリ.*作|開発|プログラミング/.test(text)) {
    return { tier: "S", avgLikes: 65, suggestion: "差別化の核。デモ動画リール or 開発過程カルーセル" };
  }
  // VS・比較系
  if (/vs|比較|どっち|どちら|違い/.test(text)) {
    return { tier: "S", avgLikes: 65, suggestion: "対立構造はエンゲージメント高。保存されやすい" };
  }

  // === 既存の高パフォーマンステーマ ===
  if (/インスリン.*(基礎|種類|使い分け)/.test(text) || /基礎知識.*インスリン/.test(text)) {
    return { tier: "S", avgLikes: 81, suggestion: "最高エンゲージメントテーマ。カルーセルで詳しく解説" };
  }
  if (/hba1c|ヘモグロビン/.test(text)) {
    return { tier: "S", avgLikes: 66, suggestion: "高反応テーマ。患者教育の観点でカルーセル推奨" };
  }
  if (/tir|cgm|リブレ|デキスコム|血糖モニタ/.test(text)) {
    return { tier: "S", avgLikes: 58, suggestion: "最新指標テーマは関心が高い。リールで実体験を見せると◎" };
  }
  if (/シックデイ|旅行|低血糖.*対処|生活管理/.test(text)) {
    return { tier: "A", avgLikes: 44, suggestion: "具体的な生活場面テーマは共感を得やすい" };
  }
  if (/食事|カーボ|糖質|栄養/.test(text)) {
    return { tier: "A", avgLikes: 30, suggestion: "食事テーマは安定した関心。実践的な内容を" };
  }
  if (/合併症|腎症|網膜|神経障害|フットケア/.test(text)) {
    return { tier: "A", avgLikes: 26, suggestion: "合併症テーマは一定の関心あり。予防の観点で" };
  }
  if (/家族|サポート/.test(text)) {
    return { tier: "A", avgLikes: 26, suggestion: "家族向けテーマは共感を得やすい" };
  }
  if (/glp-1|新薬|fda|承認/.test(text)) {
    return { tier: "B", avgLikes: 15, suggestion: "薬剤情報単体は反応低め。「専門医の本音」「意外な事実」等の切り口で一般層に訴求" };
  }
  if (/アプリ|insucalc|dm compass/.test(text)) {
    return { tier: "B", avgLikes: 18, suggestion: "直接宣伝NG。開発ストーリーや課題解決の文脈で" };
  }

  return { tier: "unknown", avgLikes: 30, suggestion: "過去データなし。意外性のあるフックをつけてリール推奨" };
}

// Instagram投稿生成時の推奨フォーマットを返す（リール優先に転換）
export function getRecommendedFormat(topic: string): "carousel" | "reel" {
  const text = topic.toLowerCase();
  // カルーセルが適するケース: 網羅的な基礎知識、比較表、チェックリスト
  if (/基礎知識|種類.*一覧|チェックリスト|まとめ|ガイドライン/.test(text)) {
    return "carousel";
  }
  // それ以外は基本リール推奨（新規リーチ最大化）
  return "reel";
}
