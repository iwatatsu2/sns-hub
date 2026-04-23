import { NextResponse } from "next/server";
import { getAllTopics } from "@/lib/topics";
import { generateContent } from "@/lib/content-generator";

export async function GET() {
  const topics = getAllTopics();
  const results = topics
    .filter((t) => t.status === "approved" || t.status === "generated")
    .map((topic) => {
      try {
        const content = generateContent(topic);
        // reelHtml/slides html は重いので一覧では除外
        return {
          topic,
          platforms: content.platforms,
          reelScenes: content.reelScenes,
          slideOutline: content.slideOutline,
          references: content.references,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json(results);
}
