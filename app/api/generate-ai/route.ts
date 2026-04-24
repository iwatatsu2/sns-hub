import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, maxTokens = 4096 } = await req.json();
    if (!prompt) {
      return Response.json({ text: "" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `API error: ${res.status} ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    return Response.json({ text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "AI生成エラー";
    return Response.json({ error: message }, { status: 500 });
  }
}
