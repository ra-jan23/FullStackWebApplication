/**
 * LLM API wrapper using z-ai-web-dev-sdk
 * No external API keys needed — the SDK handles authentication internally.
 */

import ZAI from 'z-ai-web-dev-sdk';

// ============ Types ============

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMResponseContent {
  content: string;
  provider: string;
}

// ============ Core Function ============

/**
 * Main completion function using z-ai-web-dev-sdk
 */
export async function glmChatCompletion(
  messages: GLMMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }
): Promise<GLMResponseContent> {
  console.log(`[LLM] Calling z-ai-web-dev-sdk with ${messages.length} messages...`);

  const zai = await ZAI.create();

  // SDK expects 'assistant' role for system prompts
  const sdkMessages = messages.map(m => {
    if (m.role === 'system') {
      return { role: 'assistant' as const, content: m.content };
    }
    return { role: m.role as 'user' | 'assistant', content: m.content };
  });

  const completion = await zai.chat.completions.create({
    messages: sdkMessages,
    thinking: { type: 'disabled' },
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
    top_p: options?.topP ?? 0.9,
  });

  const response = completion.choices?.[0]?.message?.content;
  if (!response || response.trim().length === 0) {
    throw new Error('Empty response from AI model');
  }

  console.log(`[LLM] ✅ Response received: ${response.length} chars`);
  return {
    content: response,
    provider: 'z-ai-web-dev-sdk',
  };
}

/**
 * Check if LLM is available (z-ai-web-dev-sdk is always available)
 */
export function isGLMConfigured(): boolean {
  return true;
}
