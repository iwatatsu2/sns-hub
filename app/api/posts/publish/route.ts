import { NextRequest, NextResponse } from "next/server";
import { getPostById, togglePlatformPosted } from "@/lib/posts";
import { postToX, postToInstagram, isApiConfigured } from "@/lib/social-api";

export async function POST(req: NextRequest) {
  const { postId, platform, text } = await req.json();

  if (!platform) {
    return NextResponse.json({ ok: false, error: "Missing platform" }, { status: 400 });
  }

  if (platform !== "x" && platform !== "instagram") {
    return NextResponse.json({ ok: false, error: "Only x and instagram are supported" }, { status: 400 });
  }

  if (!isApiConfigured(platform)) {
    return NextResponse.json({ ok: false, error: `${platform} API not configured` }, { status: 400 });
  }

  let postText: string;
  if (text) {
    postText = text;
  } else if (postId) {
    const post = getPostById(postId);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }
    if (platform === "x") {
      postText = post.platforms.x.text;
    } else {
      const ig = post.platforms.instagram;
      postText = ig.caption + "\n\n" + ig.hashtags.map((h) => `#${h}`).join(" ");
    }
  } else {
    return NextResponse.json({ ok: false, error: "Missing text or postId" }, { status: 400 });
  }

  let result;
  if (platform === "x") {
    result = await postToX(postText);
  } else {
    result = await postToInstagram(postText);
  }

  if (result.ok && postId && postId !== "pipeline") {
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
