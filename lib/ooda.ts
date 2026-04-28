import oodaData from "@/data/ooda.json";

/* ---------- 型定義 ---------- */
export interface BrandProfile {
  name: string;
  tagline: string;
  platforms: string[];
  apps: string[];
  target: { primary: string; secondary: string };
  strengths: string[];
  contentRatio: string;
  weeklyRoutine: string;
}

export interface OodaEntry {
  date: string;
  observe: string[];
  orient: string[];
  decide: string[];
  act: string[];
}

export interface OodaGuidelines {
  toneOfVoice: string;
  mustInclude: string;
  mustAvoid: string[];
  appTieIn: string;
  hotTopics: string[];
}

export interface OodaData {
  brandProfile: BrandProfile;
  latest: OodaEntry;
  guidelines: OodaGuidelines;
}

/* ---------- データ取得 ---------- */
export function getOodaData(): OodaData {
  return oodaData as OodaData;
}

export function getBrandProfile(): BrandProfile {
  return oodaData.brandProfile as BrandProfile;
}

export function getLatestOoda(): OodaEntry {
  return oodaData.latest as OodaEntry;
}

export function getGuidelines(): OodaGuidelines {
  return oodaData.guidelines as OodaGuidelines;
}

/** コンテンツ生成時に使うブランド情報のサマリー */
export function getBrandContext(): {
  tagline: string;
  appTieIn: string;
  hotTopics: string[];
  mustAvoid: string[];
  toneOfVoice: string;
} {
  const brand = oodaData.brandProfile;
  const guidelines = oodaData.guidelines;
  return {
    tagline: `${brand.name}｜${brand.tagline}`,
    appTieIn: guidelines.appTieIn,
    hotTopics: guidelines.hotTopics,
    mustAvoid: guidelines.mustAvoid,
    toneOfVoice: guidelines.toneOfVoice,
  };
}

/** トピックがOODAのホットトピックに該当するか判定 */
export function isHotTopic(title: string): boolean {
  const hot = oodaData.guidelines.hotTopics;
  return hot.some(t => title.includes(t) || t.includes(title.slice(0, 6)));
}

/** OODAのobserveからトピックに関連するトレンド情報を取得 */
export function getRelatedTrends(title: string): string[] {
  const keywords = title.split(/[　 ・/｜|]/).filter(k => k.length >= 2);
  return (oodaData.latest as OodaEntry).observe.filter(obs =>
    keywords.some(kw => obs.includes(kw))
  );
}
