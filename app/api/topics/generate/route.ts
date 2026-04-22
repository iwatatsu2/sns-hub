import { NextRequest, NextResponse } from "next/server";
import { getAllTopics } from "@/lib/topics";
import { generateContent } from "@/lib/content-generator";

export async function POST(req: NextRequest) {
  const { topicId } = await req.json();
  const topics = getAllTopics();
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const result = generateContent(topic);
  // スライドのhtmlフィールドを除外（プレビューはテキストベースに変更済み）
  const lightResult = {
    ...result,
    slides: result.slides.map(({ html, ...rest }) => rest),
  };
  return NextResponse.json(lightResult);
}
