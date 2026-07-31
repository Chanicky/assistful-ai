import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chat, htmlToText, stripJsonFence } from "./ai.server";

export type Analysis = {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  actionItems: string[];
};

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        recipient: z.string().min(1),
        subject: z.string().min(1),
        purpose: z.string().min(1),
        keyPoints: z.string().optional().default(""),
        tone: z.string().optional().default("Formal"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const text = await chat(
      "You are an expert workplace communication assistant. Write clear, professional business emails. Return only the email body text, including a subject line at the top formatted as 'Subject: ...', a greeting, well-structured paragraphs, and a sign-off. No markdown fences, no commentary.",
      `Recipient: ${data.recipient}\nSubject: ${data.subject}\nPurpose: ${data.purpose}\nKey points:\n${data.keyPoints || "(none provided)"}\nTone: ${data.tone}`,
    );
    return { content: text };
  });

export const analyzeContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ content: z.string().min(20), label: z.string().optional().default("Document") }).parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat(
      'You are a senior research analyst. Analyse the provided material and respond with ONLY valid JSON matching: {"summary": string, "keyInsights": string[], "recommendations": string[], "actionItems": string[]}. The summary is 3-5 sentences. Each array has 3-6 concise, specific items. No markdown fences.',
      `Source: ${data.label}\n\n${data.content.slice(0, 60000)}`,
    );
    const parsed = JSON.parse(stripJsonFence(raw)) as Analysis;
    return {
      summary: String(parsed.summary ?? ""),
      keyInsights: (parsed.keyInsights ?? []).map(String),
      recommendations: (parsed.recommendations ?? []).map(String),
      actionItems: (parsed.actionItems ?? []).map(String),
    } satisfies Analysis;
  });

export const fetchUrlContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const res = await fetch(data.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResearchAssistant/1.0)" },
    });
    if (!res.ok) throw new Error("Could not fetch that URL.");
    const html = await res.text();
    const text = htmlToText(html);
    if (text.length < 40) throw new Error("No readable content found at that URL.");
    return { content: text.slice(0, 60000) };
  });