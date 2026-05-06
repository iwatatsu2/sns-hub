import type { Topic } from "./topics";

// ===== テンプレート型定義 =====
export type ReelTemplate = "experiment" | "ranking" | "mythbust" | "versus" | "default";

// ===== Dr.いわたつ アバター =====
const VERCEL_BASE = "https://sns-hub-five.vercel.app";
const DR_POSES = {
  explain:   `${VERCEL_BASE}/dr-pose-explain.png`,
  think:     `${VERCEL_BASE}/dr-pose-think.png`,
  hello:     `${VERCEL_BASE}/dr-pose-hello.png`,
  confident: `${VERCEL_BASE}/dr-pose-confident.png`,
  thumbsup:  `${VERCEL_BASE}/dr-pose-thumbsup.png`,
  pc:        `${VERCEL_BASE}/dr-pose-pc.png`,
  warning:   `${VERCEL_BASE}/dr-pose-warning.png`,
  point:     `${VERCEL_BASE}/dr-pose-point.png`,
  great:     `${VERCEL_BASE}/dr-pose-great.png`,
} as const;

function selectPoseForReel(topic: Topic, scene: "hook" | "data" | "insight" | "summary" | "cta"): string {
  if (scene === "cta") return DR_POSES.great;
  if (scene === "summary") return DR_POSES.thumbsup;
  if (scene === "data") return DR_POSES.point;
  const text = `${topic.title} ${topic.hook}`;
  if (/危険|注意|見逃|誤診|リスク|警告|嘘/.test(text)) return DR_POSES.warning;
  if (/？|疑問|本当|いいの/.test(text)) return DR_POSES.think;
  if (topic.category === "ai-medicine") return DR_POSES.pc;
  return DR_POSES.explain;
}

function esc(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ===== テンプレート自動選択 =====
export function selectReelTemplate(topic: Topic): ReelTemplate {
  const text = `${topic.title} ${topic.hook}`;
  if (topic.category === "myth-busting") return "mythbust";
  if (/嘘|間違い|実は|常識|誤解|やめない理由|勧めない/.test(text)) return "mythbust";
  if (/ワースト|ランキング|TOP\d|第\d位|やってはいけない/.test(text)) return "ranking";
  if (/vs|VS|比較|どっち|どちら|違い/.test(text)) return "versus";
  if (/CGM.*つけて|した結果|してみた|やってみた|実験|検証|変化/.test(text)) return "experiment";
  return "default";
}

// ===== 共通パーツ =====
const COMMON_HEAD = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js"><\/script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;word-break:keep-all;overflow-wrap:break-word}
body{overflow:hidden;font-family:'Noto Sans JP','Hiragino Sans',sans-serif}
.comp{position:relative;width:1080px;height:1920px;transform-origin:top left;overflow:hidden}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;opacity:0}
.dr-fixed{position:absolute;bottom:40px;right:40px;width:380px;height:380px;z-index:10;pointer-events:none}
.dr-fixed img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 8px #fff) drop-shadow(0 0 8px #fff) drop-shadow(0 0 4px #fff) drop-shadow(0 0 4px #fff)}
`;

function ctaScene(topic: Topic): string {
  return `<div class="scene" id="s-cta">
  <div style="text-align:center">
    <div style="width:420px;height:420px;margin:0 auto 24px"><img src="${selectPoseForReel(topic, "cta")}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 10px #fff) drop-shadow(0 0 8px #fff) drop-shadow(0 0 5px #fff)" alt="Dr."></div>
    <div style="color:#fff;font-size:84px;font-weight:900;margin-bottom:12px">Dr.いわたつ</div>
    <div style="color:#94a3b8;font-size:48px;margin-bottom:36px">糖尿病専門医・指導医 / 医学博士</div>
    <div style="background:linear-gradient(135deg,#14b8a6,#0d9488);color:#fff;font-size:60px;font-weight:900;padding:32px 80px;border-radius:24px;display:inline-block">フォローする</div>
    <div style="display:flex;gap:28px;justify-content:center;margin-top:36px">
      <div style="background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);border-radius:20px;padding:24px 40px;text-align:center"><div style="font-size:64px">🔖</div><div style="color:#fff;font-size:44px;font-weight:700">保存</div></div>
      <div style="background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);border-radius:20px;padding:24px 40px;text-align:center"><div style="font-size:64px">📤</div><div style="color:#fff;font-size:44px;font-weight:700">シェア</div></div>
    </div>
  </div>
</div>`;
}

// ===== MYTHBUST テンプレート =====
// 赤画面+❌ → 緑画面+✅ のドラマティック切り替え
function generateMythbustReel(topic: Topic, reelData: string[]): string {
  const hookText = topic.title.length > 10 ? topic.title.slice(0, 10) : topic.title;
  const wrongFact = reelData[0] || topic.hook.split("。")[0];
  const correctFact = reelData[1] || reelData[0] || topic.hook;
  const explanation = reelData[2] || topic.source || "";
  const takeaway = reelData[3] || "専門医が最新エビデンスをもとに解説";

  return `${COMMON_HEAD}
.comp{background:#1a0505}
/* Hook: 赤背景 + 巨大❌ */
#s1{background:linear-gradient(180deg,#7f1d1d 0%,#991b1b 50%,#dc2626 100%)}
.myth-x{font-size:300px;color:rgba(255,255,255,.15);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.myth-hook{color:#fff;font-size:120px;font-weight:900;text-align:center;z-index:2;text-shadow:0 4px 30px rgba(0,0,0,.5)}
.myth-sub{color:rgba(255,255,255,.8);font-size:56px;margin-top:32px;z-index:2;text-align:center}
/* Wrong: 赤 */
#s2{background:linear-gradient(180deg,#7f1d1d 0%,#991b1b 100%)}
.wrong-box{background:rgba(0,0,0,.3);border:3px solid rgba(255,255,255,.2);border-radius:28px;padding:60px;max-width:900px;text-align:center}
.wrong-label{color:#fca5a5;font-size:60px;font-weight:900;margin-bottom:20px}
.wrong-text{color:#fff;font-size:72px;font-weight:700;line-height:1.4}
.wrong-strike{position:absolute;height:6px;background:#fff;top:50%;left:5%;width:0;opacity:.7}
/* Correct: 緑 */
#s3{background:linear-gradient(180deg,#064e3b 0%,#065f46 50%,#059669 100%)}
.correct-box{background:rgba(255,255,255,.1);border:3px solid rgba(255,255,255,.2);border-radius:28px;padding:60px;max-width:900px;text-align:center}
.correct-label{color:#6ee7b7;font-size:60px;font-weight:900;margin-bottom:20px}
.correct-text{color:#fff;font-size:72px;font-weight:700;line-height:1.4}
.correct-check{font-size:200px;margin-bottom:24px;opacity:0}
/* Explain */
#s4{background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%)}
.explain-card{background:rgba(20,184,166,.1);border:2px solid rgba(20,184,166,.3);border-radius:24px;padding:56px;max-width:900px}
.explain-title{color:#2dd4bf;font-size:76px;font-weight:900;margin-bottom:24px;text-align:center}
.explain-body{color:#e2e8f0;font-size:60px;line-height:1.6;text-align:center}
/* CTA */
#s-cta{background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
</style></head><body>
<div class="comp" id="comp">

<div class="scene" id="s1">
  <div class="myth-x">❌</div>
  <div class="myth-hook">${esc(hookText)}</div>
  <div class="myth-sub">その常識、本当ですか？</div>
</div>

<div class="scene" id="s2">
  <div class="wrong-box" style="position:relative">
    <div class="wrong-label">❌ 多くの人が信じていること</div>
    <div class="wrong-text">${esc(wrongFact)}</div>
    <div class="wrong-strike" id="strike"></div>
  </div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "data")}" alt="Dr."></div>
</div>

<div class="scene" id="s3">
  <div class="correct-check" id="checkmark">✅</div>
  <div class="correct-box">
    <div class="correct-label">✅ 専門医の答え</div>
    <div class="correct-text">${esc(correctFact)}</div>
  </div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "insight")}" alt="Dr."></div>
</div>

<div class="scene" id="s4">
  <div class="explain-card">
    <div class="explain-title">なぜ？</div>
    <div class="explain-body">${esc(explanation)}</div>
  </div>
  <div style="color:#94a3b8;font-size:48px;margin-top:24px;text-align:center">${esc(takeaway)}</div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "summary")}" alt="Dr."></div>
</div>

${ctaScene(topic)}

</div>
<script>
const tl=gsap.timeline({repeat:-1});
// S1: Hook - 巨大Xが回転しながら登場 + テキストScale Punch
tl.fromTo("#s1",{opacity:0},{opacity:1,duration:0.3},0)
  .fromTo(".myth-x",{scale:5,rotation:-180,opacity:0},{scale:1,rotation:0,opacity:.15,duration:0.6,ease:"back.out(1.2)"},0.1)
  .fromTo(".myth-hook",{scale:3,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"power4.out"},0.4)
  .fromTo(".myth-sub",{opacity:0,y:20},{opacity:1,y:0,duration:0.4},1.0)
  .to("#s1",{opacity:0,duration:0.3},3.2)
// S2: Wrong - 赤背景 + 打消し線
  .fromTo("#s2",{opacity:0},{opacity:1,duration:0.3},3.5)
  .fromTo(".wrong-box",{scale:0.9,opacity:0},{scale:1,opacity:1,duration:0.5,ease:"power2.out"},3.8)
  .to("#strike",{width:"90%",duration:0.6,ease:"power2.inOut"},5.5)
  .to("#s2",{opacity:0,duration:0.3},7.2)
// S3: Correct - 緑 + チェックマークバウンス
  .fromTo("#s3",{opacity:0},{opacity:1,duration:0.2},7.5)
  .fromTo("#checkmark",{scale:4,opacity:0},{scale:1,opacity:1,duration:0.5,ease:"back.out(2)"},7.6)
  .fromTo(".correct-box",{y:40,opacity:0},{y:0,opacity:1,duration:0.5,ease:"power2.out"},8.2)
  .to("#s3",{opacity:0,duration:0.3},12.2)
// S4: Explain
  .fromTo("#s4",{opacity:0},{opacity:1,duration:0.4},12.5)
  .fromTo(".explain-card",{y:30,opacity:0},{y:0,opacity:1,duration:0.6,ease:"power2.out"},12.8)
  .to("#s4",{opacity:0,duration:0.3},17.2)
// CTA
  .fromTo("#s-cta",{opacity:0},{opacity:1,duration:0.4},17.5)
  .fromTo("#s-cta img",{scale:0},{scale:1,duration:0.6,ease:"back.out(1.5)"},17.8)
  .to("#s-cta",{opacity:0,duration:0.4},22);
<\/script></body></html>`;
}

// ===== RANKING テンプレート =====
// カウントダウン形式: 3→2→1 (または5→1)
function generateRankingReel(topic: Topic, reelData: string[]): string {
  const hookText = topic.title.length > 12 ? topic.title.slice(0, 12) : topic.title;
  const items = reelData.slice(0, 4);
  const isWorst = /ワースト|危険|やってはいけない|NG/.test(topic.title + topic.hook);
  const accentColor = isWorst ? "#ef4444" : "#f59e0b";
  const gradStart = isWorst ? "#7f1d1d" : "#78350f";
  const gradEnd = isWorst ? "#dc2626" : "#f59e0b";

  return `${COMMON_HEAD}
.comp{background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%)}
#s1{background:linear-gradient(180deg,${gradStart},${gradEnd})}
.rank-hook{font-size:140px;font-weight:900;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.5);text-align:center}
.rank-sub{color:rgba(255,255,255,.8);font-size:52px;margin-top:24px;text-align:center}
.rank-card{background:rgba(255,255,255,.08);border-radius:24px;padding:36px 44px;margin-bottom:20px;display:flex;align-items:center;gap:28px;opacity:0;transform:translateY(40px)}
.rank-num{font-size:96px;font-weight:900;color:${accentColor};min-width:120px;text-align:center}
.rank-text{font-size:56px;font-weight:700;color:#fff;line-height:1.4}
.rank-first{border:3px solid ${accentColor};background:rgba(${isWorst ? "239,68,68" : "245,158,11"},.15)}
/* Summary */
.rank-summary{max-width:900px;width:100%}
.rank-sum-item{display:flex;align-items:center;gap:20px;padding:20px;border-bottom:1px solid rgba(255,255,255,.1)}
.rank-sum-num{font-size:48px;font-weight:900;color:${accentColor};min-width:60px}
.rank-sum-text{font-size:44px;color:#e2e8f0}
#s-cta{background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
</style></head><body>
<div class="comp" id="comp">

<div class="scene" id="s1">
  <div class="rank-hook">${esc(hookText)}</div>
  <div class="rank-sub">${isWorst ? "専門医が警告" : "専門医が厳選"}</div>
</div>

<div class="scene" id="s2">
  <div style="width:100%;max-width:920px">
    ${items.map((item, i) => {
      const num = items.length - i;
      const isFirst = i === items.length - 1;
      return `<div class="rank-card${isFirst ? " rank-first" : ""}"><div class="rank-num">${num}</div><div class="rank-text">${esc(item)}</div></div>`;
    }).join("\n    ")}
  </div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "data")}" alt="Dr."></div>
</div>

<div class="scene" id="s3">
  <div style="color:#fff;font-size:80px;font-weight:900;margin-bottom:32px;text-align:center">まとめ</div>
  <div class="rank-summary">
    ${items.map((item, i) => `<div class="rank-sum-item"><div class="rank-sum-num">${items.length - i}</div><div class="rank-sum-text">${esc(item.slice(0, 30))}</div></div>`).join("\n    ")}
  </div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "summary")}" alt="Dr."></div>
</div>

${ctaScene(topic)}

</div>
<script>
const tl=gsap.timeline({repeat:-1});
// S1: Hook - Scale Punch
tl.fromTo("#s1",{opacity:0},{opacity:1,duration:0.2},0)
  .fromTo(".rank-hook",{scale:3,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"power4.out"},0.2)
  .fromTo(".rank-sub",{opacity:0,y:20},{opacity:1,y:0,duration:0.4},0.8)
  .to("#s1",{opacity:0,duration:0.3},2.7)
// S2: Ranking cards - 1枚ずつ下からスライドイン
  .fromTo("#s2",{opacity:0},{opacity:1,duration:0.3},3)
  .to(".rank-card",{opacity:1,y:0,duration:0.5,stagger:1.5,ease:"back.out(1.2)"},3.5)
  .to("#s2",{opacity:0,duration:0.3},10.5)
// S3: Summary
  .fromTo("#s3",{opacity:0},{opacity:1,duration:0.4},11)
  .fromTo(".rank-sum-item",{opacity:0,x:-20},{opacity:1,x:0,duration:0.3,stagger:0.4},11.5)
  .to("#s3",{opacity:0,duration:0.3},15.5)
// CTA
  .fromTo("#s-cta",{opacity:0},{opacity:1,duration:0.4},16)
  .fromTo("#s-cta img",{scale:0},{scale:1,duration:0.6,ease:"back.out(1.5)"},16.3)
  .to("#s-cta",{opacity:0,duration:0.4},20);
<\/script></body></html>`;
}

// ===== EXPERIMENT テンプレート =====
// Before/After の上下スプリット比較
function generateExperimentReel(topic: Topic, reelData: string[]): string {
  const hookText = topic.title.length > 12 ? topic.title.slice(0, 12) : topic.title;
  const beforeItems = reelData.filter((_, i) => i % 2 === 0).slice(0, 2);
  const afterItems = reelData.filter((_, i) => i % 2 === 1).slice(0, 2);

  return `${COMMON_HEAD}
.comp{background:#0f172a}
#s1{background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
.exp-hook{font-size:120px;font-weight:900;color:#fff;text-align:center;text-shadow:0 4px 30px rgba(0,0,0,.5)}
.exp-sub{color:rgba(255,255,255,.8);font-size:52px;margin-top:24px;text-align:center}
.exp-badge{background:rgba(20,184,166,.2);color:#2dd4bf;font-size:44px;font-weight:700;padding:12px 32px;border-radius:24px;margin-bottom:24px}
/* Before/After split */
.split-container{width:100%;height:100%;display:flex;flex-direction:column}
.split-half{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px}
.split-before{background:linear-gradient(180deg,#7f1d1d 0%,#991b1b 100%)}
.split-after{background:linear-gradient(180deg,#064e3b 0%,#065f46 100%)}
.split-label{font-size:56px;font-weight:900;margin-bottom:20px;letter-spacing:4px}
.split-label-before{color:#fca5a5}
.split-label-after{color:#6ee7b7}
.split-item{font-size:56px;color:#fff;font-weight:700;line-height:1.5;text-align:center;margin-bottom:12px}
.split-divider{height:6px;background:linear-gradient(90deg,#ef4444,#22c55e);width:0}
/* Insight */
#s3{background:linear-gradient(180deg,#0f172a,#1e293b)}
.insight-card{background:rgba(20,184,166,.1);border:2px solid rgba(20,184,166,.3);border-radius:24px;padding:56px;max-width:900px;text-align:center}
.insight-title{color:#2dd4bf;font-size:76px;font-weight:900;margin-bottom:24px}
.insight-text{color:#e2e8f0;font-size:60px;line-height:1.6}
#s-cta{background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
</style></head><body>
<div class="comp" id="comp">

<div class="scene" id="s1">
  <div class="exp-badge">🔬 実験</div>
  <div class="exp-hook">${esc(hookText)}</div>
  <div class="exp-sub">${esc(topic.hook.split("。")[0] || "")}</div>
</div>

<div class="scene" id="s2">
  <div class="split-container">
    <div class="split-half split-before">
      <div class="split-label split-label-before">❌ BEFORE</div>
      ${beforeItems.map(item => `<div class="split-item">${esc(item)}</div>`).join("\n      ")}
    </div>
    <div class="split-divider" id="divider"></div>
    <div class="split-half split-after">
      <div class="split-label split-label-after">✅ AFTER</div>
      ${afterItems.map(item => `<div class="split-item">${esc(item)}</div>`).join("\n      ")}
    </div>
  </div>
</div>

<div class="scene" id="s3">
  <div class="insight-card">
    <div class="insight-title">ポイント</div>
    <div class="insight-text">${esc(reelData[2] || topic.hook.split("。").slice(-2)[0] || "")}</div>
  </div>
  <div style="color:#94a3b8;font-size:44px;margin-top:20px;text-align:center">${esc(topic.source || "")}</div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "insight")}" alt="Dr."></div>
</div>

${ctaScene(topic)}

</div>
<script>
const tl=gsap.timeline({repeat:-1});
// S1: Hook - Scale Punch + badge
tl.fromTo("#s1",{opacity:0},{opacity:1,duration:0.2},0)
  .fromTo(".exp-badge",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"back.out(2)"},0.2)
  .fromTo(".exp-hook",{scale:2.5,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"power4.out"},0.5)
  .fromTo(".exp-sub",{opacity:0,y:20},{opacity:1,y:0,duration:0.4},1.0)
  .to("#s1",{opacity:0,duration:0.3},3.2)
// S2: Before/After - 上半分 → ディバイダー → 下半分
  .fromTo("#s2",{opacity:0},{opacity:1,duration:0.2},3.5)
  .fromTo(".split-before",{opacity:0,y:-40},{opacity:1,y:0,duration:0.5,ease:"power2.out"},3.7)
  .to("#divider",{width:"100%",duration:0.5,ease:"power2.inOut"},5.5)
  .fromTo(".split-after",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"power2.out"},6.0)
  .to("#s2",{opacity:0,duration:0.3},9.5)
// S3: Insight
  .fromTo("#s3",{opacity:0},{opacity:1,duration:0.4},10)
  .fromTo(".insight-card",{y:30,opacity:0},{y:0,opacity:1,duration:0.6,ease:"power2.out"},10.3)
  .to("#s3",{opacity:0,duration:0.3},14.5)
// CTA
  .fromTo("#s-cta",{opacity:0},{opacity:1,duration:0.4},15)
  .fromTo("#s-cta img",{scale:0},{scale:1,duration:0.6,ease:"back.out(1.5)"},15.3)
  .to("#s-cta",{opacity:0,duration:0.4},19);
<\/script></body></html>`;
}

// ===== VERSUS テンプレート =====
// 左右スプリット + 中央VS
function generateVersusReel(topic: Topic, reelData: string[]): string {
  const parts = topic.title.split(/vs|VS|と|、/);
  const nameA = parts[0]?.trim().slice(0, 12) || "A";
  const nameB = parts[1]?.trim().slice(0, 12) || "B";

  return `${COMMON_HEAD}
.comp{background:#0f172a}
#s1{background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%)}
.vs-container{width:100%;height:100%;display:flex;position:relative}
.vs-left{flex:1;background:linear-gradient(180deg,#1e3a5f,#1e40af);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px}
.vs-right{flex:1;background:linear-gradient(180deg,#7c2d12,#ea580c);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px}
.vs-badge{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:5;width:160px;height:160px;background:linear-gradient(135deg,#f59e0b,#eab308);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;color:#0f172a;box-shadow:0 0 40px rgba(245,158,11,.5)}
.vs-name{font-size:72px;font-weight:900;color:#fff;margin-bottom:24px;text-align:center}
.vs-item{font-size:48px;color:rgba(255,255,255,.9);margin-bottom:16px;text-align:center;line-height:1.4}
/* Result */
#s3{background:linear-gradient(180deg,#0f172a,#1e293b)}
.result-card{background:rgba(20,184,166,.1);border:2px solid rgba(20,184,166,.3);border-radius:24px;padding:56px;max-width:900px;text-align:center}
.result-title{color:#2dd4bf;font-size:76px;font-weight:900;margin-bottom:24px}
.result-text{color:#e2e8f0;font-size:60px;line-height:1.6}
#s-cta{background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
</style></head><body>
<div class="comp" id="comp">

<div class="scene" id="s1">
  <div style="font-size:64px;color:rgba(255,255,255,.6);margin-bottom:20px;text-align:center">どっちが正解？</div>
  <div style="display:flex;align-items:center;gap:40px">
    <div style="font-size:80px;font-weight:900;color:#60a5fa;text-align:center">${esc(nameA)}</div>
    <div style="font-size:100px;font-weight:900;color:#f59e0b">VS</div>
    <div style="font-size:80px;font-weight:900;color:#fb923c;text-align:center">${esc(nameB)}</div>
  </div>
  <div style="color:rgba(255,255,255,.6);font-size:48px;margin-top:24px;text-align:center">${esc(topic.hook.split("。")[0] || "")}</div>
</div>

<div class="scene" id="s2">
  <div class="vs-container">
    <div class="vs-left">
      <div class="vs-name">${esc(nameA)}</div>
      ${reelData.slice(0, 2).map(item => `<div class="vs-item">${esc(item)}</div>`).join("\n      ")}
    </div>
    <div class="vs-badge">VS</div>
    <div class="vs-right">
      <div class="vs-name">${esc(nameB)}</div>
      ${reelData.slice(2, 4).map(item => `<div class="vs-item">${esc(item)}</div>`).join("\n      ")}
    </div>
  </div>
</div>

<div class="scene" id="s3">
  <div class="result-card">
    <div class="result-title">専門医の結論</div>
    <div class="result-text">${esc(reelData[3] || reelData[1] || topic.hook.split("。").slice(-1)[0] || "")}</div>
  </div>
  <div class="dr-fixed"><img src="${selectPoseForReel(topic, "summary")}" alt="Dr."></div>
</div>

${ctaScene(topic)}

</div>
<script>
const tl=gsap.timeline({repeat:-1});
// S1: VS Scale Punch
tl.fromTo("#s1",{opacity:0},{opacity:1,duration:0.2},0)
  .fromTo("#s1 div:nth-child(2)",{scale:3,opacity:0},{scale:1,opacity:1,duration:0.5,ease:"power4.out"},0.2)
  .fromTo("#s1 div:nth-child(1)",{opacity:0,y:-20},{opacity:1,y:0,duration:0.4},0.6)
  .fromTo("#s1 div:nth-child(3)",{opacity:0,y:20},{opacity:1,y:0,duration:0.4},0.8)
  .to("#s1",{opacity:0,duration:0.3},3.2)
// S2: Split - 左→VS→右
  .fromTo("#s2",{opacity:0},{opacity:1,duration:0.2},3.5)
  .fromTo(".vs-left",{x:-540,opacity:0},{x:0,opacity:1,duration:0.6,ease:"power2.out"},3.6)
  .fromTo(".vs-badge",{scale:0,rotation:360},{scale:1,rotation:0,duration:0.5,ease:"back.out(2)"},4.2)
  .fromTo(".vs-right",{x:540,opacity:0},{x:0,opacity:1,duration:0.6,ease:"power2.out"},4.4)
  .fromTo(".vs-item",{opacity:0,y:15},{opacity:1,y:0,duration:0.4,stagger:0.5},5.0)
  .to("#s2",{opacity:0,duration:0.3},9.5)
// S3: Result
  .fromTo("#s3",{opacity:0},{opacity:1,duration:0.4},10)
  .fromTo(".result-card",{y:30,opacity:0},{y:0,opacity:1,duration:0.6,ease:"power2.out"},10.3)
  .to("#s3",{opacity:0,duration:0.3},14.5)
// CTA
  .fromTo("#s-cta",{opacity:0},{opacity:1,duration:0.4},15)
  .fromTo("#s-cta img",{scale:0},{scale:1,duration:0.6,ease:"back.out(1.5)"},15.3)
  .to("#s-cta",{opacity:0,duration:0.4},19);
<\/script></body></html>`;
}

// ===== メインディスパッチ =====
export function generateReelByTemplate(
  topic: Topic,
  reelData: string[],
  fallbackFn: (topic: Topic, reelData: string[]) => string
): { html: string; template: ReelTemplate } {
  const template = selectReelTemplate(topic);
  let html: string;
  switch (template) {
    case "mythbust":   html = generateMythbustReel(topic, reelData); break;
    case "ranking":    html = generateRankingReel(topic, reelData); break;
    case "experiment": html = generateExperimentReel(topic, reelData); break;
    case "versus":     html = generateVersusReel(topic, reelData); break;
    default:           html = fallbackFn(topic, reelData); break;
  }
  return { html, template };
}
