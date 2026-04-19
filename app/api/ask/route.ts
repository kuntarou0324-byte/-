import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `あなたは介護レクリエーションの専門家です。日本のデイサービス（通所介護事業所）の職員から、特定のレクリエーション活動についての質問を受けて、実践的で具体的なアドバイスを返してください。

原則:
- 回答は日本語で、親しみやすく具体的に
- 安全配慮 (転倒・誤嚥・運動負荷) を常に意識する
- 実例や声かけ例は箇条書きで複数示す
- マークダウンの見出し (##) や太字 (**) を使って読みやすく
- 長すぎず、要点を押さえた分量 (200〜400字程度) を目安に`;

type AskRequest = {
  activity: Record<string, unknown>;
  messages: { role: "user" | "assistant"; content: string }[];
};

function buildContextText(activity: Record<string, unknown>): string {
  return `## 対象のレクリエーション活動
\`\`\`json
${JSON.stringify(activity, null, 2)}
\`\`\`

上記の活動について、以下の質問に答えてください。`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  let body: AskRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.activity || !body.messages || body.messages.length === 0) {
    return NextResponse.json(
      { error: "activity と messages は必須です" },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const contextText = buildContextText(body.activity);
  const firstUserMessage = body.messages[0];
  const contents = body.messages.map((m, i) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [
      {
        text:
          i === 0 && m.role === "user"
            ? `${contextText}\n\n質問: ${m.content}`
            : m.content,
      },
    ],
  }));

  // Guard: ensure we start with a user message
  if (firstUserMessage.role !== "user") {
    return NextResponse.json(
      { error: "最初のメッセージは user である必要があります" },
      { status: 400 },
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const text = response.text ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "AI応答が空でした" },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/quota|rate/i.test(message)) {
      return NextResponse.json(
        { error: "リクエストが集中しています。少し待ってから再試行してください。" },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
