/**
 * GLM 4.5 Air (Free) API wrapper
 * Uses OpenAI SDK with OpenRouter endpoint for text-based LLM completions
 * Includes built-in retry logic for rate limiting
 */

import OpenAI from 'openai';

let _openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (_openaiClient) return _openaiClient;

  const apiKey = process.env.GLM_API_KEY || '';
  const baseURL = process.env.GLM_API_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) {
    throw new Error('GLM_API_KEY is not configured. Please set it in .env file.');
  }

  _openaiClient = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://pitchvision.app',
      'X-OpenRouter-Title': 'PitchVision',
    },
    timeout: 60000, // 60s timeout for free tier
    maxRetries: 1, // Only 1 retry at SDK level (we do our own retry below)
  });

  return _openaiClient;
}

function getModel(): string {
  return process.env.GLM_MODEL || 'z-ai/glm-4.5-air:free';
}

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMResponseContent {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function glmChatCompletion(
  messages: GLMMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }
): Promise<GLMResponseContent> {
  const client = getOpenAIClient();
  const model = getModel();
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
        top_p: options?.topP ?? 0.9,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from GLM model');
      }

      return {
        content: choice.message.content || '',
        model: completion.model,
        usage: completion.usage
          ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      const status = error?.status || error?.statusCode;
      const isRateLimit = status === 429 || error?.code === 429 ||
        error?.message?.includes('429') || error?.message?.includes('rate');
      const isTimeout = error?.message?.includes('timeout') || error?.message?.includes('ETIMEDOUT') ||
        error?.message?.includes('504') || error?.code === 'ETIMEDOUT';

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = 5000 * (attempt + 1); // 5s, 10s
        console.warn(`Rate limited. Retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (isTimeout && attempt < maxRetries) {
        console.warn(`Timeout. Retrying (attempt ${attempt + 1}/${maxRetries})...`);
        // Reset client to clear connection pool
        _openaiClient = null;
        continue;
      }

      throw error;
    }
  }

  throw new Error('GLM API failed after maximum retries.');
}

/**
 * Check if GLM API is properly configured
 */
export function isGLMConfigured(): boolean {
  return !!process.env.GLM_API_KEY;
}
