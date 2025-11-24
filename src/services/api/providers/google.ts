/**
 * Google Gemini API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

interface GeminiContent {
  parts: Array<{
    text: string;
  }>;
  role: 'user' | 'model';
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    candidateCount?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'Google',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      apiKeyEnvVar: 'GOOGLE_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 60000,
      models: [
        // Gemini 2.5 Family
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        // Gemini 2.0 Family
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-thinking-exp',
        // Legacy 1.5
        'gemini-1.5-pro',
        'gemini-1.5-flash',
      ],
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    };
    super(config);
  }

  /**
   * Get Google-specific auth headers
   */
  protected getAuthHeaders(apiKey: string): Record<string, string> {
    // Google uses API key as query parameter, not header
    return {};
  }

  /**
   * Override makeRequest to add API key as query parameter
   */
  protected async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const apiKey = await this.getAPIKey();

    // Add API key as query parameter
    const url = new URL(`${this.config.baseURL}${endpoint}`);
    url.searchParams.append('key', apiKey);

    const headers = {
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.config.timeout || 30000);

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createAPIError(errorData, response.status);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout || 30000}ms`);
      }

      throw this.handleError(error);
    }
  }

  /**
   * Get the chat endpoint for a specific model
   */
  protected getChatEndpoint(): string {
    // Will be overridden per model
    return '';
  }

  /**
   * Get model-specific endpoint
   */
  private getModelEndpoint(modelId: string, streaming: boolean = false): string {
    const action = streaming ? 'streamGenerateContent' : 'generateContent';
    return `/models/${modelId}:${action}`;
  }

  /**
   * Convert messages to Gemini format
   */
  formatMessages(messages: Message[]): GeminiContent[] {
    const geminiMessages: GeminiContent[] = [];
    let currentRole: 'user' | 'model' | null = null;
    let currentParts: Array<{ text: string }> = [];

    for (const message of messages) {
      // Skip system messages (will be handled separately)
      if (message.role === 'system') {
        continue;
      }

      // Map assistant to model role
      const role = message.role === 'assistant' ? 'model' : 'user';

      // Gemini requires alternating user/model messages
      if (role === currentRole) {
        // Combine consecutive messages from the same role
        currentParts.push({ text: message.content });
      } else {
        // Save previous message if exists
        if (currentRole !== null && currentParts.length > 0) {
          geminiMessages.push({
            role: currentRole,
            parts: currentParts,
          });
        }

        // Start new message
        currentRole = role;
        currentParts = [{ text: message.content }];
      }
    }

    // Add the last message
    if (currentRole !== null && currentParts.length > 0) {
      geminiMessages.push({
        role: currentRole,
        parts: currentParts,
      });
    }

    // Ensure first message is from user (Gemini requirement)
    if (geminiMessages.length > 0 && geminiMessages[0].role !== 'user') {
      geminiMessages.unshift({
        role: 'user',
        parts: [{ text: 'Continue the conversation.' }],
      });
    }

    // Ensure alternating pattern
    const fixedMessages: GeminiContent[] = [];
    let lastRole: 'user' | 'model' | null = null;

    for (const msg of geminiMessages) {
      if (msg.role === lastRole) {
        // Insert a minimal message to maintain alternation
        const bridgeRole = lastRole === 'user' ? 'model' : 'user';
        fixedMessages.push({
          role: bridgeRole,
          parts: [{ text: '...' }],
        });
      }
      fixedMessages.push(msg);
      lastRole = msg.role;
    }

    return fixedMessages;
  }

  /**
   * Extract system instruction from messages
   */
  private extractSystemInstruction(messages: Message[]): { parts: Array<{ text: string }> } | undefined {
    const systemMessages = messages.filter(m => m.role === 'system');
    if (systemMessages.length > 0) {
      return {
        parts: systemMessages.map(m => ({ text: m.content })),
      };
    }
    return undefined;
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    const geminiMessages = this.formatMessages(messages);
    const systemInstruction = this.extractSystemInstruction(messages);

    const request: GeminiRequest = {
      contents: geminiMessages,
      generationConfig: {
        temperature: options?.temperature,
        topP: options?.top_p,
        topK: options?.top_k,
        maxOutputTokens: options?.max_tokens || 8192,
        candidateCount: 1,
      },
      ...(systemInstruction && { systemInstruction }),
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    const endpoint = this.getModelEndpoint(model.id);
    const response = await this.withRetry(() =>
      this.makeRequest<GeminiResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(request),
      })
    );

    return this.convertToOpenAIFormat(response, model.id);
  }

  /**
   * Stream chat completion
   * React Native compatible implementation
   */
  async *createStreamingChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): AsyncGenerator<string, void, unknown> {
    // React Native doesn't support response.body.getReader()
    // Use non-streaming API and simulate streaming
    const response = await this.createChatCompletion(messages, model, options);
    const fullText = response.choices[0]?.message?.content || '';

    if (!fullText) {
      return;
    }

    // Simulate streaming by yielding chunks of text
    const chunkSize = 10; // Characters per chunk
    for (let i = 0; i < fullText.length; i += chunkSize) {
      yield fullText.slice(i, Math.min(i + chunkSize, fullText.length));
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  /**
   * Convert Gemini response to OpenAI format
   */
  private convertToOpenAIFormat(
    response: GeminiResponse,
    model: string
  ): ChatCompletionResponse {
    const candidate = response.candidates?.[0];
    const content = candidate?.content?.parts
      ?.map(part => part.text)
      .join('') || '';

    return {
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: content,
          },
          finish_reason: candidate?.finishReason?.toLowerCase() || 'stop',
        },
      ],
      usage: {
        prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
        completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: response.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple request to list models
      const apiKey = await this.getAPIKey();
      const url = new URL(`${this.config.baseURL}/models`);
      url.searchParams.append('key', apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data && data.models && Array.isArray(data.models);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Handle Google-specific errors
   */
  handleError(error: any): any {
    const errorMessage = error?.error?.message || error?.message;
    const errorCode = error?.error?.code;

    if (errorCode === 400) {
      return {
        error: {
          message: errorMessage || 'Invalid request to Google API',
          type: 'invalid_request',
          code: 'invalid_request',
        },
        status: 400,
      };
    }

    if (errorCode === 401 || errorCode === 403) {
      return {
        error: {
          message: 'Invalid Google API key or insufficient permissions',
          type: 'authentication',
          code: 'auth_error',
        },
        status: 401,
      };
    }

    if (errorCode === 429) {
      return {
        error: {
          message: 'Google API rate limit exceeded. Please try again later.',
          type: 'rate_limit',
          code: 'rate_limit',
        },
        status: 429,
      };
    }

    if (errorCode === 503) {
      return {
        error: {
          message: 'Google API service temporarily unavailable',
          type: 'service_unavailable',
          code: 'service_unavailable',
        },
        status: 503,
      };
    }

    return super.handleError(error);
  }

  /**
   * Get model-specific defaults
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // Pro models - highest capability
    if (modelId.includes('pro')) {
      return {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        top_k: 40,
      };
    }

    // Flash models - balanced speed and quality
    if (modelId.includes('flash')) {
      return {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        top_k: 40,
      };
    }

    // Flash-lite models - optimized for speed
    if (modelId.includes('flash-lite')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        top_k: 32,
      };
    }

    // Thinking models - reasoning focused
    if (modelId.includes('thinking')) {
      return {
        temperature: 0.5,
        max_tokens: 32768,
        top_p: 0.9,
        top_k: 40,
      };
    }

    // Default settings
    return {
      temperature: 0.7,
      max_tokens: 8192,
      top_p: 0.95,
      top_k: 40,
    };
  }
}