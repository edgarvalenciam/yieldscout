import { NextRequest, NextResponse } from "next/server";
import type { FeedbackData } from "@/types";

function isFeedbackData(body: unknown): body is FeedbackData {
  if (body === null || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  const understood = o.understoodRisk;
  const changed = o.changedMind;
  const improvement = o.improvement;
  const timestamp = o.timestamp;
  return (
    (understood === "yes" || understood === "no" || understood === "somewhat") &&
    (changed === "yes" || changed === "no") &&
    typeof improvement === "string" &&
    typeof timestamp === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!isFeedbackData(body)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    console.log("FEEDBACK:", JSON.stringify(body));

    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
