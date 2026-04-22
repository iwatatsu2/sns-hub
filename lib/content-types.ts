// content-generator.ts から型定義だけを分離（クライアントバンドル対策）

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
  html?: string;
}

export interface GeneratedResult {
  platforms: import("./posts").PlatformContent;
  reelScenes: string[];
  reelHtml: string;
  slides: SlideData[];
  slideOutline: string[];
  references: string[];
  factChecks: FactCheckItem[];
}
