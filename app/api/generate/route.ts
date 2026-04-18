import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `あなたは介護レクリエーションの専門家です。日本のデイサービス（通所介護事業所）で高齢者向けに行う日々のレクリエーションを考案します。

## 対象者の特徴
- 主に65歳以上の高齢者
- 身体機能・認知機能に個人差が大きい
- 座位で参加できる活動が中心
- 誤嚥・転倒・熱中症などのリスクに配慮が必要

## 考案の原則
1. **安全第一**: 転倒・誤嚥・過度な運動負荷を避ける
2. **成功体験**: 達成感が得られ、参加者が「楽しかった」と感じられる設計
3. **交流促進**: 参加者同士・職員との会話や笑顔が生まれる仕掛け
4. **季節感**: 日本の四季・年中行事（節分、ひな祭り、七夕、敬老の日、紅葉など）を取り入れる
5. **身近さ**: 昭和の流行歌、童謡、昔遊び、郷土食など回想法につながる題材を活用
6. **段階的な難易度調整**: 身体機能レベルに応じた易化・難化の具体例を必ず示す
7. **少ない準備物**: 事業所にある一般的な備品（新聞紙、ペットボトル、タオル、色画用紙、お手玉など）を優先

## 出力要件
ちょうど3つの提案を返してください。
- title: 活動名（15字以内）
- category: 体操/脳トレ/音楽/創作/季節行事/ゲーム/回想 のいずれか
- duration: 所要時間（例: 約30分）
- goal: ねらい（2〜3文、50〜100字）
- materials: 準備物の配列
- steps: 3〜7ステップ、各ステップは職員がすぐ実行できる具体的な1文
- difficulty_adjustments.easier: 身体機能が低い方への配慮（1〜2文）
- difficulty_adjustments.harder: より活動的な方への工夫（1〜2文）
- safety_notes: 安全配慮の配列
- talking_points: 声かけ例や盛り上げポイントの配列`;

type GenerateRequest = {
  participants?: string;
  level?: string;
  duration?: string;
  goal?: string;
  season?: string;
  materials?: string;
  avoid?: string;
};

function buildUserPrompt(input: GenerateRequest): string {
  const lines: string[] = ["以下の条件でレクリエーション案を3つ考えてください。"];
  if (input.participants) lines.push(`- 参加人数: ${input.participants}`);
  if (input.level) lines.push(`- 身体機能レベル: ${input.level}`);
  if (input.duration) lines.push(`- 所要時間: ${input.duration}`);
  if (input.goal) lines.push(`- 目的: ${input.goal}`);
  if (input.season) lines.push(`- 季節・行事: ${input.season}`);
  if (input.materials) lines.push(`- 利用可能な道具: ${input.materials}`);
  if (input.avoid) lines.push(`- 避けたい活動: ${input.avoid}`);
  return lines.join("\n");
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    activities: {
      type: Type.ARRAY,
      items: {
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
        ],
      },
    },
  },
  required: ["activities"],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
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
        temperature: 0.9,
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
    return NextResponse.json({
      activities: parsed.activities ?? [],
    });
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
