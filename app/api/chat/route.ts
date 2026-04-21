import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages, topicContext } = await req.json();

    const systemPrompt = `あなたは糖尿病・肥満症・内分泌領域の医学情報を検証するアシスタントです。

以下のSNS投稿用トピック情報について、ユーザー（医師）からの質問に答えてください。

【トピック情報】
タイトル: ${topicContext.title}
カテゴリ: ${topicContext.category}
フック: ${topicContext.hook}
ソース: ${topicContext.source}

【ルール】
- 医学的に正確な情報を提供する
- 不確かな情報には「要確認」と明示する
- ソースの信頼性を客観的に評価する
- 数値データの正確性を検証する
- 簡潔に回答する（長文不要）
- 修正が必要な点があれば具体的に提案する`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "チャットエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
