import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllTopics } from "@/lib/topics";
import { getOodaData } from "@/lib/ooda";
import fs from "fs";
import path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topicId } = await req.json();
    const topics = getAllTopics();
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const ooda = getOodaData();
    const brand = ooda.brandProfile;
    const guidelines = ooda.guidelines;

    const systemPrompt = `あなはDr.いわたつ（糖尿病専門医・指導医 / 内分泌専門医 / 医学博士）として、note.com に掲載する医学記事を執筆するライターです。

## ブランド方針
- タグライン: ${brand.name}｜${brand.tagline}
- ターゲット（医師向け）: ${brand.target.primary}
- ターゲット（一般向け）: ${brand.target.secondary}
- トーン: ${guidelines.toneOfVoice}
- アプリ連動: ${guidelines.appTieIn}
- 注目トレンド: ${guidelines.hotTopics.join("、")}

## 禁止事項
${guidelines.mustAvoid.map(a => `- ${a}`).join("\n")}
- #や*などのマークダウン記法は使用禁止（■と━で見出し装飾）
- [🖼 Dr.いわたつイラスト挿入] のようなマーカーは絶対に入れない

## 医師向け記事の構成（5000字以上）
タイトル: 【専門医が解説】{タイトル}

冒頭フック（200字）→ 読者の「あるある」体験から入る
自己紹介: こんにちは、糖尿病専門医のDr.いわたつです。

■ この話題の背景（800-1000字）
■ 知っておくべきメカニズム（800-1000字）
■ 最新のエビデンス（800-1000字）— 論文データ、数値必須
■ 臨床で使えるデータ（800-1000字）
■ 明日からの実践ポイント（600-800字）— 番号付きリスト
■ まとめ（200字）

━━━━━━━━━━━━━━━
著者ブロック:
著者: ${brand.name}｜${brand.tagline}
糖尿病専門医・指導医 / 内分泌専門医 / 医学博士
Instagram: @dr.iwatatsu / X: @kenkyu1019799

## 一般向け記事の構成（2000-3000字）
同じテーマを患者・一般の方にもわかるように平易に解説。
専門用語には必ず説明を付ける。恐怖訴求ではなく「知ることで安心」のトーン。

## 出力形式
以下のJSON形式で出力してください（JSONのみ、説明不要）:
{
  "noteBody": "（医師向け5000字以上の本文）",
  "noteBodyPublic": "（一般向け2000-3000字の本文）",
  "xText": "（X投稿文、140全角文字以内）"
}`;

    const userPrompt = `以下のトピックについてnote記事を生成してください:

タイトル: ${topic.title}
カテゴリ: ${topic.category}
フック: ${topic.hook}
ソース: ${topic.source || "なし"}
AI切り口: ${topic.aiAngle || "なし"}
アプリ連携: ${topic.appTieIn || "なし"}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // JSONを抽出（コードブロックで囲まれている場合にも対応）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI出力のパースに失敗" }, { status: 500 });
    }

    const generated = JSON.parse(jsonMatch[0]);

    // ai-contentディレクトリに保存（ローカル開発時のみ、Vercelは読み取り専用）
    try {
      const aiDir = path.join(process.cwd(), "data", "ai-content");
      if (!fs.existsSync(aiDir)) fs.mkdirSync(aiDir, { recursive: true });
      const aiPath = path.join(aiDir, `${topicId}.json`);
      fs.writeFileSync(aiPath, JSON.stringify(generated, null, 2), "utf-8");
    } catch {
      // Vercel等の読み取り専用環境では保存をスキップ
    }

    return NextResponse.json(generated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "生成エラー";
    console.error("generate-note error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
