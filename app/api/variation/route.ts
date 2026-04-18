import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `あなたは介護レクリエーションの専門家です。日本のデイサービス（通所介護事業所）で高齢者向けに行う高齢者レクリエーションを考案します。

## 対象者の特徴
- 主に65歳以上の高齢者
- 身体機能・認知機能に個人差が大きい
- 座位で参加できる活動が中心
- 誤嚥・転倒・熱中症などのリスクに配慮が必要

## 考案の原則
安全第一、成功体験、交流促進、季節感、身近さ、段階的な難易度調整、少ない準備物。

## このリクエストについて
ユーザーから既存の活動案が提示されます。その活動の「ねらい・対象者層・難易度感」は踏襲しつつ、題材・進め方・使う道具を変えたバリエーションを1つだけ考えてください。元と同じ活動を出してはいけません。単なる易化/難化ではなく、新鮮で実施する価値のある別案にしてください。`;

type VariationRequest = {
  original: Record<string, unknown>;
  form?: {
    participants?: string;
    level?: string;
    duration?: string;
    goal?: string;
    season?: string;
    materials?: string;
    avoid?: string;
  };
  avoidTitles?: string[];
};

function buildUserPrompt(input: VariationRequest): string {
  const lines: string[] = [
    "次の活動のバリエーションを1つ考えてください。",
    "",
    "## 元の活動",
    "```json",
    JSON.stringify(input.original, null, 2),
    "```",
    "",
  ];
  if (input.form) {
    lines.push("## 活動の前提条件");
    const f = input.form;
    if (f.participants) lines.push(`- 参加人数: ${f.participants}`);
    if (f.level) lines.push(`- 身体機能レベル: ${f.level}`);
    if (f.duration) lines.push(`- 所要時間: ${f.duration}`);
    if (f.goal) lines.push(`- 目的: ${f.goal}`);
    if (f.season) lines.push(`- 季節・行事: ${f.season}`);
    if (f.materials) lines.push(`- 利用可能な道具: ${f.materials}`);
    if (f.avoid) lines.push(`- 避けたい活動: ${f.avoid}`);
  }
  if (input.avoidTitles && input.avoidTitles.length > 0) {
    lines.push("");
    lines.push("## 以下のタイトルとは別の活動にしてください:");
    input.avoidTitles.slice(0, 30).forEach((t) => lines.push(`- ${t}`));
  }
  lines.push("");
  lines.push("day_label は空文字列にしてください。");
  return lines.join("\n");
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    activity: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        category: { type: Type.STRING },
        duration: { type: Type.STRING },
        goal: { type: Type.STRING },
        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        difficulty_adjustments: {
          type: Type.OBJECT,
          properties: {
            easier: { type: Type.STRING },
            harder: { type: Type.STRING },
          },
          required: ["easier", "harder"],
        },
        safety_notes: { type: Type.ARRAY, items: { type: Type.STRING } },
        talking_points: { type: Type.ARRAY, items: { type: Type.STRING } },
        day_label: { type: Type.STRING },
      },
      required: [
        "title",
        "category",
        "duration",
        "goal",
        "materials",
        "steps",
        "difficulty_adjustments",
        "safety_notes",
        "talking_points",
        "day_label",
      ],
    },
  },
  required: ["activity"],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  let body: VariationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.original) {
    return NextResponse.json(
      { error: "元の活動(original)が指定されていません" },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserPrompt(body),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.0,
      },
    });

    const text = response.text ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "AI応答が空でした" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(text);
    if (!parsed.activity) {
      return NextResponse.json(
        { error: "応答に activity が含まれていません" },
        { status: 502 },
      );
    }
    return NextResponse.json({ activity: parsed.activity });
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
