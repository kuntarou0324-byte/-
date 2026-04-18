import Anthropic from "@anthropic-ai/sdk";
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

## 出力形式
以下の JSON 形式で、ちょうど3つの提案を出力してください。JSON以外の文字（説明文・markdown記法）は一切含めないでください。

{
  "activities": [
    {
      "title": "活動名（15字以内）",
      "category": "カテゴリ（体操/脳トレ/音楽/創作/季節行事/ゲーム/回想 のいずれか）",
      "duration": "所要時間（例: 約30分）",
      "goal": "ねらい（2〜3文、50〜100字）",
      "materials": ["準備物1", "準備物2"],
      "steps": ["手順1（1文）", "手順2", "手順3"],
      "difficulty_adjustments": {
        "easier": "身体機能が低い方への配慮（1〜2文）",
        "harder": "より活動的な方への工夫（1〜2文）"
      },
      "safety_notes": ["安全配慮1", "安全配慮2"],
      "talking_points": ["声かけ例や盛り上げポイント1", "2"]
    }
  ]
}

手順は3〜7ステップで、各ステップは職員がすぐ実行できる具体的な動作で書いてください。`;

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

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(body) }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI応答の解析に失敗しました", raw: text },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      activities: parsed.activities ?? [],
      usage: {
        cache_read: response.usage.cache_read_input_tokens ?? 0,
        cache_write: response.usage.cache_creation_input_tokens ?? 0,
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "リクエストが集中しています。少し待ってから再試行してください。" },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API エラー: ${error.message}` },
        { status: error.status ?? 500 },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
