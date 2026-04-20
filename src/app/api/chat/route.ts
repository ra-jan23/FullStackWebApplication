import { NextRequest, NextResponse } from 'next/server';
import { glmChatCompletion, isGLMConfigured } from '@/lib/glm';

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

    // Use GLM 4.5 Air for chat
    if (isGLMConfigured()) {
      const glmMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history.slice(1).map(m => ({ role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.content })),
      ];

      const completion = await glmChatCompletion(glmMessages, {
        temperature: 0.8,
        maxTokens: 1024,
      });

      const aiResponse = completion.content || 'Sorry, I could not generate a response. Please try again.';

      // Add assistant response to history
      history.push({ role: 'assistant', content: aiResponse });
      conversations.set(sid, history);

      return NextResponse.json({
        success: true,
        response: aiResponse,
        messageCount: history.length - 1,
        model: completion.model || 'GLM 4.5 Air',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'AI model not configured. Please set GLM_API_KEY in environment variables.'
    }, { status: 500 });
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
