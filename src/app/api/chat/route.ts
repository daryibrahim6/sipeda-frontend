import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime

export async function POST(request: Request) {
  try {
    const { messages, model } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: { message: 'OpenRouter API Key is not configured on the server.' } },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://sipeda.vercel.app',
        'X-Title': 'SIPEDA Donor Chatbot',
      },
      body: JSON.stringify({
        model: model || 'openrouter/auto',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: { message: errData?.error?.message || `HTTP Error ${response.status}` } },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: { message } },
      { status: 500 }
    );
  }
}
