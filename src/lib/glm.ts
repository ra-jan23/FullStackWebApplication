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

// ============ Retry Logic ============

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000; // 5s between retries

function isRetryableError(error: any): boolean {
  const status = error?.status || error?.statusCode || error?.code;
  return [429, 502, 503, 504].includes(Number(status));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ Core Function ============

/**
 * Call Routeway.ai chat completions (OpenAI-compatible)
 * Automatically retries on transient errors (503, 429, etc.)
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

  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[LLM] Calling Routeway.ai (${model}) — attempt ${attempt}/${MAX_RETRIES}...`);

      const completion = await client.chat.completions.create({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        top_p: options?.topP ?? 0.9,
      });

      const choice = completion.choices?.[0];
      if (!choice?.message) {
        throw new Error('No response from AI (empty choices)');
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
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.statusCode || error?.code || 'unknown';
      console.error(`[LLM] Attempt ${attempt} failed: ${status} — ${error?.message || error}`);

      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        console.log(`[LLM] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Check if at least one LLM API key is configured
 */
export function isGLMConfigured(): boolean {
  return !!process.env.Routeway_API_KEY;
}
