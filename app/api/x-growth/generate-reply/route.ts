import { NextRequest, NextResponse } from "next/server";

/* テンプレートベース生成（API不要） */

const REPLY_PATTERNS = [
  "共感 + 一次情報を添える",
  "別の視点を提供する",
  "自分の経験を簡潔に共有する",
];

export async function POST(req: NextRequest) {
  try {
    const { tweetContent, targetName, targetCategory } = await req.json();

    // Claude Codeで使えるプロンプトを生成
    const prompt = `以下のツイートへのリプライ案を3つ作ってください。

【相手】${targetName}（${targetCategory}系）
【ツイート内容】${tweetContent}

【ルール】
- 120文字以内
- 糖尿病専門医 × 医療AI実装者としての視点で
- 薄いリプライ禁止（「勉強になります」等NG）
- 相手が知らない視点や現場の実感を添える
- 自分のツール宣伝はしない

【切り口のヒント】
1. ${REPLY_PATTERNS[0]}
2. ${REPLY_PATTERNS[1]}
3. ${REPLY_PATTERNS[2]}`;

    const guide = `💡 Claude Codeで以下のプロンプトを実行してください：\n\n---\n\n${prompt}\n\n---\n\n📋 上のプロンプトをコピーして、Claude Code（またはClaude）に貼り付けると、リプライ案が生成されます。`;

    return NextResponse.json({ replies: guide });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
