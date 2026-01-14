import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, message: "Missing N8N_WEBHOOK_URL env var." },
      { status: 500 }
    );
  }

  const body = await req.json();

  // Forward as JSON to n8n webhook (keep field labels exactly as your n8n Form Trigger expects)
  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    // If your n8n is behind auth, you can also add headers here.
  });

  const text = await upstream.text();
  const ok = upstream.ok;

  return NextResponse.json(
    { ok, status: upstream.status, upstream: text },
    { status: ok ? 200 : 502 }
  );
}
