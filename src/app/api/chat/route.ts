import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const conversations = new Map<string, { role: string; content: string }[]>();

const SYSTEM_PROMPT = `You are PitchVision AI, a knowledgeable and friendly football expert assistant. You have deep knowledge of:
- Football tactics, formations, and strategies
- Premier League, La Liga, Serie A, Bundesliga, and other major leagues
- Player statistics, transfers, and history
- Match analysis and predictions
- Football rules and regulations
- World Cup, Champions League, and international football
- Football culture, rivalries, and fan traditions

Be concise but informative. Use football terminology accurately. If asked about non-football topics, politely redirect to football. Always be enthusiastic and passionate about the beautiful game. Format responses with clear paragraphs and bullet points when listing multiple items.`;

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sid = sessionId || 'default';

    // Get or create conversation history
    let history = conversations.get(sid) || [
      { role: 'assistant', content: SYSTEM_PROMPT }
    ];

    // Add user message
    history.push({ role: 'user', content: message });

    // Trim old messages to keep context manageable (keep system + last 20 messages)
    if (history.length > 22) {
      history = [history[0], ...history.slice(-20)];
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: history.map(m => ({ role: m.role as 'assistant' | 'user', content: m.content })),
      thinking: { type: 'disabled' }
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

    // Add assistant response to history
    history.push({ role: 'assistant', content: aiResponse });
    conversations.set(sid, history);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageCount: history.length - 1
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate response'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'default';
  conversations.delete(sessionId);
  return NextResponse.json({ success: true, message: 'Conversation cleared' });
}
