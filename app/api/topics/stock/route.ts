import { NextResponse } from "next/server";
import { getAllTopics, bulkCreateTopics } from "@/lib/topics";
import type { Topic } from "@/lib/topics";

// 最新トレンドに基づくストック候補プール
// /sns-stock コマンドやWebSearchで得た知見を元に定期的に更新
const stockPool: Omit<Topic, "id" | "status" | "createdAt">[] = [
  {
    title: "膵β細胞を増やす「分子スイッチ」発見",
    category: "diabetes",
    hook: "糖尿病治療の根本が変わるかもしれない。京都大学が膵β細胞を増殖させる分子スイッチ「ChREBP」を発見した",
    source: "京都大学 2026年4月20日発表",
    aiAngle: "",
    appTieIn: "β細胞の基礎からDKA対応まで、研修医の糖尿病力を底上げ",
    priority: 5,
  },
  {
    title: "GLP-1薬は「痩せ薬」じゃない。多臓器を守る薬だ",
    category: "obesity",
    hook: "心不全リスク-38%、腎イベント-24%、NASH改善、睡眠時無呼吸も改善。GLP-1薬の守備範囲が広すぎる",
    source: "SELECT・FLOW・STRIDE試験 2025-2026",
    aiAngle: "",
    appTieIn: "肥満症治療の最前線をフォローするならDr.いわたつをチェック",
    priority: 5,
  },
  {
    title: "次世代肥満症薬3選：アミクレチン・survodutide・orforglipron",
    category: "obesity",
    hook: "GLP-1だけじゃない。GLP-1/アミリン、GLP-1/グルカゴン、経口GLP-1。次世代薬のパイプラインが熱い",
    source: "Zetasen社・Boehringer Ingelheim・Eli Lilly Phase 3データ",
    aiAngle: "",
    appTieIn: "肥満症治療の選択肢が爆増する時代。Dr.いわたつが専門医目線で整理します",
    priority: 4,
  },
  {
    title: "緩徐進行1型にシタグリプチン？それ、危険かも",
    category: "diabetes",
    hook: "「HbA1cが少し高い、痩せ型、抗GAD抗体陽性」→2型と誤診してDPP-4阻害薬を処方→急速にβ細胞が枯渇するケースが報告されている",
    source: "日本糖尿病学会 緩徐進行1型糖尿病ガイドライン",
    aiAngle: "",
    appTieIn: "1型vs2型の鑑別ポイント、DM Compassで3秒確認",
    priority: 5,
  },
  {
    title: "糖尿病標準診療マニュアル2026、ここが変わった",
    category: "diabetes",
    hook: "年1回改訂の標準診療マニュアル最新版が公開。GLP-1薬の位置付け引き上げ、SGLT2iの心腎保護エビデンス追加が目玉",
    source: "糖尿病標準診療マニュアル2026 一般社団法人日本糖尿病学会",
    aiAngle: "",
    appTieIn: "マニュアル改訂のポイントをDr.いわたつが専門医目線で解説",
    priority: 4,
  },
  {
    title: "SGLT2阻害薬の正常血糖DKA、見逃していませんか？",
    category: "diabetes",
    hook: "血糖200未満なのにDKA。SGLT2阻害薬使用中の「正常血糖DKA」は見逃すと命に関わる",
    source: "日本糖尿病学会 SGLT2阻害薬適正使用に関するRecommendation",
    aiAngle: "",
    appTieIn: "DKA対応フローをDM Compassで即確認",
    priority: 5,
  },
  {
    title: "メトホルミン、本当に第一選択でいいの？",
    category: "diabetes",
    hook: "世界中のガイドラインが「メトホルミン第一選択」。でも日本人の糖尿病は欧米と違う。本当にファーストチョイスでいいのか考え直す",
    source: "ADA Standards of Care 2026 / 糖尿病治療ガイド2024-2025",
    aiAngle: "",
    appTieIn: "糖尿病治療の選択肢をDr.いわたつが研修医目線で整理",
    priority: 4,
  },
  {
    title: "インスリン量の調整、自信ありますか？",
    category: "diabetes",
    hook: "入院患者のインスリン持続静注、スライディングスケール、基礎ボーラス法。研修医が最も迷うインスリン調整を実践的に解説",
    source: "病棟での糖尿病管理 実践ガイド",
    aiAngle: "",
    appTieIn: "DM Compassでインスリン計算を3秒で。病棟のポケットツール",
    priority: 5,
  },
  {
    title: "甲状腺機能異常、内科外来で見逃さないために",
    category: "endocrine",
    hook: "倦怠感、体重変動、動悸。「ストレスですね」で帰す前に甲状腺をチェックしていますか？",
    source: "日本甲状腺学会ガイドライン2025",
    aiAngle: "",
    appTieIn: "内分泌疾患の鑑別をDr.いわたつが実践的に解説",
    priority: 3,
  },
  {
    title: "副腎偶発腫、どこまで精査する？",
    category: "endocrine",
    hook: "CTで偶然見つかった副腎腫瘤。放置でいい？クッシング？褐色細胞腫？研修医が知るべき精査フローチャート",
    source: "日本内分泌学会 副腎偶発腫ガイドライン",
    aiAngle: "",
    appTieIn: "副腎偶発腫の精査フローをDr.いわたつが解説",
    priority: 3,
  },
  {
    title: "低血糖の対応、ブドウ糖だけじゃない",
    category: "diabetes",
    hook: "低血糖＝ブドウ糖投与。それだけで終わっていませんか？原因検索と再発予防まで含めた対応が研修医には必要",
    source: "糖尿病治療ガイド / 低血糖対応マニュアル",
    aiAngle: "",
    appTieIn: "低血糖対応フローをDM Compassで即確認",
    priority: 4,
  },
  {
    title: "HbA1cの落とし穴、知っていますか？",
    category: "diabetes",
    hook: "HbA1c 6.5%で「コントロール良好」？貧血、腎不全、異常ヘモグロビンでHbA1cは実際の血糖を反映しなくなる",
    source: "糖尿病診療ガイドライン / NGSP標準化",
    aiAngle: "",
    appTieIn: "HbA1cの解釈の注意点をDr.いわたつが解説",
    priority: 4,
  },
];

export async function POST() {
  try {
    const existing = getAllTopics();
    const existingTitles = new Set(existing.map((t) => t.title));

    const newCandidates = stockPool.filter((s) => !existingTitles.has(s.title));

    if (newCandidates.length === 0) {
      return NextResponse.json({
        added: 0,
        message: "追加できるストックがありません。新しいトレンドを取得するには Claude Code で /sns-stock を実行してください。",
      });
    }

    const toAdd = newCandidates.slice(0, 5);
    const created = bulkCreateTopics(toAdd.map(s => ({
      ...s,
      status: "pending" as const,
    })));

    return NextResponse.json({
      added: created.length,
      topics: created.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
      message: `${created.length}件のストックを追加しました`,
    });
  } catch {
    return NextResponse.json({ error: "ストック生成に失敗しました" }, { status: 500 });
  }
}
