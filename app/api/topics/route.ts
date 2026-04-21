import { NextRequest, NextResponse } from "next/server";
import {
  getAllTopics,
  getPendingTopics,
  getNextPendingTopic,
  createTopic,
  updateTopicStatus,
  deleteTopic,
  bulkCreateTopics,
  TopicStatus,
} from "@/lib/topics";

export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get("filter");
  if (filter === "pending") return NextResponse.json(getPendingTopics());
  if (filter === "next") return NextResponse.json(getNextPendingTopic());
  return NextResponse.json(getAllTopics());
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "updateStatus") {
    const topic = updateTopicStatus(body.id, body.status as TopicStatus);
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(topic);
  }

  if (body.action === "bulkCreate") {
    const created = bulkCreateTopics(body.topics);
    return NextResponse.json(created, { status: 201 });
  }

  const topic = createTopic(body);
  return NextResponse.json(topic, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const ok = deleteTopic(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
