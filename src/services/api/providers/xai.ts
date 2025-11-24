/**
 * xAI Grok API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

export class XAIProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'xAI',
      baseURL: 'https://api.x.ai/v1',
      apiKeyEnvVar: 'XAI_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 180000, // 3 minutes for reasoning models
      models: [
        'grok-4',
        'grok-4-reasoning',
        'grok-4-vision',
        'grok-3.5',
        'grok-3.5-turbo',
        'grok-3',
        'grok-2',
        'grok-2-mini',
        'grok-1',
      ],
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    };
    super(config);
  }

  /**
   * Get xAI-specific auth headers
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
   * Format messages for Grok's format (OpenAI-compatible)
   */
  formatMessages(messages: Message[]): Message[] {
    // Grok uses OpenAI's format
    return messages.filter(m => m.content).map(message => ({
      role: message.role,
      content: message.content,
      ...(message.name && { name: message.name }),
    }));
  }

  /**
   * Override for Grok models with special requirements
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    // Grok-4 Reasoning - optimized for complex reasoning tasks
    if (model.id === 'grok-4-reasoning') {
      const reasoningOptions = {
        ...options,
        // Reasoning models need lower temperature and more tokens
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 32768,
        // Enable reasoning mode
        reasoning_mode: true,
        reasoning_depth: options?.reasoning_depth || 'deep', // 'quick', 'standard', 'deep'
        // Grok's unique feature: real-time web access
        enable_web_access: options?.enable_web_access ?? true,
      };
      return super.createChatCompletion(messages, model, reasoningOptions);
    }

    // Grok-4 Vision - multimodal capabilities
    if (model.id === 'grok-4-vision') {
      const visionOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 16384,
        // Enable vision processing
        vision_enabled: true,
        // Grok's vision can also access web images
        enable_web_vision: options?.enable_web_vision ?? true,
      };
      return super.createChatCompletion(messages, model, visionOptions);
    }

    // Grok-4 base - flagship model with real-time capabilities
    if (model.id === 'grok-4') {
      const grok4Options = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 32768,
        // Grok's distinctive feature: real-time X/Twitter integration
        enable_x_integration: options?.enable_x_integration ?? true,
        enable_web_access: options?.enable_web_access ?? true,
      };
      return super.createChatCompletion(messages, model, grok4Options);
    }

    // Grok-3.5 models - balanced performance
    if (model.id.startsWith('grok-3.5')) {
      const grok35Options = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 16384,
        enable_web_access: options?.enable_web_access ?? false, // Optional for 3.5
      };
      return super.createChatCompletion(messages, model, grok35Options);
    }

    // Grok-3 and earlier models
    if (model.id.startsWith('grok-3') || model.id.startsWith('grok-2') || model.id === 'grok-1') {
      const legacyOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 8192,
      };
      return super.createChatCompletion(messages, model, legacyOptions);
    }

    return super.createChatCompletion(messages, model, options);
  }

  /**
   * Override streaming for Grok's format
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
      // xAI uses OpenAI-compatible endpoints
      const response = await this.makeRequest('/models');
      return response && response.data && Array.isArray(response.data);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Handle xAI-specific errors
   */
  handleError(error: any): any {
    const errorCode = error?.error?.code;
    const errorType = error?.error?.type;

    // Rate limiting
    if (errorCode === 'rate_limit_exceeded' || error.status === 429) {
      return {
        error: {
          message: 'xAI API rate limit exceeded. Please try again later.',
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
          message: error?.error?.message || 'Invalid request to xAI API',
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
          message: 'Invalid xAI API key',
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
          message: `xAI model not found: ${error?.error?.param || 'unknown'}`,
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
          message: 'The conversation is too long for this Grok model. Please start a new conversation.',
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
          message: 'xAI servers are currently overloaded. Please try again later.',
          type: 'overloaded',
          code: 'service_overloaded',
        },
        status: 503,
      };
    }

    // Quota exceeded
    if (errorCode === 'insufficient_quota') {
      return {
        error: {
          message: 'You have exceeded your xAI quota. Please check your billing.',
          type: 'quota_exceeded',
          code: errorCode,
        },
        status: 402,
      };
    }

    return super.handleError(error);
  }

  /**
   * Get model-specific parameters
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // Grok-4 Reasoning - deep reasoning tasks
    if (modelId === 'grok-4-reasoning') {
      return {
        temperature: 0.3,
        max_tokens: 32768,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-4 Vision - multimodal processing
    if (modelId === 'grok-4-vision') {
      return {
        temperature: 0.7,
        max_tokens: 16384,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-4 - flagship with real-time
    if (modelId === 'grok-4') {
      return {
        temperature: 0.7,
        max_tokens: 32768,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-3.5 models
    if (modelId.startsWith('grok-3.5')) {
      return {
        temperature: 0.7,
        max_tokens: 16384,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-3 models
    if (modelId.startsWith('grok-3')) {
      return {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-2 models
    if (modelId.startsWith('grok-2')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
    }

    // Grok-1 - original model
    if (modelId === 'grok-1') {
      return {
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
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
    // Rough estimation: 1 token ~= 4 characters for English
    // Grok models are optimized for English and technical content
    return Math.ceil(text.length / 4);
  }
}