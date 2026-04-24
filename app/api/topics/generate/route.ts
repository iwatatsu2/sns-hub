import { NextRequest, NextResponse } from "next/server";
import { getAllTopics } from "@/lib/topics";
import { generateContent } from "@/lib/content-generator";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { topicId } = await req.json();
  const topics = getAllTopics();
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const result = generateContent(topic);
  const lightResult = {
    ...result,
    slides: result.slides.map(({ html, ...rest }) => rest),
  };

  // Claude Codeで事前生成されたAIコンテンツを読み込み
  let aiContent = null;
  try {
    const aiPath = path.join(process.cwd(), "data", "ai-content", `${topicId}.json`);
    if (fs.existsSync(aiPath)) {
      aiContent = JSON.parse(fs.readFileSync(aiPath, "utf-8"));
    }
  } catch { /* ignore */ }

  return NextResponse.json({ ...lightResult, aiContent });
}
