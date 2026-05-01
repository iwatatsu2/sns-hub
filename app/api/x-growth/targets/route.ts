import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "target-accounts.json");

interface TargetAccount {
  id: string;
  name: string;
  xHandle: string;
  url: string;
  category: string;
  memo: string;
  lastReplied: string | null;
}

async function readTargets(): Promise<TargetAccount[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeTargets(targets: TargetAccount[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(targets, null, 2), "utf-8");
}

export async function GET() {
  const targets = await readTargets();
  return NextResponse.json(targets);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targets = await readTargets();

    if (body.action === "add") {
      const newTarget: TargetAccount = {
        id: `ta-${String(targets.length + 1).padStart(3, "0")}`,
        name: body.name || "",
        xHandle: body.xHandle || "",
        url: body.url || "",
        category: body.category || "その他",
        memo: body.memo || "",
        lastReplied: null,
      };
      targets.push(newTarget);
      await writeTargets(targets);
      return NextResponse.json(newTarget);
    }

    if (body.action === "update") {
      const idx = targets.findIndex((t) => t.id === body.id);
      if (idx === -1)
        return NextResponse.json({ error: "not found" }, { status: 404 });
      targets[idx] = { ...targets[idx], ...body.data };
      await writeTargets(targets);
      return NextResponse.json(targets[idx]);
    }

    if (body.action === "delete") {
      const filtered = targets.filter((t) => t.id !== body.id);
      await writeTargets(filtered);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
