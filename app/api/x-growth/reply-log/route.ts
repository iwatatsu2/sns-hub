import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "data", "reply-log.json");
const TARGETS_PATH = path.join(process.cwd(), "data", "target-accounts.json");

interface ReplyLog {
  id: string;
  date: string;
  targetId: string;
  targetName: string;
  tweetContent: string;
  replyText: string;
}

async function readLog(): Promise<ReplyLog[]> {
  const raw = await fs.readFile(LOG_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  const log = await readLog();
  return NextResponse.json(log);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await readLog();

    const entry: ReplyLog = {
      id: `rl-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      targetId: body.targetId || "",
      targetName: body.targetName || "",
      tweetContent: body.tweetContent || "",
      replyText: body.replyText || "",
    };
    log.push(entry);
    await fs.writeFile(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

    // Update lastReplied on target
    if (body.targetId) {
      const targetsRaw = await fs.readFile(TARGETS_PATH, "utf-8");
      const targets = JSON.parse(targetsRaw);
      const idx = targets.findIndex(
        (t: { id: string }) => t.id === body.targetId
      );
      if (idx !== -1) {
        targets[idx].lastReplied = entry.date;
        await fs.writeFile(
          TARGETS_PATH,
          JSON.stringify(targets, null, 2),
          "utf-8"
        );
      }
    }

    return NextResponse.json(entry);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
