/**
 * LLM API wrapper using Routeway.ai (OpenAI-compatible)
 *
 * Setup:
 *   1. Sign up at https://routeway.ai
 *   2. Go to API Keys → Create API Key
 *   3. Add to your .env file:
 *        Routeway_API_KEY=your_key_here
 *
 * Free models available: glm-4.5-air:free
 * Docs: https://docs.routeway.ai/getting-started/quickstart
 */

import OpenAI from 'openai';

// ============ Client ============

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.Routeway_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Routeway_API_KEY is not configured. ' +
      'Get a free key at https://routeway.ai → API Keys → Create API Key, ' +
      'then add it to your .env file.'
    );
  }

  _client = new OpenAI({
    baseURL: 'https://api.routeway.ai/v1',
    apiKey,
    timeout: 60000, // 60s — free tier can be slow
    maxRetries: 0,
  });

  return _client;
}

// ============ Types ============

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMResponseContent {
  content: string;
  model: string;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============ Config ============

function getModel(): string {
  return process.env.GLM_MODEL || 'glm-4.5-air:free';
}

// ============ Core Function ============

/**
 * Call Routeway.ai chat completions (OpenAI-compatible)
 */
export async function glmChatCompletion(
  messages: GLMMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }
): Promise<GLMResponseContent> {
  const client = getClient();
  const model = getModel();

  console.log(`[LLM] Calling Routeway.ai (${model}) with ${messages.length} messages...`);

  const completion = await client.chat.completions.create({
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
    top_p: options?.topP ?? 0.9,
  });

  const choice = completion.choices?.[0];
  if (!choice?.message) {
    throw new Error(`No response from Routeway.ai (empty choices)`);
  }

  console.log(`[LLM] ✅ Response received: ${(choice.message.content || '').length} chars`);

  return {
    content: choice.message.content || '',
    model: completion.model,
    provider: 'Routeway.ai',
    usage: completion.usage
      ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Check if at least one LLM API key is configured
 */
export function isGLMConfigured(): boolean {
  return !!process.env.Routeway_API_KEY;
}
