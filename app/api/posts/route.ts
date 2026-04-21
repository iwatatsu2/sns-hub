import { NextRequest, NextResponse } from "next/server";
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  togglePlatformPosted,
  Platform,
} from "@/lib/posts";

export async function GET() {
  return NextResponse.json(getAllPosts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Toggle platform posted
  if (body.action === "togglePosted") {
    const post = togglePlatformPosted(body.id, body.platform as Platform);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  }

  const post = createPost(body);
  return NextResponse.json(post, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  const post = updatePost(id, updates);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const ok = deletePost(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
