import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, toggleTaskDone } from "@/lib/tasks";

export async function GET() {
  return NextResponse.json(getAllTasks());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, id } = body;

  if (action === "toggle" && id) {
    const task = toggleTaskDone(id);
    if (!task) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(task);
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
