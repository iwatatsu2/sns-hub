import { TwitterApi } from "twitter-api-v2";

interface PostResult {
  ok: boolean;
  url?: string;
  error?: string;
}

// --- X (Twitter) ---
export async function postToX(text: string): Promise<PostResult> {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    return { ok: false, error: "X API credentials not configured" };
  }

  try {
    const client = new TwitterApi({
      appKey: X_API_KEY,
      appSecret: X_API_SECRET,
      accessToken: X_ACCESS_TOKEN,
      accessSecret: X_ACCESS_SECRET,
    });
    const { data } = await client.v2.tweet(text);
    return { ok: true, url: `https://x.com/dr_iwatatsu/status/${data.id}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// --- Instagram Graph API ---
export async function postToInstagram(
  caption: string,
  imageUrl: string = "https://sns-hub-five.vercel.app/dr-iwatatsu.png"
): Promise<PostResult> {
  const { INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID } = process.env;
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    return { ok: false, error: "Instagram API credentials not configured" };
  }

  const baseUrl = "https://graph.facebook.com/v21.0";
  const igId = INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = INSTAGRAM_ACCESS_TOKEN;

  try {
    // Step 1: Create media container
    const createRes = await fetch(`${baseUrl}/${igId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    });
    const createData = await createRes.json();
    if (createData.error) {
      return { ok: false, error: createData.error.message };
    }

    // Step 2: Publish
    const publishRes = await fetch(`${baseUrl}/${igId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: token,
      }),
    });
    const publishData = await publishRes.json();
    if (publishData.error) {
      return { ok: false, error: publishData.error.message };
    }

    return { ok: true, url: `https://www.instagram.com/dr_iwatatsu/` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Check if API is configured
export function isApiConfigured(platform: "x" | "instagram"): boolean {
  if (platform === "x") {
    return !!(process.env.X_API_KEY && process.env.X_ACCESS_TOKEN);
  }
  return !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
}
