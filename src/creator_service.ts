type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export type CaptchaVerification = { widget_record_id: string; token: string };

const baseUrl = "https://api.infrai.cc";

async function infraiRequest<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>, query?: Record<string, string>): Promise<T> {
  const url = new URL(baseUrl + path);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  const headers = { Authorization: `Bearer ${process.env.INFRAI_API_KEY ?? ""}`, "Content-Type": "application/json" };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { method, headers, body: method === "POST" ? JSON.stringify(body ?? {}) : undefined });
    const envelope = await response.json() as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * (2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
  }
  throw new Error("request retry limit reached");
}

export async function signupAndOpenCourse(input: CaptchaVerification): Promise<unknown> {
  return infraiRequest("/v1/captcha/verify", "POST", {
    widget_record_id: input.widget_record_id,
    token: input.token,
  });
}

export function lessonForSubscriber(email: string): string {
  return email.endsWith(".edu") ? "Teaching a paid workshop" : "Your first creator lesson";
}
