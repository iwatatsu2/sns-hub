// X投稿生成ロジック（テーマ×ツール情報からリッチな投稿を生成）

export interface ToolInfo {
  name: string;
  url: string;
  description: string;
  features: string[];
  story: string; // 開発エピソード
  clinicalUse: string; // 臨床でどう使うか
  screenshot?: string; // アプリ画面のURL
}

export const TOOL_DATABASE: Record<string, ToolInfo> = {
  insucalc: {
    name: "InsuCalc",
    url: "https://insulin-calculator-gamma.vercel.app/",
    description: "1型糖尿病のボーラスインスリン計算アプリ",
    features: [
      "食事のカーボ入力→ボーラス自動計算",
      "CIR・ISFを時間帯別に設定可能",
      "低血糖時の緊急対応ガイド",
      "計算履歴の保存・振り返り",
    ],
    story:
      "外来で1型の患者さんに「カーボカウントが難しい」と言われたのがきっかけ。Claude Codeに相談しながら1週間で完成",
    clinicalUse:
      "カーボカウントに慣れていない患者さんに外来で見せながら一緒に使う。食品データベースから選ぶだけなので直感的",
    screenshot: "https://insulin-calculator-gamma.vercel.app/",
  },
  t1life: {
    name: "T1Life",
    url: "https://t1life.vercel.app/",
    description: "1型糖尿病と生きる人たちの情報共有コミュニティ",
    features: [
      "1型糖尿病の当事者同士の情報交換",
      "日常の血糖管理のTips共有",
      "専門医監修の情報提供",
    ],
    story:
      "1型の患者さんは人口の0.1%。周りに同じ境遇の人がいない孤独感がある。繋がれる場所をvibe codingで作った",
    clinicalUse:
      "外来で「同じ1型の人とつながりたい」という声に応えるツール",
    screenshot: "https://t1life.vercel.app/",
  },
  "dm compass": {
    name: "DM Compass",
    url: "https://iwatatsu2.github.io/dm-compass/",
    description: "糖尿病病棟管理の計算・ガイドツール",
    features: [
      "必要エネルギー量計算・インスリン混注量計算",
      "スライディングスケール自動生成",
      "インスリン製剤一覧・経口血糖降下薬ガイド",
      "糖尿病分類・合併症リファレンス",
    ],
    story:
      "研修医が糖尿病の病棟管理で迷う場面が多すぎる。「判断の道筋」をアプリにした",
    clinicalUse:
      "研修医の病棟教育ツールとして使える。スマホで即座に参照できるので病棟で便利",
    screenshot: "https://medapp-market.vercel.app/thumbnails/thumbnail-dm-compass.png",
  },
  "glucose diary": {
    name: "Glucose Diary",
    url: "https://glucose-diary-iwatatsu2.vercel.app/",
    description: "毎日の血糖記録をかしこく管理する血糖自己管理アプリ",
    features: [
      "1日7ポイントの血糖値記録",
      "週間トレンドグラフで血糖パターン可視化",
      "低血糖・高血糖パターン自動検出",
      "受診時レポート自動生成・主治医との共有",
    ],
    story:
      "患者さんの血糖ノートが毎回バラバラで読みにくい。デジタルで統一フォーマットにすれば外来がスムーズになると思って作った",
    clinicalUse:
      "患者さんにホーム画面に追加してもらい、毎日の血糖記録を習慣化。受診時にレポートを一緒に見ながら治療方針を決める",
    screenshot: "https://medapp-market.vercel.app/thumbnails/thumbnail-glucose-diary.png",
  },
  "endo compass": {
    name: "Endo Compass",
    url: "https://medapp-market.vercel.app/apps/endo-compass",
    description: "内分泌負荷試験リファレンス",
    features: [
      "内分泌負荷試験プロトコル一覧",
      "判定基準・鑑別診断ガイド",
      "スマホ最適化で検査室で即参照",
    ],
    story:
      "内分泌の負荷試験、毎回マニュアルを探すのが面倒。スマホでサッと見れるリファレンスが欲しくて作った",
    clinicalUse:
      "内分泌検査の現場で、プロトコルと判定基準をすぐに確認できる",
    screenshot: "https://medapp-market.vercel.app/thumbnails/thumbnail-endo-compass.png",
  },
  "electrolyte compass": {
    name: "Electrolyte Compass",
    url: "https://medapp-market.vercel.app/apps/electrolyte-compass",
    description: "電解質異常の鑑別・計算ツール",
    features: [
      "電解質異常の鑑別診断フロー",
      "補正計算（Na補正速度など）",
      "緊急対応アルゴリズム",
    ],
    story:
      "電解質異常は研修医が最も困る領域の一つ。鑑別と計算を一つにまとめたツールが必要だと思った",
    clinicalUse:
      "救急や病棟で電解質異常に遭遇したとき、鑑別と補正計算を即座に行える",
    screenshot: "https://medapp-market.vercel.app/thumbnails/thumbnail-electrolyte-compass.png",
  },
  "nurse shift": {
    name: "Nurse Shift",
    url: "https://medapp-market.vercel.app/",
    description: "看護師のシフト管理・勤務表作成アプリ",
    features: [
      "月間シフト表の自動作成",
      "日勤・夜勤・準夜勤のバランス調整",
      "希望休の反映・公平性チェック",
    ],
    story:
      "病棟の師長さんが毎月シフト作りに丸1日かけてた。AIで自動化できないかと相談されて作った",
    clinicalUse:
      "師長・主任の勤務表作成の負担を軽減。公平性も担保できる",
  },
  "不穏時対応ガイド": {
    name: "不穏時対応ガイド",
    url: "https://medapp-market.vercel.app/",
    description: "入院患者の不穏・せん妄時の対応フローガイド",
    features: [
      "不穏の原因鑑別フローチャート",
      "せん妄スクリーニング（CAM-ICU等）",
      "薬剤選択ガイド（ハロペリドール・クエチアピン等）",
    ],
    story:
      "当直中の研修医が不穏コールで一番困る。「まず何を確認して、何を使うか」を即座に見れるガイドが欲しかった",
    clinicalUse:
      "夜間の不穏コール時に研修医がスマホで即参照。原因鑑別→対応→薬剤選択まで一気通貫",
  },
  medappmarket: {
    name: "MedApp Market",
    url: "https://medapp-market.vercel.app/",
    description: "医師が作った医療Webアプリのマーケットプレイス",
    features: [
      "医師が開発したアプリを一覧できる",
      "カテゴリ・診療科別に検索",
      "開発者として自分のアプリを登録可能",
    ],
    story:
      "医師がvibe codingで作ったアプリ、実は結構ある。でも知られてない。見つけられる場所が必要だと思って作った",
    clinicalUse:
      "医師が作った信頼できるツールを探せるプラットフォーム",
    screenshot: "https://medapp-market.vercel.app/",
  },
};

// テーマからツール情報を自動マッチング
function findTool(theme: string): ToolInfo | null {
  const lower = theme.toLowerCase();
  for (const [key, tool] of Object.entries(TOOL_DATABASE)) {
    if (
      lower.includes(key) ||
      lower.includes(tool.name.toLowerCase()) ||
      tool.description.includes(theme)
    ) {
      return tool;
    }
  }
  return null;
}

export interface GeneratedPost {
  text: string;
  charCount: number;
  url?: string;
  pillar: string;
  screenshot?: string;
}

export function generateXPosts(
  theme: string,
  pillar: string
): GeneratedPost[] {
  const tool = findTool(theme);
  const posts: GeneratedPost[] = [];

  if (pillar === "ツール紹介" && tool) {
    posts.push({
      text: `${tool.name}、Claude Codeで作りました。\n\n${tool.description}。\n${tool.features[0]}。\n\n${tool.story.split("。")[0]}。\n\n#医療AI #vibecoding`,
      charCount: 0,
      url: tool.url,
      pillar,
      screenshot: tool.screenshot,
    });
    posts.push({
      text: `糖尿病専門医がvibe codingで作った\n「${tool.name}」\n\n${tool.features.slice(0, 2).join("\n")}\n\n${tool.clinicalUse.split("。")[0]}。\n\n#医療AI #ClaudeCode`,
      charCount: 0,
      url: tool.url,
      pillar,
      screenshot: tool.screenshot,
    });
    posts.push({
      text: `${tool.story}\n\n現場の「これ欲しい」を形にできる時代。\n\n#医療AI #vibecoding`,
      charCount: 0,
      url: tool.url,
      pillar,
      screenshot: tool.screenshot,
    });
  } else if (pillar === "AI Tips") {
    if (tool) {
      posts.push({
        text: `${tool.name}を作ったとき学んだこと。\n\nClaude Codeに「${tool.features[0]}を作って」と伝えるだけで動くプロトタイプができる。\n\n医師に必要なのはコーディングスキルじゃない。\n「何を作るべきか」の判断力。\n\n#ClaudeCode #医療DX`,
        charCount: 0,
        url: tool.url,
        pillar,
        screenshot: tool.screenshot,
      });
    }
    posts.push({
      text: `${theme}をClaude Codeでやってみた。\n\n手順:\n1. やりたいことを日本語で伝える\n2. 出てきたコードをそのまま動かす\n3. 修正点を日本語で指示\n\nこれだけ。コード読めなくてもOK。\n\n#ClaudeCode #医療AI`,
      charCount: 0,
      pillar,
    });
    posts.push({
      text: `医師がAIを使う最大のメリットは\n「何が必要かわかっている」こと。\n\n${theme}も、現場を知ってるから\n的確な指示が出せる。\n\nエンジニアには書けない要件定義を\n医師は毎日の外来で持ってる。\n\n#医療AI #vibecoding`,
      charCount: 0,
      pillar,
    });
  } else if (pillar === "臨床エピソード") {
    if (tool) {
      posts.push({
        text: `今日の外来で${theme}の場面があった。\n\n${tool.clinicalUse}。\n\n自分で作ったツールが\n実際に役立つ瞬間、これが醍醐味。\n\n#医療AI #糖尿病専門医`,
        charCount: 0,
        url: tool.url,
        pillar,
        screenshot: tool.screenshot,
      });
    }
    posts.push({
      text: `外来で${theme}。\n\n「これ、アプリにできるな」と思った。\n\n臨床の課題を毎日浴びてる医師が\nAIで実装まで持っていける時代。\n\n次の休日にClaude Codeで作ってみる。\n\n#医療AI #糖尿病専門医`,
      charCount: 0,
      pillar,
    });
    posts.push({
      text: `${theme}は\n糖尿病外来あるあるだと思う。\n\n患者さんの「困った」に\n専門医×AIで応えていく。\n\n現場にしかない課題は\n現場の人間にしか解けない。\n\n#医療AI #vibecoding`,
      charCount: 0,
      pillar,
    });
  } else if (pillar === "ツール活用") {
    if (tool) {
      posts.push({
        text: `${tool.name}を外来で使い始めて1ヶ月。\n\n${tool.clinicalUse}。\n\n使ってみて初めてわかる改善点がある。\n作って終わりにしない。\n\n#医療AI #糖尿病専門医`,
        charCount: 0,
        url: tool.url,
        pillar,
        screenshot: tool.screenshot,
      });
      posts.push({
        text: `${tool.name}の意外な使われ方。\n\n${tool.features[1] || tool.features[0]}が\n想定外に好評だった。\n\nユーザーの声が次の開発のヒントになる。\n\n#医療AI #vibecoding`,
        charCount: 0,
        url: tool.url,
        pillar,
        screenshot: tool.screenshot,
      });
    }
    posts.push({
      text: `vibe codingで作ったツール、\n「使ってもらう」が一番難しい。\n\n作って満足→HDDに眠る\nこのパターンを避けるために\n必ず①公開②使ってもらう③発信までセット。\n\n#医療AI #ClaudeCode`,
      charCount: 0,
      pillar,
    });
  } else {
    // 息抜き
    posts.push({
      text: `${theme}\n\nTesla乗ってAIでコード書いて\n糖尿病診てる医師の日常。\n\nテクノロジーで生活をアップデート中。`,
      charCount: 0,
      pillar,
    });
    posts.push({
      text: `${theme}\n\n医師がテックで人生をハックする実例、\n今日も更新中。\n\nまた明日から医療×AI。`,
      charCount: 0,
      pillar,
    });
  }

  // 文字数計算 & 120文字超え警告
  return posts.map((p) => ({
    ...p,
    charCount: p.text.replace(/\n/g, "").length,
  }));
}
