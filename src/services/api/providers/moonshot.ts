/**
 * Moonshot AI (Kimi) API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

export class MoonshotProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'Moonshot',
      baseURL: 'https://api.moonshot.cn/v1',
      apiKeyEnvVar: 'MOONSHOT_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 180000, // 3 minutes for thinking models
      models: [
        'kimi-k2',
        'kimi-k2-thinking',
        'kimi-k2-vision',
        'kimi-k1.5-chat',
        'kimi-k1-chat',
        'moonshot-v1-128k',
        'moonshot-v1-32k',
        'moonshot-v1-8k',
      ],
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    };
    super(config);
  }

  /**
   * Get Moonshot-specific auth headers
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
    return '/chat/completions';
  }

  /**
   * Format messages for Moonshot's format (OpenAI-compatible)
   */
  formatMessages(messages: Message[]): Message[] {
    // Moonshot/Kimi uses OpenAI's format
    return messages.filter(m => m.content).map(message => ({
      role: message.role,
      content: message.content,
      ...(message.name && { name: message.name }),
    }));
  }

  /**
   * Override for K2 models with special requirements
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    // K2 Thinking model - optimized for reasoning
    if (model.id === 'kimi-k2-thinking') {
      const thinkingOptions = {
        ...options,
        // Thinking models typically need lower temperature and more tokens
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 32768,
        // Enable thinking mode
        thinking_mode: true,
        thinking_budget: options?.thinking_budget || 'medium', // 'low', 'medium', 'high'
      };
      return super.createChatCompletion(messages, model, thinkingOptions);
    }

    // K2 Vision model - multimodal capabilities
    if (model.id === 'kimi-k2-vision') {
      const visionOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 16384,
        // Enable vision processing
        vision_enabled: true,
      };
      return super.createChatCompletion(messages, model, visionOptions);
    }

    // K2 base model - flagship capability
    if (model.id === 'kimi-k2') {
      const k2Options = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 200000, // K2 has massive context
      };
      return super.createChatCompletion(messages, model, k2Options);
    }

    // K1.5 and K1 models
    if (model.id.startsWith('kimi-k1')) {
      const k1Options = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 128000,
      };
      return super.createChatCompletion(messages, model, k1Options);
    }

    // Legacy Moonshot models with different context sizes
    if (model.id.startsWith('moonshot-v1')) {
      let maxTokens = 8192;
      if (model.id.includes('128k')) {
        maxTokens = 128000;
      } else if (model.id.includes('32k')) {
        maxTokens = 32000;
      }

      const moonshotOptions = {
        ...options,
        max_tokens: options?.max_tokens ?? maxTokens,
      };
      return super.createChatCompletion(messages, model, moonshotOptions);
    }

    return super.createChatCompletion(messages, model, options);
  }

  /**
   * Override streaming for Moonshot's format
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
      // Moonshot uses OpenAI-compatible endpoints
      const response = await this.makeRequest('/models');
      return response && response.data && Array.isArray(response.data);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Handle Moonshot-specific errors
   */
  handleError(error: any): any {
    const errorCode = error?.error?.code;
    const errorType = error?.error?.type;

    // Rate limiting
    if (errorCode === 'rate_limit_exceeded' || error.status === 429) {
      return {
        error: {
          message: 'Moonshot API rate limit exceeded. Please try again later.',
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
          message: error?.error?.message || 'Invalid request to Moonshot API',
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
          message: 'Invalid Moonshot API key',
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
          message: `Moonshot model not found: ${error?.error?.param || 'unknown'}`,
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
          message: 'The conversation exceeds the context limit for this Kimi model.',
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
          message: 'Moonshot servers are currently overloaded. Please try again later.',
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
    // K2 Thinking - optimized for deep reasoning
    if (modelId === 'kimi-k2-thinking') {
      return {
        temperature: 0.3,
        max_tokens: 32768,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // K2 Vision - multimodal processing
    if (modelId === 'kimi-k2-vision') {
      return {
        temperature: 0.7,
        max_tokens: 16384,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // K2 Base - flagship model with massive context
    if (modelId === 'kimi-k2') {
      return {
        temperature: 0.7,
        max_tokens: 200000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // K1.5 and K1 models
    if (modelId.startsWith('kimi-k1')) {
      return {
        temperature: 0.7,
        max_tokens: 128000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Legacy Moonshot models
    if (modelId === 'moonshot-v1-128k') {
      return {
        temperature: 0.7,
        max_tokens: 128000,
        top_p: 1,
      };
    }

    if (modelId === 'moonshot-v1-32k') {
      return {
        temperature: 0.7,
        max_tokens: 32000,
        top_p: 1,
      };
    }

    if (modelId === 'moonshot-v1-8k') {
      return {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 1,
      };
    }

    // Default settings
    return {
      temperature: 0.7,
      max_tokens: 8192,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
  }

  /**
   * Estimate tokens for cost calculation
   */
  estimateTokens(text: string): number {
    // Kimi models handle Chinese and English content
    // Chinese characters typically use more tokens
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    // Chinese chars: ~1.5 tokens per char
    // Other chars: ~4 chars per token
    return Math.ceil(chineseChars * 1.5 + otherChars / 4);
  }
}