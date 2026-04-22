import { NextRequest, NextResponse } from "next/server";
import { getPostById, togglePlatformPosted } from "@/lib/posts";
import { postToX, postToInstagram, isApiConfigured } from "@/lib/social-api";

export async function POST(req: NextRequest) {
  const { postId, platform } = await req.json();

  if (!postId || !platform) {
    return NextResponse.json({ ok: false, error: "Missing postId or platform" }, { status: 400 });
  }

  if (platform !== "x" && platform !== "instagram") {
    return NextResponse.json({ ok: false, error: "Only x and instagram are supported" }, { status: 400 });
  }

  if (!isApiConfigured(platform)) {
    return NextResponse.json({ ok: false, error: `${platform} API not configured` }, { status: 400 });
  }

  const post = getPostById(postId);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  let result;
  if (platform === "x") {
    const text = post.platforms.x.text;
    result = await postToX(text);
  } else {
    const ig = post.platforms.instagram;
    const caption = ig.caption + "\n\n" + ig.hashtags.map((h) => `#${h}`).join(" ");
    result = await postToInstagram(caption);
  }

  if (result.ok) {
    togglePlatformPosted(postId, platform);
  }

  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    x: isApiConfigured("x"),
    instagram: isApiConfigured("instagram"),
  });
}
