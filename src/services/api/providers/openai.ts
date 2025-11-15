/**
 * OpenAI API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest } from '../types';
import { AIModel } from '../../../constants/aiModels';

export class OpenAIProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      apiKeyEnvVar: 'OPENAI_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 60000, // 60 seconds
      models: [
        'gpt-5.1',
        'gpt-5.1-thinking',
        'gpt-5.1-mini',
        'gpt-5.1-nano',
        'gpt-5',
        'gpt-5-thinking',
        'gpt-5-mini',
        'gpt-5-nano',
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'o1-preview',
        'o1-mini',
      ],
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2',
      },
    };
    super(config);
  }

  /**
   * Get OpenAI-specific auth headers
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
   * Format messages for OpenAI's format
   * OpenAI uses the standard format, so no changes needed
   */
  formatMessages(messages: Message[]): Message[] {
    // Filter out any empty messages and ensure proper format
    return messages.filter(m => m.content).map(message => ({
      role: message.role,
      content: message.content,
      ...(message.name && { name: message.name }),
    }));
  }

  /**
   * Override for o1 models and reasoning models which have special requirements
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<any> {
    // o1 models don't support temperature, top_p, etc.
    if (model.id.startsWith('o1-')) {
      const filteredOptions = {
        ...options,
        temperature: undefined,
        top_p: undefined,
        frequency_penalty: undefined,
        presence_penalty: undefined,
      };
      return super.createChatCompletion(messages, model, filteredOptions);
    }

    // GPT-5.1 models (including thinking variants)
    if (model.id.startsWith('gpt-5.1')) {
      const gpt51Options = {
        ...options,
        // GPT-5.1 reasoning effort: 'none' (default), 'low', 'medium', 'high'
        // Default is 'none' for latency-sensitive workloads
        // Use 'low'/'medium' for complex tasks, 'high' when intelligence > speed
        reasoning_effort: options?.reasoning_effort || 'none',
      };
      return super.createChatCompletion(messages, model, gpt51Options);
    }

    // GPT-5 models (non-5.1, including thinking variants)
    if (model.id.startsWith('gpt-5')) {
      const gpt5Options = {
        ...options,
        // GPT-5 reasoning effort: 'minimal' or 'medium' (default)
        // 'minimal' for latency optimization, 'medium' for balanced reasoning
        reasoning_effort: options?.reasoning_effort || 'medium',
      };
      return super.createChatCompletion(messages, model, gpt5Options);
    }

    return super.createChatCompletion(messages, model, options);
  }

  /**
   * Test connection with a simple models request
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/models');
      return response && response.data && Array.isArray(response.data);
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Handle OpenAI-specific errors
   */
  handleError(error: any): any {
    // OpenAI-specific error codes
    const errorCode = error?.error?.code;

    switch (errorCode) {
      case 'rate_limit_exceeded':
        return {
          error: {
            message: 'Rate limit exceeded. Please try again later.',
            type: 'rate_limit',
            code: errorCode,
          },
          status: 429,
        };

      case 'model_not_found':
        return {
          error: {
            message: `Model not found: ${error?.error?.param}`,
            type: 'invalid_request',
            code: errorCode,
          },
          status: 404,
        };

      case 'context_length_exceeded':
        return {
          error: {
            message: 'The conversation is too long for this model. Please start a new conversation.',
            type: 'context_length',
            code: errorCode,
          },
          status: 400,
        };

      case 'insufficient_quota':
        return {
          error: {
            message: 'You have exceeded your OpenAI quota. Please check your billing.',
            type: 'quota_exceeded',
            code: errorCode,
          },
          status: 402,
        };

      default:
        return super.handleError(error);
    }
  }

  /**
   * Calculate token usage for cost estimation
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ~= 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Get model-specific parameters
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // GPT-5 models
    if (modelId.startsWith('gpt-5')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      };
    }

    // O1 reasoning models
    if (modelId.startsWith('o1-')) {
      return {
        max_tokens: 32768,
        // o1 models don't support temperature
      };
    }

    // GPT-4 models
    if (modelId.startsWith('gpt-4')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      };
    }

    // Default for GPT-3.5 and others
    return {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
    };
  }
}