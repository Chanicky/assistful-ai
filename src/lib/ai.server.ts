const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export async function chat(system: string, user: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
  if (!res.ok) throw new Error("AI request failed. Please try again.");

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI returned an empty response.");
  return content;
}

export function stripJsonFence(text: string) {
  return text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}