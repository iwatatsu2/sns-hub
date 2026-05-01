import { NextRequest, NextResponse } from "next/server";

/* テンプレートベース生成（API不要） */

const TEMPLATES: Record<string, string[]> = {
  "ツール紹介": [
    `{theme}、Claude Codeで作りました。\n\n糖尿病専門医として「これ欲しい」と思ったものを\nvibe codingで形にしています。\n\n#医療AI #vibecoding`,
    `臨床で「{theme}が欲しい」と思い立ち\nClaude Codeに話しかけながら実装。\n\n医師が現場の課題を知ってるからこそ\n作れるものがある。\n\n#医療AI #ClaudeCode`,
    `{theme}を公開しました。\n\n外来の「あったらいいな」を\nvibe codingで形にする。\n\nコードは書けなくていい。\n課題を言語化できればいい。\n\n#医療AI #vibecoding`,
  ],
  "AI Tips": [
    `{theme}、AIに任せたら一瞬で終わった。\n\n医師がAIを使いこなす時代、もう来てます。\n\n#ClaudeCode #医療DX`,
    `医師の僕が{theme}を\nClaude Codeで自動化した話。\n\n現場を知ってる人間がAIを使うと\n本当に必要なものが作れる。\n\n#医療AI #vibecoding`,
    `{theme}のやり方、\nClaude Codeなら5分。\n\n医師×AIの可能性、\nもっと広がっていい。\n\n#ClaudeCode #医療DX`,
  ],
  "臨床エピソード": [
    `外来で{theme}。\n\n「これ、AIで解決できるな」と思って\nClaude Codeで作ってみた。\n\n現場の課題を知ってる医師だからこそ\n作れるものがある。\n\n#医療AI #糖尿病専門医`,
    `{theme}に困ってる患者さんを見て\n「アプリにすればいい」と思い立ち実装。\n\n臨床の解像度 × vibe coding\nこの掛け算が最強。\n\n#医療AI #vibecoding`,
    `今日の外来で{theme}。\n\n帰ってClaude Codeで\nプロトタイプ作ってみた。\n\n明日から使えるかもしれない。\n\n#医療AI #糖尿病専門医`,
  ],
  "ツール活用": [
    `{theme}を外来で使ってみた。\n\n自分で作ったツールが\n実際に患者さんの役に立つ瞬間、\nこれが医師×AIの醍醐味。\n\n#医療AI #糖尿病専門医`,
    `{theme}、実際に使ったら\n想像以上に便利だった。\n\n作る→使う→改善のサイクル、\nvibe codingだから速い。\n\n#医療AI #vibecoding`,
    `{theme}の活用報告。\n\n臨床で使って初めてわかる\n改善点がたくさんある。\n\n作って終わりにしない。\n\n#医療AI #ClaudeCode`,
  ],
  "息抜き": [
    `{theme}\n\nTesla乗ってAIでコード書いて\n糖尿病診てる医師の日常。\n\nテクノロジーで人生をアップデート中。`,
    `{theme}\n\n医師がテックで人生をハックする実例、\n今日も更新中。`,
    `{theme}\n\nこういう息抜きも大事。\nまた明日から医療×AI。`,
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { theme, pillar } = await req.json();
    const templates = TEMPLATES[pillar] || TEMPLATES["ツール紹介"];

    const posts = templates
      .map((t, i) => {
        const filled = t.replace(/\{theme\}/g, theme);
        const charCount = filled.replace(/\n/g, "").length;
        return `【案${i + 1}】（${charCount}文字）\n${filled}`;
      })
      .join("\n\n---\n\n");

    return NextResponse.json({ posts });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "生成エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
