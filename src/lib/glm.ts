/**
 * GLM 4.5 Air (Free) API wrapper
 * Uses the routeway.ai API endpoint for text-based LLM completions
 * Includes retry logic for rate limiting (429 errors)
 */

export function getGLMConfig() {
  return {
    apiUrl: process.env.GLM_API_URL || 'https://api.routeway.ai/v1/chat/completions',
    apiKey: process.env.GLM_API_KEY || '',
    model: process.env.GLM_MODEL || 'glm-4.5-air:free',
  };
}

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface GLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GLMChoice[];
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
    maxRetries?: number;
  }
): Promise<GLMResponse> {
  const config = getGLMConfig();

  if (!config.apiKey) {
    throw new Error('GLM_API_KEY is not configured. Please set it in .env file.');
  }

  const body: Record<string, any> = {
    model: config.model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    top_p: options?.topP ?? 0.9,
  };

  const maxRetries = options?.maxRetries ?? 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Handle rate limiting (429) with retry
    if (response.status === 429 && attempt < maxRetries) {
      const waitTime = 12000 * (attempt + 1); // 12s, 24s
      console.warn(`GLM API rate limited (429). Retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GLM API error:', response.status, errorText);
      throw new Error(`GLM API error (${response.status}): ${errorText}`);
    }

    const data: GLMResponse = await response.json();
    return data;
  }

  throw new Error('GLM API rate limit exceeded after maximum retries.');
}

/**
 * Helper: Convert z-ai-web-dev-sdk style messages to GLM format
 * z-ai uses 'assistant' for system prompts, GLM uses 'system'
 */
export function toGLMMessages(
  messages: Array<{ role: string; content: string }>
): GLMMessage[] {
  return messages.map((m) => {
    let role: GLMMessage['role'];
    if (m.role === 'assistant' && messages.indexOf(m) === 0) {
      // First assistant message in z-ai SDK is typically the system prompt
      role = 'system';
    } else if (m.role === 'user' || m.role === 'assistant') {
      role = m.role;
    } else {
      role = 'user';
    }
    return { role, content: m.content };
  });
}

/**
 * Check if GLM API is properly configured
 */
export function isGLMConfigured(): boolean {
  return !!getGLMConfig().apiKey;
}
