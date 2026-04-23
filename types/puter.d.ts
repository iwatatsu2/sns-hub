/* eslint-disable @typescript-eslint/no-explicit-any */
interface PuterAI {
  txt2img(prompt: string, options?: { model?: string; quality?: string }): Promise<HTMLImageElement>;
  chat(prompt: string, options?: { model?: string }): Promise<{ message: { content: string } }>;
}

interface Puter {
  ai: PuterAI;
}

declare const puter: Puter;
