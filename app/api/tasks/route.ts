import { NextResponse } from "next/server";
import { getTodayTasks, getCurrentWeek } from "@/lib/strategy";

export async function GET() {
  const now = new Date();
  return NextResponse.json({
    tasks: getTodayTasks(now),
    weekTheme: getCurrentWeek(now),
  });
}
