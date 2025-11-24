/**
 * DeepSeek API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

export class DeepSeekProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'DeepSeek',
      baseURL: 'https://api.deepseek.com',
      apiKeyEnvVar: 'DEEPSEEK_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 120000, // 2 minutes for reasoning models
      models: [
        'deepseek-chat',
        'deepseek-reasoner',
        'deepseek-v3.2',
        'deepseek-v3.1',
        'deepseek-v3',
        'deepseek-v2.5',
      ],
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    };
    super(config);
  }

  /**
   * Get DeepSeek-specific auth headers
   */
  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  /**
   * Get the chat completion endpoint
   */
  protected getChatEndpoint(): string {
    return '/v1/chat/completions';
  }

  /**
   * Format messages for DeepSeek's format (OpenAI-compatible)
   */
  formatMessages(messages: Message[]): Message[] {
    // DeepSeek uses OpenAI's format
    return messages.filter(m => m.content).map(message => ({
      role: message.role,
      content: message.content,
      ...(message.name && { name: message.name }),
    }));
  }

  /**
   * Override for reasoning models which may have special requirements
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    // DeepSeek Reasoner models may need special handling
    if (model.id === 'deepseek-reasoner') {
      const reasonerOptions = {
        ...options,
        // Reasoner models typically need more tokens and lower temperature
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 16384,
        // Enable reasoning mode if supported
        reasoning_mode: true,
      };
      return super.createChatCompletion(messages, model, reasonerOptions);
    }

    // DeepSeek V3+ models with enhanced capabilities
    if (model.id.startsWith('deepseek-v3')) {
      const v3Options = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 8192,
      };
      return super.createChatCompletion(messages, model, v3Options);
    }

    return super.createChatCompletion(messages, model, options);
  }

  /**
   * Override streaming for DeepSeek's format
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
   * Test connection with a simple request
   */
  async testConnection(): Promise<boolean> {
    try {
      // DeepSeek uses OpenAI-compatible endpoints
      const response = await this.makeRequest('/v1/models');
      return response && response.data && Array.isArray(response.data);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Handle DeepSeek-specific errors
   */
  handleError(error: any): any {
    const errorCode = error?.error?.code;
    const errorType = error?.error?.type;

    // Rate limiting
    if (errorCode === 'rate_limit_exceeded' || error.status === 429) {
      return {
        error: {
          message: 'DeepSeek rate limit exceeded. Please try again later.',
          type: 'rate_limit',
          code: errorCode || 'rate_limit_exceeded',
        },
        status: 429,
      };
    }

    // Invalid request
    if (errorCode === 'invalid_request_error' || error.status === 400) {
      return {
        error: {
          message: error?.error?.message || 'Invalid request to DeepSeek API',
          type: 'invalid_request',
          code: errorCode || 'invalid_request',
        },
        status: 400,
      };
    }

    // Authentication error
    if (errorCode === 'authentication_error' || error.status === 401) {
      return {
        error: {
          message: 'Invalid DeepSeek API key',
          type: 'authentication',
          code: errorCode || 'auth_error',
        },
        status: 401,
      };
    }

    // Model not found
    if (errorCode === 'model_not_found' || error.status === 404) {
      return {
        error: {
          message: `DeepSeek model not found: ${error?.error?.param || 'unknown'}`,
          type: 'model_not_found',
          code: errorCode || 'model_not_found',
        },
        status: 404,
      };
    }

    // Context length exceeded
    if (errorType === 'context_length_exceeded') {
      return {
        error: {
          message: 'The conversation is too long for this DeepSeek model. Please start a new conversation.',
          type: 'context_length',
          code: 'context_length_exceeded',
        },
        status: 400,
      };
    }

    // Server overloaded
    if (error.status === 503) {
      return {
        error: {
          message: 'DeepSeek servers are currently overloaded. Please try again later.',
          type: 'overloaded',
          code: 'service_overloaded',
        },
        status: 503,
      };
    }

    return super.handleError(error);
  }

  /**
   * Get model-specific parameters
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // DeepSeek Reasoner - optimized for reasoning tasks
    if (modelId === 'deepseek-reasoner') {
      return {
        temperature: 0.3,
        max_tokens: 16384,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // DeepSeek V3+ models - latest generation
    if (modelId.startsWith('deepseek-v3')) {
      return {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // DeepSeek Chat - general purpose
    if (modelId === 'deepseek-chat') {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Default settings
    return {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
  }

  /**
   * Estimate tokens for cost calculation
   */
  estimateTokens(text: string): number {
    // Rough estimation for Chinese/English mixed content
    // Chinese characters typically use more tokens
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    // Chinese chars: ~1.5 tokens per char
    // Other chars: ~4 chars per token
    return Math.ceil(chineseChars * 1.5 + otherChars / 4);
  }
}