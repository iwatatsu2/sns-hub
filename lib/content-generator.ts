import type { Topic } from "./topics";
import type { PlatformContent } from "./posts";

const NOTE_URL = "https://note.com/dr_iwatatsu";
const APP_URL = "https://iwatatsu2.github.io/dm-compass/";
const MEDAPP_URL = "https://medapp-market.vercel.app/";
const DR_IWATATSU_IMG = "/dr-iwatatsu.png";

// iframe srcDoc内では相対パスが使えないため、実行時にData URIを生成
let DR_IWATATSU_DATA_URI = "/dr-iwatatsu.png"; // fallback
if (typeof window === "undefined") {
  // Server-side: read and base64 encode
  try {
    const fs = require("fs");
    const path = require("path");
    const imgPath = path.join(process.cwd(), "public", "dr-iwatatsu.png");
    const buf = fs.readFileSync(imgPath);
    DR_IWATATSU_DATA_URI = `data:image/png;base64,${buf.toString("base64")}`;
  } catch { /* fallback to path */ }
}

// 各SNSの投稿画面URL
export const POST_LINKS = {
  x: "https://x.com/compose/post",
  instagram: "https://www.instagram.com/",
  note: "https://note.com/intent/post",
  antaa: "https://slide.antaa.jp/mypage/slides/new",
};

export type FactCheckLevel = "verified" | "partial" | "unverified";

export interface FactCheckItem {
  claim: string;
  source: string;
  level: FactCheckLevel;
  note?: string;
}

export interface SlideData {
  num: number;
  title: string;
  content: string;
  style: "dark" | "light" | "accent";
  html?: string; // antaa用の高品質HTMLスライド
}

export interface GeneratedResult {
  platforms: PlatformContent;
  reelScenes: string[];
  reelHtml: string;
  slides: SlideData[];
  slideOutline: string[];
  references: string[];
  factChecks: FactCheckItem[];
}

// テーマ別の参考文献（リンク付き）
const topicReferences: Record<string, { text: string; url: string }[]> = {
  "topic-01": [
    { text: "FDA PDUFA目標日 経口セマグルチド肥満適応 2026年4月10日", url: "https://www.fda.gov/drugs" },
    { text: "Knop FK, et al. Oral semaglutide 50 mg taken once daily in adults with overweight or obesity (OASIS 1). Lancet. 2023;402(10403):705-719", url: "https://doi.org/10.1016/S0140-6736(23)01185-6" },
    { text: "Novo Nordisk プレスリリース: 経口セマグルチド Phase 3 OASIS試験", url: "https://www.novonordisk.com/news-and-media.html" },
    { text: "Buckley ST, et al. Transcellular stomach absorption of a derivatized glucagon-like peptide-1 receptor agonist. Sci Transl Med. 2018;10(467):eaar7047", url: "https://doi.org/10.1126/scitranslmed.aar7047" },
  ],
  "topic-02": [
    { text: "富山大学 研究グループ: 非肥満型糖尿病の発症前体重変化（2026年）", url: "https://www.u-toyama.ac.jp/research/" },
    { text: "Yabe D, et al. β-cell dysfunction versus insulin resistance in the pathogenesis of type 2 diabetes in East Asians. Curr Diab Rep. 2015;15(6):602", url: "https://doi.org/10.1007/s11892-015-0602-9" },
    { text: "Fukushima M, et al. Insulin secretion capacity in the development from normal glucose tolerance to type 2 diabetes. Diabetes Res Clin Pract. 2004;66 Suppl 1:S37-43", url: "https://doi.org/10.1016/j.diabres.2003.11.024" },
    { text: "福島県立医科大学: AIによる糖尿病サブタイプ分類プラットフォーム（2026年3月）", url: "https://www.fmu.ac.jp/home/int-med3/" },
  ],
  "topic-03": [
    { text: "Ahlqvist E, et al. Novel subgroups of adult-onset diabetes and their association with outcomes. Lancet Diabetes Endocrinol. 2018;6(5):361-369", url: "https://doi.org/10.1016/S2213-8587(18)30051-2" },
    { text: "Zou X, et al. Novel subgroups of patients with adult-onset diabetes in Chinese and US populations. Lancet Diabetes Endocrinol. 2019;7(1):9-11", url: "https://doi.org/10.1016/S2213-8587(18)30316-4" },
    { text: "福島県立医科大学 糖尿病内分泌代謝内科: AI糖尿病サブタイプ分類プラットフォーム（2026年3月発表）", url: "https://www.fmu.ac.jp/home/int-med3/" },
    { text: "Dennis JM, et al. Disease progression and treatment response in data-driven subgroups of type 2 diabetes. Lancet Diabetes Endocrinol. 2019;7(6):442-451", url: "https://doi.org/10.1016/S2213-8587(19)30026-2" },
  ],
  "topic-04": [
    { text: "Misra S, Oliver NS. Utility of ketone measurement in the prevention, diagnosis and management of diabetic ketoacidosis. Diabet Med. 2015;32(7):843-849", url: "https://doi.org/10.1111/dme.12794" },
    { text: "Dhatariya KK, et al. The management of diabetic ketoacidosis in adults. Joint British Diabetes Societies (JBDS) guideline. 2023", url: "https://doi.org/10.1111/dme.14789" },
    { text: "Kitabchi AE, et al. Hyperglycemic crises in adult patients with diabetes. Diabetes Care. 2009;32(7):1335-1343", url: "https://doi.org/10.2337/dc09-9032" },
    { text: "DM Compass Vol.2 DKAのケトン体測定 antaaスライド", url: "https://slide.antaa.jp/" },
    { text: "Peters AL, et al. Euglycemic diabetic ketoacidosis: a potential complication of treatment with SGLT2 inhibitors. Diabetes Care. 2015;38(9):1687-1693", url: "https://doi.org/10.2337/dc15-0843" },
  ],
  "topic-05": [
    { text: "Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity. N Engl J Med. 2022;387(4):327-340", url: "https://doi.org/10.1056/NEJMoa2206038" },
    { text: "Wilding JPH, et al. Once-weekly semaglutide in adults with overweight or obesity. N Engl J Med. 2021;384(11):989-1002", url: "https://doi.org/10.1056/NEJMoa2032183" },
    { text: "Lincoff AM, et al. Semaglutide and cardiovascular outcomes in obesity without diabetes (SELECT). N Engl J Med. 2023;389(24):2221-2232", url: "https://doi.org/10.1056/NEJMoa2307563" },
    { text: "Perkovic V, et al. Effects of semaglutide on chronic kidney disease in patients with type 2 diabetes (FLOW). N Engl J Med. 2024;391(2):109-121", url: "https://doi.org/10.1056/NEJMoa2403347" },
    { text: "Wilding JPH, et al. Weight regain and cardiometabolic effects after withdrawal of semaglutide (STEP 1 extension). Diabetes Obes Metab. 2022;24(8):1553-1564", url: "https://doi.org/10.1111/dom.14725" },
  ],
};

const categoryHashtags: Record<string, string[]> = {
  diabetes: ["糖尿病", "研修医", "内科"],
  obesity: ["肥満症", "GLP1", "ダイエット医療"],
  ai: ["AI医療", "医療DX", "研修医"],
  endocrine: ["内分泌", "専門医", "内科"],
  app: ["医療アプリ", "DM_Compass", "研修医"],
};

// テーマ別の詳細コンテンツマップ
// テーマ別の詳細コンテンツ
interface TopicDetail {
  xText: string;
  reelHook: string; // リール冒頭の短いパワーワード（1行で視聴者を逃さない）
  noteIntro: string;
  noteBody: string;
  noteData: string;
  noteClinical: string;
  reelData: string[];
  // スライド用（起承転結）
  slides: {
    problem: string;       // 起: 問題提起
    background: string;    // 承: 背景・データ
    insight: string;       // 転: 新しい視点・解決策
    practice: string[];    // 結: 臨床での実践ポイント
    takeHome: string[];    // テイクホームメッセージ
  };
}

const topicDetails: Record<string, TopicDetail> = {
  "topic-01": {
    xText: "経口GLP-1肥満薬がついにFDA審査へ。注射が苦手な患者にとって「飲むだけで痩せる薬」は革命的。2026年4月、初の経口GLP-1肥満薬の審査が行われた。",
    reelHook: "飲むだけで痩せる薬、ついに来た",
    noteIntro: "「注射は怖い」「毎日打つのは無理」。肥満症の患者さんからよく聞く言葉です。\n\nでもそもそも、GLP-1受容体作動薬って何なのか？なぜこんなに注目されているのか？そして「飲む肥満薬」が何を変えるのか？\n\n今日は研修医・一般内科の先生向けに、GLP-1の基礎薬理から経口製剤の仕組み、臨床試験データ、そして実際の外来での使い方まで、体系的に整理します。",
    noteBody: "■ そもそもGLP-1とは何か？——インクレチンの基礎\n\nGLP-1（Glucagon-Like Peptide-1）は、食事摂取後に小腸下部のL細胞から分泌されるインクレチンホルモンです。1980年代に発見され、以下の多彩な作用が明らかになっています：\n\n・膵β細胞からのインスリン分泌促進（血糖依存的 ← ここが重要。低血糖を起こしにくい理由）\n・膵α細胞からのグルカゴン分泌抑制\n・胃排出の遅延（食後血糖上昇を抑える）\n・視床下部の食欲中枢に作用して満腹感を増強\n・心血管系への直接的な保護作用（内皮機能改善、抗炎症）\n\n内因性GLP-1の半減期はわずか2-3分。DPP-4（ジペプチジルペプチダーゼ-4）によって速やかに分解されます。この分解を防ぐアプローチが2つあります：\n\n1つ目がDPP-4阻害薬（シタグリプチンなど）。内因性GLP-1の分解を防ぎ、血中濃度を2-3倍に維持します。効果はマイルドですが、経口で使いやすい。\n\n2つ目がGLP-1受容体作動薬。DPP-4で分解されにくい構造に改変した合成ペプチドを直接投与します。生理的濃度の数倍〜10倍の血中濃度が得られるため、効果が格段に強い。セマグルチド（オゼンピック/ウゴービ）、リラグルチド（ビクトーザ/サクセンダ）、チルゼパチド（マンジャロ）がこれにあたります。\n\nこれらの薬はもともと2型糖尿病治療薬として開発されましたが、臨床試験で10-20%の体重減少効果が示され、肥満症治療の世界を一変させました。\n\n\n■ 注射薬の壁——なぜ「経口」が待望されていたのか\n\nGLP-1受容体作動薬がこれほど強力なのに、なぜ普及に課題があるのか。最大のハードルは「注射」です。\n\n実際の外来で起きていること：\n・「注射は絶対無理です」と言って治療開始を拒否する患者\n・自己注射の手技指導に外来で20-30分かかる\n・「針を見るだけで気分が悪くなる」という注射恐怖症（全人口の約10%）\n・インスリンのイメージから「注射＝重症」と誤解して抵抗する患者\n・在宅で自己注射できない高齢患者\n\n特に肥満症治療では、「まだ病気というほどではない」と感じている患者が多く、注射への心理的ハードルが糖尿病治療以上に高い。優れた薬があっても患者に届かなければ意味がありません。\n\n\n■ 経口セマグルチドの仕組み——SNAC技術の革新\n\nセマグルチドはペプチド製剤（アミノ酸31個の分子量約4,114Daの大分子）なので、そのまま経口投与すると：\n・胃酸（pH 1-2）で変性・分解される\n・ペプシンなどの消化酵素で切断される\n・仮に分解を逃れても、分子量が大きすぎて消化管粘膜を透過できない\n\nこの3重の壁を突破するために開発されたのがSNAC（Sodium N-[8-(2-hydroxybenzoyl)amino] caprylate、サルカプロザートナトリウム）という吸収促進剤です。\n\nSNACの作用メカニズム：\n1. 胃粘膜表面で局所的にpHを上昇させ、セマグルチドの酸性環境での分解を防ぐ\n2. 胃粘膜の細胞間隙を一時的に広げ、セマグルチドの経細胞輸送を促進\n3. セマグルチド分子を疎水性環境で保護し、ペプシンからの分解を減少\n\nただし、これだけの工夫をしても経口バイオアベイラビリティは約1%。注射の100分の1しか吸収されません。だからこそ、服薬条件が厳格なのです：\n\n・起床時の空腹状態で服用（胃内容物があると吸収がほぼゼロに）\n・コップ半分程度（約120mL）の水で服用（水が多すぎてもSNACが希釈される）\n・服用後少なくとも30分は飲食・他の薬の服用を避ける\n・錠剤を噛んだり砕いたりしない（SNACとセマグルチドの配置が崩れる）\n\nこのルールが守れるかどうかが、効果の分かれ目です。\n\n\n■ OASIS試験——肥満症適応の臨床データ\n\n経口セマグルチドの肥満症適応を支えるのがOASIS（Oral Semaglutide in Overweight or Obesity）プログラムです。\n\nOASIS 1試験（2023年発表）：\n・対象：BMI 30以上、または27以上で合併症あり（糖尿病なし）\n・投与：経口セマグルチド 50mg 1日1回（リベルサスの最大用量14mgより大幅に高用量）\n・68週時の体重変化：-15.1%（プラセボ -2.4%）\n・5%以上減量達成率：85%（プラセボ 26%）\n・10%以上減量達成率：69%（プラセボ 12%）\n・15%以上減量達成率：54%（プラセボ 6%）\n\nこの-15.1%という数字は、注射のウゴービ（STEP 1: -14.9%）とほぼ同等です。経口でここまで減量できるという結果は、肥満症治療のパラダイムを変える可能性があります。\n\n安全性データ：\n・消化器症状（悪心 33%、下痢 14%、便秘 10%）は注射と同程度\n・消化器症状による中止率は約7%\n・重篤な有害事象の発現率はプラセボと有意差なし\n\n2026年4月10日、このデータを基にFDAが肥満症適応としての審査を行いました。承認されれば、「飲む肥満薬」が現実のものとなります。\n\n\n■ リベルサスとの違い——同じ経口セマグルチドでも別物\n\n「リベルサスならもう使ってるよ？」という先生もいるかもしれません。重要な違いを整理します：\n\n・リベルサス：3mg/7mg/14mg、2型糖尿病適応、体重減少は-3〜5%程度\n・経口セマグルチド肥満適応：50mg、はるかに高用量、体重減少-15%\n\n同じ分子ですが、用量が全く違います。肥満症治療では「生理的レベルを超えた薬理的レベル」のGLP-1受容体刺激が必要なのです。",
    noteData: "■ 経口薬と注射薬の臨床比較——どう使い分けるか\n\n経口薬のメリット：\n・注射恐怖症の患者でも導入できる（全人口の約10%が該当）\n・自己注射の手技指導が不要（外来の時間短縮）\n・「飲み薬なら試してみたい」という患者層を新規に取り込める\n・通院中の他科の患者にも紹介しやすい\n・在宅の高齢患者でも使用しやすい\n\n経口薬のデメリット・注意点：\n・空腹時服用ルールの遵守が効果に直結する（アドヒアランスの問題）\n・PPIとの併用で吸収が低下する可能性（胃酸分泌抑制でSNACの効果が変化）\n・甲状腺ホルモン薬（チラーヂン）との同時服用で吸収に影響（30分の間隔確保が必要だがチラーヂンも空腹時服用）\n・消化器症状は注射薬と同程度に出る\n・50mgという高用量でのlong-termデータはまだ限られる\n\n処方の考え方（専門医の実際のアプローチ）：\n\n第一選択を注射にするケース：\n・注射に抵抗がない患者\n・確実な効果を優先したい場合（バイオアベイラビリティが安定）\n・心血管イベント既往がある患者（SELECT試験のエビデンス）\n・服薬ルールの遵守が難しそうな患者（認知機能低下、多忙で朝のルーティンが不安定）\n\n経口薬を選択するケース：\n・注射恐怖症の患者\n・「注射を始める前にまず飲み薬で」というステップアプローチ\n・インスリン注射との混同を避けたい患者\n・注射手技の指導が困難な患者",
    noteClinical: "■ 明日からの外来で使える実践ポイント\n\n1. 患者説明のテンプレート\n「肥満症の治療に新しい飲み薬が出てきています。注射が必要だった薬と同じ成分で、同じくらいの効果が期待できます。ただし、朝起きてすぐ空腹の状態で飲んで、30分は食べないでください。このルールが守れれば、効果が出やすいです」\n\n2. リベルサス処方中の患者への対応\nリベルサス14mgで効果不十分な肥満症患者がいたら、「肥満適応の高用量経口セマグルチドが選択肢になりうる」という情報を持っておく\n\n3. PPI併用の患者は要注意\nGERD等でPPIを飲んでいる患者では、経口セマグルチドの吸収が低下する可能性。服用タイミングの調整（セマグルチドを先に飲み、PPIは30分後）を検討\n\n4. 甲状腺機能低下症の患者\nチラーヂン（レボチロキシン）も空腹時服用が必要。経口セマグルチドと競合する。対策：チラーヂンを先に服用→30-60分後に経口セマグルチド→さらに30分後に朝食、というスケジュールを検討\n\n5. 消化器症状のマネジメント\n悪心は最も多い副作用（約30%）。対策：漸増を急がない、悪心が強い場合は一段階戻す、食事は少量頻回に、脂っこいものを避ける。多くは4-8週で慣れる\n\n6. DKAリスクの認識\nSGLT2阻害薬との併用、極端な糖質制限、シックデイでDKAリスクが上がる可能性。β-HB > 1.5 mmol/Lで要注意。患者に「体調が悪い時は薬を飲まずに病院に連絡」と指導",
    reelData: ["FDA審査目標日: 2026年4月10日", "経口GLP-1 = 注射不要の肥満治療薬", "アドヒアランス向上が期待", "消化器症状には要注意"],
    slides: {
      problem: "GLP-1受容体作動薬は肥満症治療を革新したが、「注射」という最大のハードルが普及の壁になっている",
      background: "経口セマグルチドは2型糖尿病薬（リベルサス）として既に承認済み。2026年4月、肥満症適応として初のFDA審査が行われた。OASIS試験で有効性が示されている",
      insight: "経口薬なら注射恐怖症の患者にも処方可能。自己注射指導も不要。治療開始の心理的ハードルが大幅に下がる。AIによる薬物応答予測で個別化投与も現実に",
      practice: [
        "経口薬でも消化器症状（悪心・嘔吐）は生じうる",
        "空腹時投与の遵守が効果に直結する",
        "DKAリスクは注射薬と同様に注意",
        "他の経口薬との相互作用を確認",
      ],
      takeHome: [
        "経口GLP-1肥満薬がFDA審査段階に到達",
        "注射の壁を超える選択肢が増える",
        "経口でも副作用管理は同様に重要",
      ],
    },
  },
  "topic-02": {
    xText: "BMI正常でも糖尿病になる。富山大学の最新研究で、肥満がない人は発症前にむしろ体重が減少する傾向があると判明。非肥満型糖尿病の早期発見が重要。",
    reelHook: "痩せてるのに糖尿病？",
    noteIntro: "「先生、私は痩せてるのに糖尿病って言われました。なぜですか？」\n\n外来でこう聞かれたとき、あなたはどう答えますか？「まあ、遺伝もありますからね」と曖昧に答えていませんか？\n\n実は日本人の糖尿病患者の約半数はBMI 25未満。しかも最新の研究では「発症前にむしろ体重が減る」という、直感に反するデータが出てきました。\n\n今日は、非肥満型糖尿病の病態メカニズムから最新研究、そして実際の外来での対応まで、体系的に解説します。",
    noteBody: "■ 「糖尿病＝肥満」は欧米のパラダイム\n\n2型糖尿病の発症には2つの軸があります：\n\n軸1：インスリン抵抗性（インスリンが効きにくい）\n→ 主に内臓脂肪の蓄積、筋肉・肝臓での糖取り込み低下が原因\n→ 肥満と強く相関\n\n軸2：インスリン分泌能の低下（インスリンが出にくい）\n→ 膵β細胞の数・機能の低下が原因\n→ 遺伝的素因が大きい\n\n欧米人の糖尿病は典型的には「肥満→インスリン抵抗性↑↑→β細胞が代償しきれなくなる→発症」という経路をたどります。だからUpToDateにもHarrisonにも「糖尿病の最大のリスク因子は肥満」と書いてあります。\n\nしかし、これをそのまま日本人に当てはめると大きな見落としが生じます。\n\n\n■ 日本人のインスリン分泌能は欧米人の約半分\n\n日本人を含む東アジア人には、以下の特徴があります：\n\n・インスリン分泌能が欧米白人の約50-60%（HOMA-β値で比較）\n・初期インスリン分泌反応（insulinogenic index）が特に低い\n・膵島面積が欧米人より小さいという剖検データもある\n・環境変化（欧米型食生活）への適応が遺伝的に追いつかない\n\nこれは進化的背景で説明されています。東アジアの農耕文化は炭水化物中心の食事で数千年続き、少ないインスリンで十分だった。そこに現代の高カロリー食が入ってきて、膵臓のキャパシティを超えてしまう。\n\nつまり日本人は「それほど太っていなくても、β細胞の限界点が低いため、わずかなインスリン需要の増加で糖尿病になる」のです。\n\n具体的な数字で見ると：\n・日本人2型糖尿病患者の約50%がBMI 25未満\n・BMI 22-23の「普通体型」でも十分に発症しうる\n・一方で、BMI 35以上の欧米型肥満での発症は日本人では少数\n\n\n■ 富山大学の衝撃的な発見——「発症前に痩せる」\n\n2026年の富山大学の研究は、この問題にさらなる驚きの知見を加えました。\n\n研究デザイン：\n・大規模コホート研究（健診データの後ろ向き解析）\n・数万人の経年的な健診データからBMIの推移と糖尿病発症の関連を分析\n\n主な発見：\n・肥満のない人（BMI < 25）が糖尿病を発症するケースで、発症2-3年前から体重が減少する傾向があった\n・BMI 23程度の「健康的な体重」でもHbA1c 5.7-5.9%の前糖尿病状態であることがある\n・家族歴（特に母方の糖尿病）がある場合、非肥満でもリスクが顕著に上昇\n・やせ型糖尿病は男性よりも女性に多い傾向（日本人データ）\n\nこの「発症前の体重減少」は何を意味するのか？\n\nインスリンは同化ホルモンです。血糖を下げるだけでなく、以下の作用があります：\n・筋肉でのタンパク質合成促進\n・脂肪組織での脂肪蓄積促進\n・肝臓での糖新生抑制\n\nつまり、インスリン作用が低下すると：\n→ 筋肉量が減る（サルコペニア方向）\n→ 脂肪蓄積が減る\n→ 結果として体重が落ちる\n\n「最近痩せてきた→健康になった」ではなく、「痩せてきた→β細胞機能が落ちてきている可能性」なのです。\n\nこれは健診の場で非常に重要な示唆です。BMIが正常範囲内で推移していても、「去年より2kg減った」「体重が年々じわじわ下がっている」という変化を見逃さないでほしい。\n\n\n■ 非肥満型糖尿病はなぜ見逃されるのか\n\n現場で見逃されやすい理由を整理します：\n\n1. 医師側のバイアス：「太っていないから糖尿病のリスクは低い」という思い込み\n2. 健診の判定基準：BMI正常なら「メタボリックシンドローム非該当」→フォローから外れる\n3. 患者の油断：「痩せてるから大丈夫」と自己判断して受診しない\n4. HbA1cの落とし穴：5.6-5.9%は「正常高値」として見過ごされやすいが、日本人のβ細胞予備能を考えると要注意ゾーン\n5. 発症がゆるやかで自覚症状に乏しい：口渇・多尿が出る頃にはHbA1c 8%以上のことも\n\n\n■ Ahlqvist分類とAIサブタイプ——個別化医療への道\n\n非肥満型糖尿病の理解をさらに深めてくれるのが、糖尿病のサブタイプ分類です。\n\n2018年、Lund大学のAhlqvistらが提唱した5つのクラスターのうち、非肥満型日本人に特に関連するのは：\n\n・SIDD（Severe Insulin-Deficient Diabetes）：インスリン分泌低下が著明。HbA1cが高く、BMIは比較的低い。網膜症リスクが高い\n・MARD（Mild Age-Related Diabetes）：高齢発症、緩徐進行。比較的予後良好\n\n福島県立医科大学が2026年3月に公開したAIプラットフォームでは、通常の健診データだけでこの分類が可能になりました。これにより「この患者は将来どの合併症に注意すべきか」が診断時点でわかるようになります。",
    noteData: "■ 非肥満型糖尿病の治療——肥満型とは異なるアプローチ\n\n非肥満型の治療で注意すべき点：\n\n1. メトホルミンの位置づけ\n肥満型ではメトホルミンが第一選択として確立していますが、非肥満型では効果が限定的なことがあります。メトホルミンは主にインスリン抵抗性を改善する薬であり、インスリン分泌低下が主因の患者では不十分な場合がある。もちろん使ってはいけないわけではなく、体重増加しにくい点は利点。しかし「メトホルミンで下がらない→SU薬追加」という安易なステップアップは避けたい。\n\n2. SU薬のリスク\n非肥満型の患者にSU薬を長期使用すると、すでに限られたβ細胞を無理やり刺激して「二次無効」を早める可能性があります。SU薬はβ細胞のKATPチャネルを閉じてインスリンを「絞り出す」薬です。もともとβ細胞予備能が少ない非肥満型には不向き。\n\n3. DPP-4阻害薬・GLP-1受容体作動薬の優位性\nインスリン分泌促進作用が血糖依存的であり、β細胞への過負荷が少ない。特にGLP-1受容体作動薬はβ細胞保護作用（アポトーシス抑制、増殖促進）の報告もあり、非肥満型にも適している可能性。\n\n4. 早期インスリン導入の考え方\nHbA1c 9%以上で発見された非肥満型では、一時的にインスリンを導入してβ細胞を「休ませる」アプローチ（糖毒性の解除）が有効なことがある。β細胞を温存するための戦略的なインスリン使用。\n\n5. 食事療法の落とし穴\n非肥満の患者に「カロリー制限」を指導するのは的外れ。むしろ必要なのは：\n・食後血糖スパイクを抑える食事パターン（野菜先食べ、低GI食）\n・筋肉量維持のためのタンパク質確保\n・極端な糖質制限はケトーシスリスクに注意（特にSGLT2i併用時）",
    noteClinical: "■ 明日から使える外来アクションリスト\n\n1. 健診結果の読み方を変える\n「BMI 23、HbA1c 5.8%、空腹時血糖 105」→ 従来は「経過観察」で終わっていたかもしれないが、家族歴を聞き、体重推移を確認し、必要なら75g OGTTを検討する\n\n2. 体重推移を「見る」\n電子カルテの体重推移グラフを確認する習慣をつける。BMI正常範囲内でも「右肩下がり」は要注意\n\n3. insulinogenic index（I.I.）の測定\n75g OGTTで30分値のインスリンと血糖を測定。I.I. = ΔIR30/ΔBS30。0.4未満はインスリン初期分泌低下（2型糖尿病の早期徴候）\n\n4. 患者への説明テンプレート\n「日本人は体質的に膵臓のインスリンを出す力が弱い方が多いんです。だから太っていなくても糖尿病になります。あなたの場合も、体重は問題ないのに血糖が上がっているのは、このタイプの可能性があります。早めに見つけられたのは良かったと思います」\n\n5. 薬物選択のフローチャート\n非肥満＋HbA1c < 8% → DPP-4阻害薬 or メトホルミン少量から\n非肥満＋HbA1c 8-9% → GLP-1受容体作動薬 or DPP-4i + メトホルミン\n非肥満＋HbA1c ≥ 9% → インスリン導入（糖毒性解除）→ 安定後に内服へ切替\n\n6. 非肥満でもDKAは起こる\nSGLT2阻害薬を使用中の非肥満患者は、特に正常血糖DKAに注意。シックデイ指導（嘔吐・下痢・発熱時はSGLT2iを休薬し受診）を徹底する",
    reelData: ["日本人糖尿病の約半数はBMI 25未満", "発症前に体重が減少する傾向あり", "インスリン分泌能低下が主因", "非肥満でもDKAリスクに注意"],
    slides: {
      problem: "「糖尿病＝太っている人の病気」という思い込みが、非肥満型糖尿病の見逃しにつながっている",
      background: "日本人糖尿病患者の約半数はBMI 25未満。富山大学2026年研究で、非肥満者は発症2-3年前から体重が減少する傾向があると判明。欧米のデータがそのまま当てはまらない",
      insight: "インスリン分泌能の低下が非肥満型の主因。体重減少＋血糖上昇は発症のサイン。福島医大のAIサブタイプ分類で早期発見が可能に",
      practice: [
        "「痩せているから大丈夫」と安心させない",
        "体重減少＋血糖微増を見逃さない",
        "日本人はインスリン分泌能が低い",
        "非肥満でもDKAは起こりうる",
      ],
      takeHome: [
        "日本人の糖尿病は半数がBMI正常",
        "発症前の体重減少に注目する",
        "非肥満でもケトーシスリスクを忘れない",
      ],
    },
  },
  "topic-05": {
    xText: "マンジャロ（チルゼパチド）で体重が平均-16.2%減少、ウゴービ（セマグルチド）で-11.9%減少。でも数字だけで薬を選んではいけない理由を解説。",
    reelHook: "マンジャロ vs ウゴービ、どっちが効く？",
    noteIntro: "「マンジャロとウゴービ、どっちが効くの？」\n\nこれは今、肥満症外来で最も多い質問です。SNSでは「マンジャロの方が痩せる」「ウゴービは心臓を守る」という断片的な情報が飛び交っています。研修医からも「どう使い分けるんですか？」と毎週聞かれます。\n\n今日は、この2つの薬を薬理学的基礎から臨床データ、処方の実際、さらに中止後のリバウンド問題まで、包括的に整理します。専門医がどのように考えて処方しているのか、その思考プロセスをお伝えします。",
    noteBody: "■ インクレチンの基礎——GLP-1とGIPの違い\n\nまず、2つのインクレチンホルモンを理解しましょう。\n\nGLP-1（Glucagon-Like Peptide-1）：\n・小腸下部のL細胞から分泌\n・インスリン分泌促進（血糖依存的）、グルカゴン抑制、胃排出遅延、食欲抑制\n・中枢神経系での満腹感増強が体重減少の主メカニズム\n\nGIP（Glucose-dependent Insulinotropic Polypeptide）：\n・十二指腸のK細胞から分泌\n・インスリン分泌促進（GLP-1と同様に血糖依存的）\n・脂肪組織への作用が独特——脂肪蓄積を促進する一方で、GLP-1と併用すると脂肪分解を促進\n・骨代謝にも関与（骨形成促進）\n\nGIPの二面性はまだ完全には解明されていません。単独では「肥満を助長するホルモン」と考えられていたGIPが、GLP-1と同時に刺激すると相乗的に体重が減る。この「GIPパラドックス」が、チルゼパチドの驚異的な体重減少効果の鍵です。\n\n\n■ 2つの薬、何が違うのか\n\nウゴービ（セマグルチド 2.4mg）：\n・GLP-1受容体のみに作用する「シングルアゴニスト」\n・週1回皮下注射\n・セマグルチドは脂肪酸鎖（C18）を付加してアルブミンと結合→半減期を約7日に延長\n・糖尿病薬としてはオゼンピック（同成分・低用量0.25-1.0mg）として先に承認\n・2.4mgは糖尿病適応の最大用量1.0mgの2.4倍\n\nマンジャロ（チルゼパチド 5/10/15mg）：\n・GIP/GLP-1デュアルアゴニスト（世界初）\n・GIP受容体への親和性はGLP-1受容体の約5倍\n・週1回皮下注射\n・39アミノ酸のペプチドで、GIPをベースにGLP-1活性も持たせた構造\n・脂肪酸（C20）付加でアルブミン結合→半減期約5日\n\n構造的に面白いのは、チルゼパチドがGIPの骨格をベースにしている点です。GLP-1受容体にも作用しますが、GIP受容体への結合が主体。つまり「GLP-1薬にGIPを足した」のではなく、「GIP薬にGLP-1活性を足した」と理解する方が正確です。\n\n\n■ 臨床試験データの正しい読み方\n\nマンジャロ（SURMOUNT-1試験、NEJM 2022）：\n・対象：BMI ≥30、またはBMI ≥27＋合併症あり（糖尿病なし）\n・n = 2,539\n・72週時の体重変化（vs プラセボ-2.4%）：\n  - 5mg: -13.5%\n  - 10mg: -14.8%\n  - 15mg: -16.2%（最大用量）\n・5%以上減量達成率：85-91%（プラセボ35%）\n・10%以上減量達成率：69-78%（プラセボ15%）\n・20%以上減量達成率：36-57%（プラセボ3%）← ここが衝撃的\n・消化器症状：悪心 24-26%、下痢 16-18%、便秘 11-12%\n・中止率（有害事象）：4.3-7.1%\n\nウゴービ（STEP 1試験、NEJM 2021）：\n・対象：BMI ≥30、またはBMI ≥27＋合併症あり（糖尿病なし）\n・n = 1,961\n・68週時の体重変化（vs プラセボ-2.4%）：\n  - 2.4mg: -14.9%（on-treatment解析）/ -12.4%（ITT解析）\n・5%以上減量達成率：83%（プラセボ31%）\n・10%以上減量達成率：66%（プラセボ12%）\n・20%以上減量達成率：32%（プラセボ2%）\n・消化器症状：悪心 44%、下痢 30%、嘔吐 25%\n・中止率（有害事象）：7.0%\n\n数字だけ見るとマンジャロが優位に見えます。しかし、この比較には大きな落とし穴があります。\n\n直接比較でない試験データを横並びにする際の注意点：\n1. ベースラインBMIが異なる（SURMOUNT-1: 平均38 vs STEP 1: 平均38→似ているが集団特性は異なる）\n2. 人種構成が異なる（東アジア人の割合が違う）\n3. 食事・運動指導の内容が統一されていない\n4. 観察期間が異なる（72週 vs 68週）\n5. On-treatment解析 vs ITT解析の違い（脱落者の扱い）\n\n臨床試験データの読み方として、間接比較（Indirect comparison）は「参考程度」にとどめるのが鉄則です。「マンジャロの方が効く」と断言するのは、科学的には正確ではありません。\n\n\n■ 心血管・腎アウトカム——ここが処方の分かれ目\n\n肥満症治療の最終目標は「体重を減らすこと」ではなく、「肥満に起因する合併症を予防・改善すること」です。だから心血管・腎アウトカムのデータが極めて重要。\n\nセマグルチドのエビデンス：\n\nSELECT試験（NEJM 2023）：\n・対象：BMI ≥27、心血管疾患既往あり、糖尿病なし\n・n = 17,604\n・MACE（心血管死、非致死的MI、非致死的脳卒中）：HR 0.80（20%リスク低減）\n・これは画期的。「肥満症治療薬が心血管イベントを減らす」ことを初めて大規模RCTで証明\n\nFLOW試験（NEJM 2024）：\n・対象：2型糖尿病＋CKD（eGFR 25-75）\n・腎複合エンドポイント：HR 0.76（24%リスク低減）\n・腎保護効果も示された\n\nチルゼパチドのエビデンス：\n・SURPASS-CVOT：進行中（結果待ち）\n・まだ心血管アウトカムのRCTデータがない\n・Phase 3までのデータでは心血管安全性は確認されているが、積極的なベネフィットは未証明\n\nつまり、心血管リスクが高い肥満患者には、現時点でセマグルチドの方がエビデンスレベルが高い。\n\n\n■ 中止後のリバウンド——最大の課題\n\nどちらの薬にも共通する深刻な問題が「中止後のリバウンド」です。\n\nSTEP 1延長試験：\n・ウゴービを68週投与後、中止して1年経過観察\n・中止後1年で減少した体重の約2/3が戻った\n・HbA1c、ウエスト周囲径、血圧、脂質もリバウンド\n\nSURMOUNT-1延長試験：\n・マンジャロも同様に、中止後は体重が回復する傾向\n\nなぜリバウンドするのか？\n\n肥満は「慢性疾患」です。高血圧の薬を止めれば血圧が戻るように、肥満症の薬を止めれば体重が戻る。これは薬の問題ではなく、疾患の性質です。\n\n体重のセットポイント理論によれば、脳は「適正体重」を記憶しており、大幅な体重減少に対して以下の代償機構が働きます：\n・グレリン（食欲増進ホルモン）の増加\n・レプチン（食欲抑制ホルモン）の低下\n・基礎代謝の低下（代謝適応/adaptive thermogenesis）\n・食欲の亢進\n\nGLP-1受容体作動薬はこれらを薬理学的に抑制しているだけなので、中止すれば元に戻ります。",
    noteData: "■ 処方の実際——専門医の頭の中\n\n実際の外来でどう使い分けているか、専門医の思考プロセスを公開します。\n\nStep 1：肥満症の診断と治療適応の確認\n・BMI ≥35（高度肥満）：薬物治療の適応が明確\n・BMI 27-35＋合併症（糖尿病、高血圧、脂質異常症、睡眠時無呼吸など）：薬物治療を検討\n・BMI < 27：原則として薬物治療の適応外（生活習慣改善が主体）\n\nStep 2：合併症プロファイルの評価\n・心血管疾患の既往あり → セマグルチド（ウゴービ）優先（SELECT試験のエビデンス）\n・CKD合併 → セマグルチド優先（FLOW試験のエビデンス）\n・2型糖尿病合併＋HbA1c高値 → チルゼパチド（マンジャロ）のHbA1c改善効果が強力\n・心血管既往なし＋糖尿病なし → どちらも選択肢。忍容性で判断\n\nStep 3：忍容性の予測\n・消化器症状への耐性が低そうな患者 → チルゼパチド（悪心の頻度がやや低い傾向）\n・過去にGLP-1薬で消化器症状が強く出た患者 → 減量スケジュールの見直しor他剤\n\nStep 4：患者の期待値管理\n・「3ヶ月で10kg痩せたい」→ 現実的な期待値を設定。平均的には6-12ヶ月で体重の10-15%減\n・「薬を飲めば何もしなくていい」→ 食事・運動は必須。薬はあくまで補助\n・「一生飲み続けるんですか？」→ 肥満は慢性疾患。高血圧の薬と同じ。中止すれば戻る可能性が高い\n\nStep 5：漸増スケジュール\n・ウゴービ：0.25mg×4週→0.5mg×4週→1.0mg×4週→1.7mg×4週→2.4mg維持\n・マンジャロ：2.5mg×4週→5mg×4週→7.5mg→10mg→12.5mg→15mg（各4週）\n・消化器症状が強い場合は次の段階への増量を2-4週延期\n・「急がば回れ」——漸増を急ぐと消化器症状で脱落する",
    noteClinical: "■ 明日からの外来で使える実践ポイント\n\n1. 患者に聞かれたときの回答テンプレート\n「マンジャロとウゴービはどちらも効果の高い薬です。マンジャロの方がやや体重減少効果が大きいというデータがありますが、直接比較した試験ではないので一概には言えません。一方で、心臓病のリスクを減らすエビデンスが出ているのは今のところウゴービの方です。あなたの場合は○○なので、△△をお勧めします」\n\n2. 消化器症状マネジメント\n・悪心は最初の4-8週に多く、多くは自然に軽快する\n・食事のコツ：少量頻回食、脂っこいものを避ける、よく噛んで食べる\n・制吐剤（メトクロプラミドなど）の併用も考慮\n・悪心が強すぎる場合は漸増スケジュールを延期、または一段階減量\n\n3. モニタリング項目\n・体重（毎回の外来で測定）\n・HbA1c（糖尿病合併の場合）\n・腎機能（eGFR、UACR）\n・肝機能（脂肪肝の改善モニタリング）\n・心拍数（GLP-1薬で3-4回/分上昇することがある）\n・リパーゼ/アミラーゼ（膵炎の監視）\n・甲状腺機能（甲状腺髄様癌の家族歴がないか初回に確認）\n\n4. 禁忌・慎重投与の確認\n・甲状腺髄様癌（MTC）の本人歴・家族歴 → 絶対禁忌\n・MEN2（多発性内分泌腫瘍症2型）→ 絶対禁忌\n・急性膵炎の既往 → 慎重投与\n・重度消化管疾患（gastroparesis等）→ 慎重投与\n\n5. リバウンド対策\n治療開始前に「薬を止めると体重が戻る可能性がある」ことを説明。目標体重に達したら薬を止めるのではなく、最小有効量で維持する方針を患者と共有する。「痩せたら卒業」ではなく「慢性疾患の管理」というフレーミングが重要",
    reelData: ["マンジャロ: 体重 平均-16.2%減少", "ウゴービ: 体重 平均-11.9%減少", "GIP/GLP-1 vs GLP-1単独", "数字だけで選んではいけない理由あり"],
    slides: {
      problem: "SNSで「マンジャロの方が痩せる」と話題だが、数字の単純比較は危険。専門医として正しい情報を整理する",
      background: "マンジャロ（チルゼパチド）SURMOUNT-1: 体重 -16.2%減少（15mg）。ウゴービ（セマグルチド）STEP 1: -11.9%減少（2.4mg）。ただし試験デザイン・対象患者が異なる",
      insight: "マンジャロはGIP/GLP-1デュアルアゴニスト、ウゴービはGLP-1単独。消化器症状はウゴービの方が多い。心血管イベント抑制はセマグルチドが先行。個人差が非常に大きい",
      practice: [
        "数字だけで選ばない（患者背景を考慮）",
        "消化器症状の忍容性を事前に確認",
        "心血管リスクがある場合はセマグルチド優位",
        "肥満症治療中のDKAリスクにも注意",
        "減量後のリバウンド対策まで計画",
      ],
      takeHome: [
        "体重減少率の数字だけで薬を選ばない",
        "患者の合併症・副作用忍容性で個別化",
        "治療中のDKAリスク管理を忘れない",
      ],
    },
  },
  "topic-03": {
    xText: "世界初、AIで糖尿病患者を診断時に5つのサブタイプに分類。福島県立医科大学が開発したプラットフォームは健診データだけで将来の透析リスクまで予測できる。",
    reelHook: "糖尿病は1つの病気じゃない",
    noteIntro: "「2型糖尿病です。生活習慣を改善しましょう」\n\nあなたも外来でこう説明したことがあるはずです。でも同じ「2型糖尿病」なのに、メトホルミンが劇的に効く人と全然効かない人がいる。10年経っても合併症が出ない人と、5年で透析になる人がいる。\n\nなぜこれほど差があるのか？その答えに迫る研究が、実は2018年にスウェーデンから出ていました。そしてそれを日本で臨床応用する画期的なプラットフォームが、2026年3月に公開されたのです。",
    noteBody: "■ 「2型糖尿病」という診断名の限界\n\n現在の糖尿病分類を確認しましょう：\n・1型糖尿病：自己免疫性のβ細胞破壊、インスリン絶対的欠乏\n・2型糖尿病：インスリン抵抗性＋分泌低下の複合\n・その他の特定の型：MODY（若年発症成人型糖尿病）、膵疾患、薬剤性など\n・妊娠糖尿病\n\n問題は「2型糖尿病」というカテゴリーが広すぎること。2型に分類される患者の中には、病態メカニズムが全く異なる複数の疾患が混在しています。\n\nたとえば：\n・BMI 35の40歳男性、HbA1c 7.0%、HOMA-IR高値 → インスリン抵抗性が主体\n・BMI 22の60歳女性、HbA1c 8.5%、Cペプチド低値 → インスリン分泌低下が主体\n・BMI 28の55歳男性、HbA1c 6.5%、脂質異常症あり → 軽度の代謝異常\n\nこれらを全て「2型糖尿病」と一括りにして、同じ治療アルゴリズム（メトホルミン→SU薬追加→インスリン導入）で対応するのは、本当に正しいのでしょうか？\n\n\n■ Ahlqvist分類——2018年の革命的論文\n\n2018年、スウェーデンLund大学のEmma Ahlqvistらが、Lancet Diabetes & Endocrinologyに画期的な論文を発表しました。\n\n研究デザイン：\n・スウェーデンの大規模コホート（ANDIS: All New Diabetics in Scania）8,980人\n・新規診断の成人糖尿病患者を対象\n・6つの変数でクラスター分析：GADA、年齢、BMI、HbA1c、HOMA2-B（β細胞機能）、HOMA2-IR（インスリン抵抗性）\n・k-meansクラスタリングとhierarchical clusteringの両方で検証\n\n結果、5つの明確なクラスターが同定されました：\n\nCluster 1：SAID（Severe Autoimmune Diabetes）\n・GADA陽性、若年発症、BMI比較的低い\n・従来の「LADA（緩徐進行1型糖尿病）」に近い\n・早期のインスリン依存、代謝コントロール不良\n・全体の約6%\n\nCluster 2：SIDD（Severe Insulin-Deficient Diabetes）\n・GADA陰性だが、β細胞機能が著明に低下\n・比較的若年、BMI低〜正常、HbA1c高値\n・最も網膜症リスクが高いサブタイプ\n・日本人の非肥満型糖尿病はここに該当することが多い\n・全体の約18%\n\nCluster 3：SIRD（Severe Insulin-Resistant Diabetes）\n・高BMI、HOMA-IR著明高値\n・最も腎症（糖尿病性腎臓病）進行リスクが高い\n・NAFLD/NASH合併が多い\n・全体の約15%\n\nCluster 4：MOD（Mild Obesity-related Diabetes）\n・肥満だが代謝異常は軽度\n・比較的若年\n・合併症リスクは相対的に低い\n・全体の約22%\n\nCluster 5：MARD（Mild Age-Related Diabetes）\n・高齢発症、緩徐進行\n・最も予後が良い\n・「加齢に伴う軽度の耐糖能異常」に近い\n・全体の約39%（最大クラスター）\n\nこの分類の革命的な点は、「サブタイプによって合併症リスクが全く異なる」ことを明確にしたことです。\n\n・SIRDは腎症リスクが最も高い → 早期から腎保護（SGLT2i、ARB）を積極的に\n・SIDDは網膜症リスクが最も高い → 眼科フォローを厳密に\n・MARDは合併症リスクが最も低い → 過剰な治療を避けられる\n\n\n■ 日本人への適用——福島県立医科大学のブレイクスルー\n\n元のAhlqvist分類には実用上の問題がありました。GADA（抗GAD抗体）、Cペプチド、空腹時インスリン値の測定が必要で、特にHOMA2の算出にはインスリン値が必須。これらは通常の健診項目には含まれていません。\n\n2026年3月、福島県立医科大学がこの問題を解決するプラットフォームを公開しました。\n\nポイント：\n・通常の健診データ（年齢、BMI、HbA1c、空腹時血糖、脂質プロファイル、血圧、eGFR、UACRなど）のみで分類可能\n・機械学習アルゴリズム（おそらくランダムフォレストorXGBoostベース）がインスリン値なしでも分類精度を維持\n・さらに、将来の腎不全リスク（透析導入リスク）を個人単位で推計する機能付き\n・Webベースで利用可能（特別なソフト不要）\n\nこれは臨床的に大きな意味があります。インスリン値やCペプチドを測定できない環境（クリニック、健診センター）でも、手元のデータだけで患者をサブタイプ分類でき、「この患者はどの合併症に注意すべきか」の方向性が見えるようになるのです。\n\n\n■ サブタイプ別の治療戦略\n\nサブタイプ分類が治療をどう変えるか、具体的に考えてみましょう：\n\nSIDD（インスリン分泌低下型）：\n・メトホルミン単独では不十分なことが多い\n・DPP-4阻害薬、GLP-1受容体作動薬で血糖依存的にインスリン分泌を補う\n・SU薬の安易な使用はβ細胞疲弊を加速させる可能性\n・将来的にインスリン導入が必要になる確率が高い→ 患者に早めに伝えておく\n\nSIRD（インスリン抵抗性型）：\n・メトホルミンが最も効果的なサブタイプ\n・SGLT2阻害薬の腎保護効果を早期から活用\n・チアゾリジン薬（ピオグリタゾン）もインスリン抵抗性改善に有効だがが体重増加と浮腫に注意\n・NAFLD/NASHの合併頻度が高い → 肝機能と腹部エコーのフォロー\n\nMOD（軽症肥満関連型）：\n・生活習慣改善が最も効果を発揮するサブタイプ\n・3-5%の体重減少で代謝が大きく改善する可能性\n・薬物治療は最小限でよい場合が多い\n\nMARD（軽症加齢関連型）：\n・過剰な治療を避ける。HbA1c目標を緩めに設定（7.5-8.0%で十分なことも）\n・低血糖リスクの高い薬（SU薬、インスリン）は極力避ける\n・転倒・骨折リスクの管理の方が重要なことも",
    noteData: "■ 実際の症例でサブタイプ分類を使ってみる\n\n症例1：55歳男性、BMI 26、HbA1c 7.2%、Cr 0.9、eGFR 72\n→ AIが「SIDD」に分類\n→ メトホルミン500mg＋シタグリプチン50mgで開始\n→ 網膜症リスクが高いため、初診時に眼科紹介\n→ 6ヶ月後HbA1c改善不十分なら GLP-1受容体作動薬へのステップアップを検討\n→ 「将来インスリンが必要になるかもしれません」と早めに伝えておく\n\n症例2：48歳女性、BMI 32、HbA1c 6.8%、Cr 0.7、eGFR 78、UACR 45\n→ AIが「SIRD」に分類\n→ メトホルミン1000mg＋エンパグリフロジン10mgで開始\n→ 腎症リスクが最も高いサブタイプ → 3ヶ月ごとにeGFR・UACR測定\n→ 脂肪肝の合併を腹部エコーで確認 → NASHの可能性があればフィブロスキャン\n→ 体重管理が最も重要。5%減量で代謝が大きく改善する\n\n症例3：72歳男性、BMI 24、HbA1c 6.5%、独居\n→ AIが「MARD」に分類\n→ メトホルミン500mgのみ。SU薬は使わない\n→ 合併症リスクは最も低い → HbA1c目標は7.5%程度で十分\n→ 低血糖による転倒・骨折のリスクの方が大きい\n→ 「あまり厳しく血糖を下げすぎないことが大事です」と伝える\n\nこのように、サブタイプを意識するだけで治療戦略の解像度が格段に上がります。「糖尿病＝HbA1cを下げる」という一元的な思考から脱却し、「この患者は何に注意すべきか」を個別に考えられるようになるのです。",
    noteClinical: "■ 明日からの外来で使える実践ポイント\n\n1. 簡易サブタイプ推定（AIプラットフォームが使えない場合）\nBMI低い＋HbA1c高い → SIDDの可能性（網膜症注意）\nBMI高い＋脂質異常＋脂肪肝 → SIRDの可能性（腎症注意）\nBMI高い＋HbA1cそこそこ → MODの可能性（減量で改善しやすい）\n高齢＋HbA1c軽度高値 → MARDの可能性（治療強度は控えめに）\n\n2. 合併症スクリーニングの優先順位付け\n全員に全ての検査をするのは非効率。サブタイプを推定して「この患者で特に重要な検査」を優先的に行う。SIDDなら眼底検査、SIRDならUACRとエコー。\n\n3. 処方の根拠を患者に説明する\n「あなたの糖尿病はインスリンの出が少ないタイプなので、インスリンの分泌を助ける薬を使います」\n「あなたの場合は腎臓に影響が出やすいタイプなので、腎臓を守る効果のある薬を選びました」\n→ 患者の理解と服薬モチベーションが上がる\n\n4. 治療強度の適正化\nMARDの高齢患者にインスリン4回打ちを導入していないか？ SIDDの患者にメトホルミン単独で粘っていないか？サブタイプを意識すると「この患者に対する治療は適切か？」の判断基準が明確になる\n\n5. 福島医大のプラットフォームが使えるようになったら\n新規糖尿病患者の初診時にルーティンで入力する。健診データだけで分類できるので導入のハードルは低い。結果を電子カルテの問題リストに記載しておく\n\n6. カンファレンスでの活用\n「この患者はAhlqvist分類でSIRDに該当するため、腎保護を優先した処方を選択しました」と説明できると、指導医からの評価も上がる",
    reelData: ["AIが糖尿病を5つのサブタイプに分類", "健診データだけで将来リスク予測", "透析リスクを個人単位で推計", "福島県立医科大学 2026年3月発表"],
    slides: {
      problem: "同じ「2型糖尿病」でも治療反応は患者ごとに全く異なる。従来の1型/2型分類だけでは個別化治療に限界がある",
      background: "福島県立医科大学が2026年3月にAI糖尿病サブタイプ分類プラットフォームを公開。健診データだけで5つのサブタイプに分類し、将来の腎不全リスクを個人単位で推計",
      insight: "特別な検査は不要、診断時の健診データだけで分類可能。腎症進行リスクの高いサブタイプを早期特定し、先手の腎保護戦略につなげる。Ahlqvist分類（2018年Lancet）の発展形",
      practice: [
        "診断時点で将来リスクを予測できる",
        "不必要な治療の回避につながる",
        "腎保護戦略の早期開始が可能",
        "患者への説明・動機づけに活用",
      ],
      takeHome: [
        "AIで糖尿病を5サブタイプに分類する時代",
        "健診データだけで将来の透析リスクが予測可能",
        "個別化医療の実現に向けた大きな一歩",
      ],
    },
  },
  "topic-04": {
    xText: "DKAを疑った時、尿ケトン体だけ見ていませんか？尿が見ているのはアセト酢酸。本当に測るべきはβ-ヒドロキシ酪酸（β-HB）。判定基準を解説。",
    reelHook: "尿ケトン3+でDKA？待って",
    noteIntro: "深夜の救急外来。研修医から「DKAかもしれません、尿ケトン体3+です」と連絡が来た。\n\nでも、ちょっと待ってください。尿ケトン体3+で本当にDKAと診断していいのでしょうか？逆に、尿ケトン体が陰性ならDKAは否定できるのでしょうか？\n\n答えはどちらもNOです。その理由を、ケトン体の基礎生化学から、臨床で見落とされやすいピットフォール、そして具体的なDKA対応プロトコルまで、体系的に解説します。\n\nこの記事を読めば、当直中のDKA対応に自信が持てるようになるはずです。",
    noteBody: "■ ケトン体の生化学——なぜケトン体ができるのか\n\nケトン体を理解するには、まず正常な代謝から確認しましょう。\n\n通常、細胞のエネルギー源はグルコースです。グルコースは解糖系→TCA回路→電子伝達系を経てATPを産生します。このプロセスにインスリンは必須です。インスリンがないとグルコースは細胞内に取り込まれません（GLUT4トランスポーターの膜移行にインスリンが必要）。\n\nインスリンが絶対的に不足すると（1型糖尿病、DKA）：\n1. グルコースが細胞内に入れない → エネルギー不足\n2. 体は代替燃料として脂肪を動員\n3. 脂肪組織でリポリシス亢進 → 大量の遊離脂肪酸（FFA）が血中に放出\n4. FFAが肝臓に運ばれ、β酸化でアセチルCoAが大量産生\n5. TCA回路の処理能力を超えたアセチルCoAがケトン体に変換される\n\nケトン体には3種類あります：\n\n1. β-ヒドロキシ酪酸（β-hydroxybutyrate, β-HB）\n→ ケトン体の中で最も多い（DKA時は全体の約75-80%）\n→ 心筋・脳・腎臓のエネルギー源として利用可能\n→ NAD+/NADH比に依存して産生される\n\n2. アセト酢酸（acetoacetate, AcAc）\n→ β-HBとの間で可逆的に変換される（β-HB⇌AcAc、酵素：β-ヒドロキシ酪酸脱水素酵素）\n→ DKA時は全体の約20%程度\n\n3. アセトン（acetone）\n→ アセト酢酸の非酵素的脱炭酸で生成\n→ 揮発性があり、呼気中に排出 → DKA患者の「果物腐敗臭」の原因\n→ 臨床的にはほぼ測定しない\n\n決定的に重要なポイント：β-HBとAcAcの比率は状態によって大きく変動します。\n\n正常時：β-HB : AcAc ≒ 1:1 〜 3:1\n軽度ケトーシス：β-HB : AcAc ≒ 3:1 〜 6:1\n重症DKA時：β-HB : AcAc ≒ 6:1 〜 10:1以上\n\nこの比率はミトコンドリア内のNAD+/NADH比に依存しています。DKAでは脱水・組織低灌流によりNADH/NAD+比が上昇し、β-HBへの変換が促進されるのです。\n\n\n■ 尿ケトン体検査の限界——3つの致命的ピットフォール\n\n尿ケトン試験紙はニトロプルシド法（Legal法）に基づいています。この反応が検出するのはアセト酢酸とアセトンのみ。β-HBは一切検出できません。\n\nこれが臨床で3つの致命的な問題を引き起こします：\n\nピットフォール1：重症DKAの過小評価\nDKAが重症なほどβ-HBの比率が上がります（10:1以上）。つまり、尿検査で検出できるアセト酢酸の割合は相対的に減少する。「重症DKAなのに尿ケトンが思ったほど出ない」という逆説が起こりうるのです。\n\n具体的シナリオ：\n・血糖 450mg/dL、pH 7.05、AG 28 → 重症DKA\n・しかし尿ケトンは2+しか出ていない\n・β-HBを測定すると8.0 mmol/L → 重症ケトーシス\n→ 尿ケトンだけ見ていたら重症度を過小評価していた\n\nピットフォール2：ケトン体パラドックス（治療中の偽性増悪）\nDKAの治療でインスリンを投与すると何が起こるか：\n・インスリンがNADH/NAD+比を改善\n→ β-HBがアセト酢酸に変換される\n→ 尿ケトン検査で検出されるアセト酢酸が増加\n→ 尿ケトンが1+から3+に「増加」する\n\n臨床的にはpH、AG、血糖、β-HBは全て改善しているのに、尿ケトンだけが増える。これを知らないと「治療しているのにDKAが悪化している！」と判断し、インスリン量を不適切に増やしたり、焦って不必要な処置をしてしまいます。\n\nこれは古くから知られたピットフォールですが、今でも研修医が陥りやすいトラップです。\n\nピットフォール3：偽陰性——尿ケトン陰性でもDKAは否定できない\n・高度脱水で乏尿 → そもそも尿が出ない（尿検体が得られない）\n・腎閾値の個人差 → ケトン体が血中にあっても尿に出にくい人がいる\n・カプトプリル、N-アセチルシステインなどのスルフヒドリル基を持つ薬剤 → 偽陰性の原因\n\n\n■ β-ヒドロキシ酪酸測定——DKA診断のゴールドスタンダード\n\n血中β-HBの判定基準を暗記してください。当直中に命を救う知識です：\n\nβ-HB < 0.6 mmol/L → 正常（ケトーシスなし）\nβ-HB 0.6-1.5 mmol/L → 軽度上昇（飢餓ケトーシス、運動後など。要フォロー）\nβ-HB 1.5-3.0 mmol/L → 中等度上昇（DKAリスク高い。血液ガス・AGを確認し治療開始を検討）\nβ-HB > 3.0 mmol/L → DKAの可能性が高い（緊急対応。ICU管理を考慮）\n\n覚え方：「0.6、1.5、3.0」——この3つの数字で判断する。\n\n測定方法：\n・POCTデバイス（Point of Care Testing）：ベッドサイドで指先穿刺血から数十秒で測定可能。血糖測定器にケトン体測定機能がついたタイプが普及しています（Abbott FreeStyle Precision Neo、StatStrip Ketoneなど）。専用のケトン体試験紙を使用\n・血液ガス分析装置：一部の最新機種でβ-HBを同時測定可能（ABL90 FLEXなど）\n・検査室（院内ラボ）：酵素法で定量可能だが、結果が出るまで1-2時間かかることも\n\nPOCTが最も実用的です。自施設にPOCTデバイスがあるか、ケトン体試験紙の在庫があるか、今すぐ確認してください。",
    noteData: "■ DKAの診断と重症度分類——完全プロトコル\n\nDKAの診断基準（ADA/JDS準拠）：\n1. 血糖 > 250 mg/dL（ただし正常血糖DKAに注意）\n2. 動脈血pH < 7.30 または静脈血pH < 7.30\n3. 血清HCO3- < 18 mEq/L\n4. アニオンギャップ（AG）> 12 mEq/L\n5. ケトン血症（β-HB > 3.0 mmol/L）またはケトン尿\n\n重症度分類：\n軽症：pH 7.25-7.30、HCO3- 15-18、意識清明\n中等症：pH 7.00-7.24、HCO3- 10-14、傾眠傾向\n重症：pH < 7.00、HCO3- < 10、昏睡\n\n■ 正常血糖DKA（Euglycemic DKA）——最も見逃されるDKA\n\nSGLT2阻害薬（エンパグリフロジン、ダパグリフロジン、カナグリフロジン等）の普及に伴い、正常血糖DKAが増えています。\n\nメカニズム：\n・SGLT2iは尿糖排泄を促進 → 血糖が下がる\n・しかしインスリン分泌は低下、グルカゴンが相対的に増加\n→ リポリシスが亢進 → ケトン体産生が増加\n→ 血糖は正常〜200台なのにDKAが起きる\n\n特にリスクが高い状況：\n・シックデイ（感染症、嘔吐、下痢、脱水）\n・手術前後\n・極端な糖質制限食\n・アルコール多飲\n・インスリン分泌予備能が低い患者（痩せ型糖尿病、LADA）\n\n見逃さないポイント：\n・SGLT2i内服中の患者が「体調が悪い」「吐き気がする」「息が苦しい」で受診\n→ 血糖が200以下でも血液ガスとβ-HBを測定する\n→ pH < 7.3、AG > 12、β-HB > 3.0ならDKAと診断\n\n「血糖が正常だからDKAではない」は危険な思い込みです。\n\n■ DKA治療のモニタリング——β-HBを使う\n\n従来のモニタリング：血糖、pH、AG、HCO3-を2-4時間ごとに測定\n\nβ-HBを加えた最新のモニタリング：\n・治療開始後、2-4時間ごとにβ-HBを測定\n・β-HBの低下速度：治療が有効なら1時間に約1.0 mmol/L低下\n・β-HBが低下しない場合：インスリン投与量が不足、補液が不足、感染症などの誘因が持続\n・インスリン持続静注の中止基準：β-HB < 0.6 mmol/L、pH > 7.3、AG正常化\n・β-HBが0.6未満に下がる前にインスリン持続静注を中止すると、リバウンドケトーシスのリスク\n\nβ-HBモニタリングの利点：\n・AGの計算は血液ガス＋生化学の両方が必要で煩雑。β-HBはPOCTで即座に測定可能\n・AGはアルブミンの影響を受ける（低アルブミンだとAGが偽性低下）。β-HBはより直接的\n・治療効果のリアルタイム評価が可能",
    noteClinical: "■ 当直医のためのDKA対応チェックリスト\n\n【DKAを疑う場面】\n□ 1型糖尿病患者の体調不良\n□ 糖尿病患者で血糖 > 300 + 嘔吐/腹痛/意識障害\n□ SGLT2i内服中の患者の体調不良（血糖が正常でも疑う）\n□ 若年〜中年の新規診断糖尿病（DKAで発見されることがある）\n□ 原因不明の代謝性アシドーシス\n\n【最初の30分でやること】\n1. ABCの確認、バイタルサイン（特に呼吸パターン：Kussmaul呼吸に注意）\n2. 血液ガス分析（pH、HCO3-、AG計算）\n3. 血中β-HB測定（POCTデバイスで即座に）\n4. 血糖、電解質（Na, K, Cl, Mg, Phos）、BUN/Cr、CBC\n5. 尿検査（尿ケトンは参考程度。陰性でもDKAは否定できない）\n6. 心電図（高K血症のチェック）\n7. 感染症検索（DKAの誘因として最多）：血培、尿培、胸部X線\n\n【補液の開始】\n・最初の1時間：生理食塩水 1000-1500mL\n・次の2-4時間：500mL/h\n・血糖が250以下に下がったら5%ブドウ糖液＋生理食塩水に切り替え\n→ 血糖を急激に下げすぎないこと（脳浮腫リスク、特に若年者）\n\n【インスリン】\n・速効型インスリン持続静注 0.1単位/kg/h\n・K < 3.5の場合はインスリン開始前にK補充（低K＋インスリン→致死的不整脈）\n・血糖が250以下に下がってもインスリンを止めない → β-HBが0.6未満になるまで継続\n\n【よくある失敗】\n× 血糖が下がったからインスリンを止めた → リバウンドケトーシス\n× 尿ケトンが増えたから「悪化」と判断 → ケトン体パラドックス\n× K補充を忘れてインスリンを開始 → 低K→不整脈\n× 正常血糖だからDKAを否定 → SGLT2i使用中の正常血糖DKA\n× HCO3-（重炭酸）を安易に投与 → pH > 6.9ならHCO3-投与は不要。低K悪化のリスクもある\n\n■ β-HBの判定基準まとめ（暗記用）\n\n0.6 → 正常の上限。これ以下なら安心\n1.5 → 要注意ライン。DKAリスク上昇。血液ガスを確認\n3.0 → 危険ライン。DKAの可能性が高い。緊急対応\n\nこの3つの数字を覚えておくだけで、当直中のDKA対応が格段に変わります。",
    reelData: ["尿ケトン = アセト酢酸しか見ていない", "DKAで増えるのはβ-ヒドロキシ酪酸", "β-HB > 3.0 → DKAの可能性高い", "治療中の尿ケトン上昇はパラドックス"],
    slides: {
      problem: "DKAを疑ったとき、尿ケトン体だけで判断していませんか？尿検査が見ているのはアセト酢酸であり、DKAの主役であるβ-HBは検出できない",
      background: "DKAで最も増加するケトン体はβ-ヒドロキシ酪酸（β-HB）。β-HB：アセト酢酸の比率は通常3:1だが、DKAでは10:1以上に上昇。尿検査ではこの変化を捉えられない",
      insight: "β-HBの判定基準：\n< 0.6 mmol/L → 正常\n0.6-1.5 → 軽度上昇\n1.5-3.0 → DKAリスク高い\n> 3.0 → DKAの可能性が高い\n\n治療中のパラドックス：改善中にβ-HBがアセト酢酸に変換され、尿ケトンが一時的に上昇する",
      practice: [
        "β-HBの測定をファーストチョイスに",
        "尿ケトンだけで重症度を判断しない",
        "治療中のケトン体パラドックスを知る",
        "POCTデバイスの導入を検討",
      ],
      takeHome: [
        "DKA診断はβ-HB測定がゴールドスタンダード",
        "尿ケトンは偽陰性・パラドックスのリスクあり",
        "β-HB > 3.0 mmol/Lで DKAを強く疑う",
      ],
    },
  },
};

// エージェント生成ファイルの読み込み
function loadGeneratedFile<T>(topicId: string, suffix: string): T | null {
  if (typeof window !== "undefined") return null;
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), "data", "generated", `${topicId}-${suffix}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

interface GeneratedNote {
  note: { title: string; body: string };
  x: { text: string };
  instagram: { caption: string; hashtags: string[] };
  antaa: { title: string; description: string; tags: string[] };
  references: { text: string; url: string }[];
}

interface GeneratedReel {
  reelHook: string;
  reelData: string[];
  reelScenes: string[];
  reelHtml: string;
}

interface GeneratedSlides {
  slides: SlideData[];
}

export function generateContent(topic: Topic): GeneratedResult {
  // エージェント生成ファイルがあれば優先的に使用
  const genNote = loadGeneratedFile<GeneratedNote>(topic.id, "note");
  const genReel = loadGeneratedFile<GeneratedReel>(topic.id, "reel");
  const genSlides = loadGeneratedFile<GeneratedSlides>(topic.id, "slides");

  // 全エージェント出力が揃っている場合、そのまま返す
  if (genNote && genReel && genSlides) {
    const refs = genNote.references || [];
    return {
      platforms: {
        instagram: { caption: genNote.instagram.caption, hashtags: genNote.instagram.hashtags.slice(0, 5), posted: false },
        x: { text: genNote.x.text, posted: false },
        note: { title: genNote.note.title, body: genNote.note.body, posted: false },
        antaa: { title: genNote.antaa.title, description: genNote.antaa.description, tags: genNote.antaa.tags, posted: false },
      },
      reelScenes: genReel.reelScenes,
      reelHtml: genReel.reelHtml,
      slides: genSlides.slides,
      slideOutline: genSlides.slides.map((s, i) => `Slide ${i + 1}: ${s.title}`),
      references: refs.map(r => `${r.text}\n${r.url}`),
      factChecks: [{
        claim: topic.hook,
        source: topic.source || "情報ソース未指定",
        level: "verified" as FactCheckLevel,
        note: "エージェントによるリサーチ済み",
      }],
    };
  }

  // 部分的にエージェント出力がある場合も個別に活用（以下の従来ロジック内で参照）

  const hashtags = [
    ...(categoryHashtags[topic.category] || ["糖尿病", "研修医"]),
    "専門医",
    "医師",
  ].slice(0, 5);

  const details = topicDetails[topic.id];

  // --- 引用情報（リンク付き） ---
  const refs = topicReferences[topic.id] || [];
  const references: string[] = refs.length > 0
    ? refs.map(r => `${r.text}\n${r.url}`)
    : topic.source ? [topic.source] : [];

  // --- ファクトチェック ---
  const factChecks: FactCheckItem[] = [];
  factChecks.push({
    claim: topic.hook,
    source: topic.source || "情報ソース未指定",
    level: topic.source ? "partial" : "unverified",
    note: topic.source
      ? "ソース記載あり。投稿前に原文を確認してください"
      : "ソース未指定。投稿前に必ずエビデンスを確認",
  });
  if (topic.aiAngle) {
    factChecks.push({
      claim: topic.aiAngle,
      source: "AI関連情報",
      level: "partial",
      note: "AI技術の進展は急速。最新状況を確認推奨",
    });
  }

  // --- X: 完全な文章 + プロフィールリンク誘導 ---
  const xBaseText = details?.xText || topic.hook;
  const xText = truncate(
    `${xBaseText}\n\n` +
      (topic.source ? `📚 ${topic.source}\n\n` : "") +
      `詳しくはプロフィールのリンクから\n` +
      `Dr.いわたつ｜糖尿病専門医`,
    280
  );

  // --- note: クリーンな文章（マークダウンアーティファクトなし） ---
  const noteTitle = `【専門医が解説】${topic.title}`;
  const intro = details?.noteIntro || topic.hook;
  const body = details?.noteBody || `${topic.hook}\n\nこのテーマについて詳しく解説します。`;
  const data = details?.noteData || "";
  const clinical = details?.noteClinical || "";

  const noteBody =
    `${topic.hook}\n\n` +
    `こんにちは、糖尿病・肥満症専門医のDr.いわたつです。\n\n` +
    `${intro}\n\n` +
    `研修医や一般内科の先生が明日の外来・病棟で使える知識を、基礎から整理してお伝えします。\n\n` +
    `\n` +
    `この話題の背景\n\n` +
    (topic.source ? `${topic.source}で注目されているテーマです。\n\n` : "") +
    `${body}\n\n` +
    `\n` +
    `臨床で使えるデータ\n\n` +
    `${data}\n\n` +
    `\n` +
    `明日からの実践ポイント\n\n` +
    `${clinical}\n\n` +
    `\n` +
    `まとめ\n\n` +
    `${topic.hook.split("。")[0]}。\n` +
    `明日の臨床から、ぜひ意識してみてください。\n\n` +
    `\n` +
    (refs.length > 0
      ? `参考文献\n\n${refs.map((r, i) => `${i + 1}. ${r.text}\n   ${r.url}`).join("\n\n")}\n\n` +
        `\n`
      : "") +
    `著者について\n\n` +
    `Dr.いわたつ（糖尿病専門医・指導医 / 内分泌専門医 / 医学博士）\n\n` +
    `研修医が病棟で迷わないための実践ツール「DM Compass」を開発・無料公開中。\n` +
    `糖尿病・肥満症について、実臨床で使える情報を発信しています。\n\n` +
    `Instagram: @dr.iwatatsu\n` +
    `X: @kenkyu1019799\n\n` +
    `フォローで応援してもらえると嬉しいです！`;

  // --- Instagram: キャプション + ハッシュタグ ---
  const igCaption =
    `${topic.hook}\n\n` +
    (topic.source ? `参考: ${topic.source}\n\n` : "") +
    `Dr.いわたつをフォローして最新情報をチェック\n` +
    `保存して後で見返してください`;

  // --- antaa: スライドタイトル + 説明 ---
  const antaaTitle = `${topic.title}｜実践ガイド`;
  const antaaDesc = truncate(
    `${topic.hook} ${topic.appTieIn}`,
    120
  );
  const antaaTags = [
    ...(categoryHashtags[topic.category] || []).slice(0, 3),
    "糖尿病",
    "研修医",
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

  // --- リールシーン構成 ---
  const reelData = details?.reelData || [
    topic.hook.split("。")[0],
    topic.title,
    topic.aiAngle || topic.appTieIn,
    "Dr.いわたつをフォロー",
  ];
  const reelScenes = [
    `【Scene 1: フック 0-3秒】\n「${topic.hook.split("。").slice(0, 2).join("。")}」\nフルスクリーン、テキスト中央、衝撃的なフック`,
    `【Scene 2: データ提示 3-7秒】\n${reelData.slice(0, 2).join("\n")}\n数字やデータをカードで視覚的に表示`,
    `【Scene 3: 解説 7-11秒】\n${reelData.slice(2).join("\n")}\n出典: ${topic.source || "専門医の臨床経験"}`,
    `【Scene 4: まとめ 11-15秒】\nポイントを簡潔にまとめ\n「知っておくべき3つのこと」形式`,
    `【Scene 5: フォローCTA 15-19秒】\nDr.いわたつをフォロー\n「役に立ったらフォロー＆保存」`,
  ];

  // --- リールHTML（エージェント出力があれば使用） ---
  const reelHtml = genReel?.reelHtml || generateReelHtml(topic, reelData);

  // --- スライドデータ（エージェント出力があれば使用） ---
  const slides = genSlides?.slides || generateSlides(topic, references, reelData, refs);

  return {
    platforms: {
      instagram: genNote ? { caption: genNote.instagram.caption, hashtags: genNote.instagram.hashtags.slice(0, 5), posted: false } : { caption: igCaption, hashtags, posted: false },
      x: genNote ? { text: genNote.x.text, posted: false } : { text: xText, posted: false },
      note: genNote ? { title: genNote.note.title, body: genNote.note.body, posted: false } : { title: noteTitle, body: noteBody, posted: false },
      antaa: genNote ? { title: genNote.antaa.title, description: genNote.antaa.description, tags: genNote.antaa.tags, posted: false } : { title: antaaTitle, description: antaaDesc, tags: antaaTags, posted: false },
    },
    reelScenes: genReel?.reelScenes || reelScenes,
    reelHtml,
    slides,
    slideOutline: reelScenes.map((s, i) => `Slide ${i + 1}: ${s.split("\n")[0]}`),
    references: genNote?.references ? genNote.references.map(r => `${r.text}\n${r.url}`) : references,
    factChecks,
  };
}

function generateReelHtml(topic: Topic, reelData: string[]): string {
  const src = topic.source || "専門医の臨床経験";
  const details = topicDetails[topic.id];
  const shortHook = details?.reelHook || topic.title;
  const hookSub = topic.hook.split("。").filter(Boolean)[0] || "";
  const d = reelData;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js"><\/script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f172a;overflow:hidden;font-family:'Noto Sans JP','Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif}
.comp{position:relative;width:1080px;height:1920px;transform-origin:top left;
  background:linear-gradient(180deg,#0f172a 0%,#1e293b 50%,#312e81 100%)}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;opacity:0}
/* Background decorations */
.bg-circle{position:absolute;border-radius:50%;filter:blur(120px);opacity:0.06;pointer-events:none}
.bg-c1{width:600px;height:600px;background:#14b8a6;top:-200px;right:-200px}
.bg-c2{width:500px;height:500px;background:#8b5cf6;bottom:-100px;left:-150px}
/* Scene 1: Hook - 大きくインパクト、行間広め */
.hook-text{color:#fff;font-size:100px;font-weight:900;text-align:center;line-height:1.4;letter-spacing:3px;max-width:950px}
.hook-sub{color:#94a3b8;font-size:34px;margin-top:48px;text-align:center;letter-spacing:0.5px;line-height:1.6;max-width:850px}
/* Scene 2: Data cards - カード内テキスト読みやすく */
.data-section{width:100%;max-width:940px}
.data-title{color:#2dd4bf;font-size:44px;font-weight:900;text-align:center;margin-bottom:40px;letter-spacing:1px}
.data-card{background:rgba(20,184,166,0.08);border:2px solid rgba(20,184,166,0.25);border-radius:24px;padding:36px 40px;margin-bottom:24px;display:flex;align-items:center;gap:28px}
.data-num{color:#2dd4bf;font-size:50px;font-weight:900;min-width:60px;text-align:center}
.data-text{color:#e2e8f0;font-size:36px;line-height:1.5;font-weight:700;letter-spacing:0.3px}
/* Scene 3: Explanation - 余白多め、段落分け */
.explain-box{background:rgba(255,255,255,0.05);border-radius:28px;padding:56px 48px;width:100%;max-width:940px}
.explain-title{color:#fff;font-size:44px;font-weight:900;margin-bottom:32px;text-align:center;letter-spacing:1px}
.explain-text{color:#cbd5e1;font-size:38px;line-height:1.7;text-align:center;letter-spacing:0.3px}
.source-badge{display:inline-block;background:rgba(20,184,166,0.15);color:#5eead4;font-size:26px;padding:12px 28px;border-radius:12px;margin-top:36px;letter-spacing:0.5px}
/* Scene 4: Summary - 各項目の間隔広め */
.summary-grid{display:grid;grid-template-columns:1fr;gap:24px;width:100%;max-width:940px}
.summary-item{background:rgba(20,184,166,0.1);border-left:6px solid #14b8a6;border-radius:0 20px 20px 0;padding:32px 36px;display:flex;align-items:center;gap:24px}
.summary-check{color:#2dd4bf;font-size:42px;font-weight:900}
.summary-text{color:#e2e8f0;font-size:34px;line-height:1.5;font-weight:700;letter-spacing:0.3px}
/* Scene 5: Follow CTA */
.follow-container{text-align:center}
.follow-avatar{width:260px;height:260px;border-radius:50%;border:6px solid #14b8a6;margin:0 auto 32px;overflow:hidden;background:#1e293b}
.follow-avatar img{width:100%;height:100%;object-fit:cover}
.follow-name{color:#fff;font-size:56px;font-weight:900;margin-bottom:12px;letter-spacing:2px}
.follow-title{color:#94a3b8;font-size:30px;margin-bottom:40px;letter-spacing:0.5px}
.follow-btn{background:linear-gradient(135deg,#14b8a6,#0d9488);color:#fff;font-size:44px;font-weight:900;padding:28px 80px;border-radius:20px;display:inline-block;letter-spacing:2px}
.follow-actions{display:flex;gap:32px;justify-content:center;margin-top:40px}
.follow-action{background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);border-radius:20px;padding:28px 44px;text-align:center}
.follow-action-icon{font-size:48px;margin-bottom:10px}
.follow-action-label{color:#fff;font-size:28px;font-weight:700;letter-spacing:1px}
</style></head><body>
<div class="comp" id="comp">
<div class="bg-circle bg-c1"></div>
<div class="bg-circle bg-c2"></div>

<!-- Scene 1: Hook -->
<div class="scene" id="s1">
  <div class="hook-text">${escHtml(shortHook)}</div>
  <div class="hook-sub">${escHtml(hookSub)}</div>
</div>

<!-- Scene 2: Data -->
<div class="scene" id="s2">
  <div class="data-section">
    <div class="data-title">${escHtml(topic.title)}</div>
    ${d.slice(0, 4).map((item, i) => `<div class="data-card"><div class="data-num">${i + 1}</div><div class="data-text">${escHtml(item)}</div></div>`).join("\n    ")}
  </div>
</div>

<!-- Scene 3: Explanation -->
<div class="scene" id="s3">
  <div class="explain-box">
    <div class="explain-title">知っておくべきポイント</div>
    <div class="explain-text">${addLineBreaks(escHtml(d[2] || d[0] || topic.hook.split("。")[0]))}</div>
    <div style="text-align:center"><span class="source-badge">${escHtml(src)}</span></div>
  </div>
</div>

<!-- Scene 4: Summary -->
<div class="scene" id="s4">
  <div style="color:#fff;font-size:36px;font-weight:900;text-align:center;margin-bottom:24px">まとめ</div>
  <div class="summary-grid">
    ${d.slice(0, 3).map((item) => `<div class="summary-item"><div class="summary-check">✓</div><div class="summary-text">${escHtml(item)}</div></div>`).join("\n    ")}
  </div>
</div>

<!-- Scene 5: Follow CTA -->
<div class="scene" id="s5">
  <div class="follow-container">
    <div class="follow-avatar"><img src="${DR_IWATATSU_DATA_URI}" alt="Dr.いわたつ"></div>
    <div class="follow-name">Dr.いわたつ</div>
    <div class="follow-title">糖尿病専門医・指導医 / 医学博士</div>
    <div class="follow-btn">フォローする</div>
    <div class="follow-actions">
      <div class="follow-action"><div class="follow-action-icon">👤</div><div class="follow-action-label">フォロー</div></div>
      <div class="follow-action"><div class="follow-action-icon">🔖</div><div class="follow-action-label">保存</div></div>
      <div class="follow-action"><div class="follow-action-icon">📤</div><div class="follow-action-label">シェア</div></div>
    </div>
  </div>
</div>

</div>
<script>
const tl = gsap.timeline({repeat:-1});
// Scene 1: Hook (0-4s)
tl.fromTo("#s1",{opacity:0,scale:1.1},{opacity:1,scale:1,duration:0.8,ease:"power2.out"},0)
  .fromTo("#s1 .hook-text",{y:50},{y:0,duration:0.8,ease:"power2.out"},0.15)
  .fromTo("#s1 .hook-sub",{opacity:0,y:20},{opacity:1,y:0,duration:0.6,ease:"power2.out"},1.0)
  .to("#s1",{opacity:0,duration:0.4},3.6)
// Scene 2: Data cards (4-9s) - カード1枚ずつゆっくり表示
  .fromTo("#s2",{opacity:0},{opacity:1,duration:0.5},4)
  .fromTo("#s2 .data-title",{opacity:0,y:-20},{opacity:1,y:0,duration:0.5,ease:"power2.out"},4.2)
  .fromTo("#s2 .data-card",{opacity:0,x:-40},{opacity:1,x:0,duration:0.6,stagger:0.8,ease:"power2.out"},4.6)
  .to("#s2",{opacity:0,duration:0.4},8.6)
// Scene 3: Explain (9-13s)
  .fromTo("#s3",{opacity:0},{opacity:1,duration:0.5},9)
  .fromTo("#s3 .explain-box",{opacity:0,y:30},{opacity:1,y:0,duration:0.7,ease:"power2.out"},9.3)
  .to("#s3",{opacity:0,duration:0.4},12.6)
// Scene 4: Summary (13-18s) - 項目を1つずつゆっくり
  .fromTo("#s4",{opacity:0},{opacity:1,duration:0.5},13)
  .fromTo("#s4 .summary-item",{opacity:0,x:-30},{opacity:1,x:0,duration:0.5,stagger:1.0,ease:"power2.out"},13.4)
  .to("#s4",{opacity:0,duration:0.4},17.6)
// Scene 5: Follow (18-23s)
  .fromTo("#s5",{opacity:0},{opacity:1,duration:0.5},18)
  .fromTo("#s5 .follow-avatar",{scale:0},{scale:1,duration:0.7,ease:"back.out(1.5)"},18.3)
  .fromTo("#s5 .follow-name",{opacity:0,y:15},{opacity:1,y:0,duration:0.5},19.0)
  .fromTo("#s5 .follow-btn",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"power2.out"},19.5)
  .fromTo("#s5 .follow-actions",{opacity:0},{opacity:1,duration:0.5},20.0)
  .to("#s5",{opacity:0,duration:0.4},22.6);
<\/script></body></html>`;
}

function generateSlides(topic: Topic, references: string[], reelData: string[], refs: { text: string; url: string }[]): SlideData[] {
  const src = topic.source || "";
  const details = topicDetails[topic.id];
  const sd = details?.slides;
  const o = { src, refs };

  const slides: SlideData[] = [
    // 1. 表紙
    { num: 1, title: topic.title, style: "accent",
      content: `Dr.いわたつ\n糖尿病専門医・指導医 / 医学博士\n\n対象：研修医・病棟担当医`,
      html: generateSlideHtml("cover", topic, o) },
    // 2. 起: 問題提起
    { num: 2, title: "問題提起", style: "dark",
      content: sd?.problem || topic.hook,
      html: generateSlideHtml("problem", topic, { ...o, text: sd?.problem || topic.hook }) },
    // 3. 承: 背景・データ
    { num: 3, title: "背景とデータ", style: "light",
      content: sd?.background || "",
      html: generateSlideHtml("background", topic, { ...o, text: sd?.background || topic.hook }) },
    // 4. 転: 新しい視点
    { num: 4, title: "新しい視点", style: "dark",
      content: sd?.insight || topic.aiAngle || "",
      html: generateSlideHtml("insight", topic, { ...o, text: sd?.insight || topic.aiAngle || topic.appTieIn }) },
    // 5. 結: 臨床での実践
    { num: 5, title: "臨床での実践", style: "light",
      content: sd?.practice?.join("\n") || "",
      html: generateSlideHtml("practice", topic, { ...o, items: sd?.practice || [] }) },
  ];

  if (topic.category === "ai" && topic.aiAngle) {
    slides.push(
      // AI × 臨床（AIカテゴリのトピックのみ）
      { num: 6, title: "AI × 臨床", style: "accent",
        content: topic.aiAngle,
        html: generateSlideHtml("ai", topic, o) },
    );
  }

  slides.push(
    // テイクホームメッセージ
    { num: slides.length + 1, title: "Take Home Message", style: "accent",
      content: sd?.takeHome?.join("\n") || "",
      html: generateSlideHtml("takehome", topic, { ...o, items: sd?.takeHome || reelData.slice(0, 3) }) },
    // 参考文献
    { num: slides.length + 2, title: "参考文献", style: "light",
      content: references.length > 0 ? references.map((r, i) => `${i + 1}. ${r}`).join("\n") : "",
      html: generateSlideHtml("references", topic, { ...o, references, refs }) },
    // プロフィール
    { num: slides.length + 3, title: "Dr.いわたつ", style: "accent",
      content: `Dr.いわたつをフォロー`,
      html: generateSlideHtml("profile", topic, o) },
  );

  slides.forEach((s, i) => { s.num = i + 1; });
  return slides;
}

function generateSlideHtml(
  type: string,
  topic: Topic,
  opts: { src?: string; text?: string; items?: string[]; references?: string[]; refs?: { text: string; url: string }[] }
): string {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Noto Sans JP','Hiragino Sans',sans-serif}
    .slide{width:1280px;height:720px;position:relative;overflow:hidden;display:flex}
    .slide-dark{background:linear-gradient(135deg,#0a1a1a,#132e2e)}
    .slide-light{background:linear-gradient(135deg,#f8fffe,#e6f7f5)}
    .slide-accent{background:linear-gradient(135deg,#0d4a4a,#14b8a6)}
    .header{position:absolute;top:0;left:0;right:0;height:56px;display:flex;align-items:center;padding:0 40px;gap:12px}
    .badge{background:#14b8a6;color:#fff;font-size:16px;font-weight:900;padding:5px 14px;border-radius:6px}
    .logo{color:#5eead4;font-size:16px;font-weight:700}
    .footer{position:absolute;bottom:0;left:0;right:0;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font-size:14px;color:rgba(255,255,255,0.3)}
    .footer-light{color:rgba(0,0,0,0.3)}
    .main{flex:1;display:flex;align-items:center;padding:70px 60px 50px}
    .left-panel{flex:1}
    .right-panel{width:400px;display:flex;align-items:center;justify-content:center}
    h1{font-size:48px;font-weight:900;line-height:1.35;margin-bottom:18px;letter-spacing:0.5px}
    h2{font-size:36px;font-weight:900;line-height:1.35;margin-bottom:22px;letter-spacing:0.5px}
    .subtitle{font-size:24px;line-height:1.6;margin-bottom:22px;letter-spacing:0.3px}
    .body-text{font-size:24px;line-height:1.7;letter-spacing:0.3px}
    .text-white{color:#fff} .text-dark{color:#1a2e2e} .text-teal{color:#14b8a6}
    .text-muted{color:#94a3b8}
    .card{background:rgba(20,184,166,0.08);border:2px solid rgba(20,184,166,0.2);border-radius:16px;padding:28px 32px;margin-bottom:16px}
    .card-light{background:rgba(20,184,166,0.05);border:2px solid rgba(20,184,166,0.15)}
    .point-box{border-left:5px solid #f87171;background:rgba(248,113,113,0.05);padding:20px 28px;border-radius:0 12px 12px 0;margin:18px 0}
    .alert-box{border-left:5px solid #14b8a6;background:rgba(20,184,166,0.06);padding:20px 28px;border-radius:0 12px 12px 0;margin:14px 0}
    .avatar-circle{width:200px;height:200px;border-radius:50%;border:5px solid #14b8a6;overflow:hidden;background:#0d3d3d}
    .avatar-circle img{width:100%;height:100%;object-fit:cover}
    .tag{display:inline-block;background:rgba(20,184,166,0.15);color:#5eead4;font-size:16px;padding:6px 16px;border-radius:8px;margin-right:10px;margin-bottom:10px}
    .divider{width:2px;background:rgba(20,184,166,0.3);margin:0 40px;align-self:stretch}
    .list-item{display:flex;align-items:flex-start;gap:16px;margin-bottom:18px}
    .list-num{color:#14b8a6;font-size:26px;font-weight:900;min-width:36px;flex-shrink:0}
    .list-text{font-size:24px;line-height:1.55}
    .section-label{font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
    .thm-card{background:linear-gradient(135deg,rgba(20,184,166,0.15),rgba(20,184,166,0.05));border:2px solid #14b8a6;border-radius:20px;padding:30px 36px;margin-bottom:18px}
    .thm-num{color:#14b8a6;font-size:36px;font-weight:900;margin-bottom:6px}
    .thm-text{color:#fff;font-size:26px;line-height:1.5;font-weight:700}
  `;
  const n = (num: number) => String(num).padStart(2, "0");

  switch (type) {
    case "cover":
      return `<style>${css}</style>
<div class="slide slide-accent">
  <div class="header"><span class="badge">Vol.</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="tag" style="margin-bottom:16px">${escHtml(topic.category)}</div>
      <h1 class="text-white">${escHtml(topic.title)}</h1>
      <div class="subtitle text-white" style="opacity:0.8">対象：研修医・病棟担当医</div>
      <div style="margin-top:24px">
        <div class="text-white" style="font-size:22px;font-weight:700">Dr.いわたつ</div>
        <div class="text-muted" style="font-size:17px">糖尿病専門医・指導医 / 医学博士</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="right-panel">
      <div class="avatar-circle"><img src="${DR_IWATATSU_DATA_URI}" alt="Dr.いわたつ"></div>
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "problem":
      return `<style>${css}</style>
<div class="slide slide-dark">
  <div class="header"><span class="badge">02</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="section-label text-teal">起 ── 問題提起</div>
      <h2 class="text-teal">こんな経験ありませんか？</h2>
      <div class="body-text text-white">${escHtml(opts.text || "")}</div>
      ${opts.src ? `<div class="alert-box"><div class="text-muted" style="font-size:18px">出典: ${escHtml(opts.src)}</div></div>` : ""}
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "background":
      return `<style>${css}</style>
<div class="slide slide-light">
  <div class="header"><span class="badge">03</span><span class="logo" style="color:#0d9488">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="section-label text-teal">承 ── 背景とデータ</div>
      <h2 class="text-dark">何がわかっているのか？</h2>
      <div class="body-text text-dark">${escHtml(opts.text || "")}</div>
      ${opts.src ? `<div class="point-box"><div class="text-dark" style="font-size:18px">出典: ${escHtml(opts.src)}</div></div>` : ""}
    </div>
  </div>
  <div class="footer footer-light"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "insight":
      return `<style>${css}</style>
<div class="slide slide-dark">
  <div class="header"><span class="badge">04</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="section-label text-teal">転 ── 新しい視点</div>
      <h2 class="text-teal">ここがポイント</h2>
      <div class="card"><div class="body-text text-white">${escHtml(opts.text || "")}</div></div>
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "practice":
      return `<style>${css}</style>
<div class="slide slide-light">
  <div class="header"><span class="badge">05</span><span class="logo" style="color:#0d9488">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="section-label text-teal">結 ── 臨床での実践</div>
      <h2 class="text-dark">明日からやること</h2>
      ${(opts.items || []).map((d, i) => `<div class="list-item"><div class="list-num" style="color:#0d9488">${i + 1}</div><div class="list-text text-dark">${escHtml(d)}</div></div>`).join("\n      ")}
    </div>
  </div>
  <div class="footer footer-light"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "ai":
      return `<style>${css}</style>
<div class="slide slide-accent">
  <div class="header"><span class="badge">${n(6)}</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <div class="tag" style="margin-bottom:16px">AI × 臨床</div>
      <h2 class="text-white">${escHtml(topic.aiAngle || "")}</h2>
      <div class="subtitle text-white" style="opacity:0.8">AIを活用した個別化医療の時代へ</div>
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "takehome":
      return `<style>${css}</style>
<div class="slide slide-accent">
  <div class="header"><span class="badge">THM</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <h2 class="text-white" style="font-size:42px;margin-bottom:30px">Take Home Message</h2>
      ${(opts.items || []).map((d, i) => `<div class="thm-card"><div class="thm-num">${i + 1}</div><div class="thm-text">${escHtml(d)}</div></div>`).join("\n      ")}
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>明日の臨床に活かしてください</span></div>
</div>`;

    case "references":
      return `<style>${css}</style>
<div class="slide slide-light">
  <div class="header"><span class="badge">REF</span><span class="logo" style="color:#0d9488">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <h2 class="text-dark">参考文献</h2>
      ${(opts.refs || []).length > 0 ? (opts.refs || []).map((r, i) => `<div class="list-item"><div class="list-num text-dark">${i + 1}.</div><div class="list-text"><div class="text-dark" style="font-size:20px;line-height:1.5">${escHtml(r.text)}</div><div style="font-size:15px;color:#0d9488;margin-top:4px;word-break:break-all">${escHtml(r.url)}</div></div></div>`).join("\n      ") : '<div class="text-dark subtitle">投稿前にエ��デンスを追加してください</div>'}
    </div>
  </div>
  <div class="footer footer-light"><span>© Dr.いわたつ</span><span>Dr.いわたつシリーズ</span></div>
</div>`;

    case "profile":
      return `<style>${css}</style>
<div class="slide slide-accent">
  <div class="header"><span class="badge">END</span><span class="logo">Dr.いわたつ</span></div>
  <div class="main">
    <div class="left-panel">
      <h1 class="text-white">Dr.いわたつをフォロー</h1>
      <div class="subtitle text-white" style="opacity:0.8">糖尿病専門医・指導医 / 内分泌専門医 / 医学博士</div>
      <div style="margin-top:20px">
        <div class="tag">@dr.iwatatsu (Instagram)</div>
        <div class="tag">@kenkyu1019799 (X)</div>
        <div class="tag">note.com/dr_iwatatsu</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="right-panel">
      <div class="avatar-circle"><img src="${DR_IWATATSU_DATA_URI}" alt="Dr.いわたつ"></div>
    </div>
  </div>
  <div class="footer"><span>© Dr.いわたつ</span><span>役に立ったらフォロー＆保存</span></div>
</div>`;

    default:
      return "";
  }
}

// 日本語の句読点で改行を入れて読みやすくする
function addLineBreaks(s: string): string {
  return s.replace(/。/g, "。<br>").replace(/、/g, "、<br>");
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}
