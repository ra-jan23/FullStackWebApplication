/**
 * Multi-provider LLM API wrapper
 * Primary: routeway.ai (GLM 4.5 Air Free) - fast when available
 * Fallback: OpenRouter (nvidia nemotron) - reliable backup
 * Automatic failover with smart retry logic
 */

import OpenAI from 'openai';

// ============ Provider Clients ============

let _primaryClient: OpenAI | null = null;
let _fallbackClient: OpenAI | null = null;

function getPrimaryClient(): OpenAI {
  if (_primaryClient) return _primaryClient;

  const apiKey = process.env.GLM_API_KEY || '';
  const baseURL = process.env.GLM_API_URL || 'https://api.routeway.ai/v1';

  if (!apiKey) {
    throw new Error('GLM_API_KEY is not configured.');
  }

  _primaryClient = new OpenAI({
    baseURL,
    apiKey,
    timeout: 15000, // 15s timeout (fail fast, switch to fallback)
    maxRetries: 0,
  });

  return _primaryClient;
}

function getFallbackClient(): OpenAI | null {
  if (_fallbackClient) return _fallbackClient;

  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const baseURL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) return null;

  _fallbackClient = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://pitchvision.app',
      'X-OpenRouter-Title': 'PitchVision',
    },
    timeout: 45000, // 45s timeout (nemotron is slower)
    maxRetries: 0,
  });

  return _fallbackClient;
}

function getPrimaryModel(): string {
  return process.env.GLM_MODEL || 'glm-4.5-air:free';
}

function getFallbackModel(): string {
  return process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
}

function hasFallback(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
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

// ============ Core Function ============

async function callProvider(
  client: OpenAI,
  model: string,
  messages: { role: string; content: string }[],
  options: { temperature?: number; maxTokens?: number; topP?: number },
  providerName: string
): Promise<GLMResponseContent> {
  console.log(`[LLM] Calling ${providerName} with model ${model}...`);

  const completion = await client.chat.completions.create({
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    top_p: options.topP ?? 0.9,
  });

  const choice = completion.choices?.[0];
  if (!choice || !choice.message) {
    throw new Error(`No response from ${providerName} (empty choices)`);
  }

  return {
    content: choice.message.content || '',
    model: completion.model,
    provider: providerName,
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
 * Check if an error is retryable (transient, might work on retry)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  const status = error?.status || error?.statusCode || error?.code;
  // 429 = rate limit, 502/503/504 = server errors, timeouts
  return [429, 502, 503, 504].includes(Number(status)) ||
    error?.message?.includes('rate') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('ETIMEDOUT') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('Provider error');
}

/**
 * Main completion function with automatic failover
 */
export async function glmChatCompletion(
  messages: GLMMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }
): Promise<GLMResponseContent> {
  const mappedMessages = messages.map(m => ({ role: m.role, content: m.content }));
  const opts = options || {};

  // === Strategy 1: Try Primary Provider (routeway.ai) ===
  // Only try once with short timeout - fail fast to fallback
  try {
    const client = getPrimaryClient();
    const model = getPrimaryModel();
    const result = await callProvider(client, model, mappedMessages, opts, 'routeway.ai');
    console.log(`[LLM] ✅ Primary (${model}) succeeded: ${result.content.length} chars`);
    return result;
  } catch (primaryError: any) {
    const isRetryable = isRetryableError(primaryError);
    console.error(`[LLM] Primary failed: ${primaryError?.status || primaryError?.code || 'unknown'} - ${primaryError?.message || primaryError}`);

    // Only retry primary once for rate limits
    if (isRetryable) {
      try {
        console.log('[LLM] Retrying primary once after 3s...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const client = getPrimaryClient();
        const model = getPrimaryModel();
        const result = await callProvider(client, model, mappedMessages, opts, 'routeway.ai');
        console.log(`[LLM] ✅ Primary retry (${model}) succeeded: ${result.content.length} chars`);
        return result;
      } catch (retryError: any) {
        console.error(`[LLM] Primary retry also failed: ${retryError?.message || retryError}`);
      }
    }
  }

  // === Strategy 2: Try Fallback Provider (OpenRouter) ===
  if (hasFallback()) {
    console.log('[LLM] Switching to fallback provider (OpenRouter nvidia nemotron)...');
    try {
      const client = getFallbackClient();
      const model = getFallbackModel();
      const result = await callProvider(client, model, mappedMessages, opts, 'OpenRouter');
      console.log(`[LLM] ✅ Fallback (${model}) succeeded: ${result.content.length} chars`);
      return result;
    } catch (fallbackError: any) {
      console.error('[LLM] Fallback also failed:', fallbackError?.message || fallbackError);
      throw new Error(`AI providers unavailable. Primary: ${primaryError?.message || 'error'}. Fallback: ${fallbackError?.message || 'error'}`);
    }
  }

  throw new Error('AI providers unavailable. No fallback configured.');
}

/**
 * Check if at least one LLM API is configured
 */
export function isGLMConfigured(): boolean {
  return !!process.env.GLM_API_KEY || !!process.env.OPENROUTER_API_KEY;
}
