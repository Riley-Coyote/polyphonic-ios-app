/**
 * Meta Llama API Provider Implementation
 *
 * Note: Meta Llama models are available through various cloud providers.
 * This implementation supports multiple hosting options.
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

export type MetaHostingProvider = 'replicate' | 'together' | 'anyscale' | 'groq' | 'perplexity' | 'custom';

interface MetaProviderOptions {
  hostingProvider?: MetaHostingProvider;
  customBaseURL?: string;
}

export class MetaProvider extends BaseAPIProvider {
  private hostingProvider: MetaHostingProvider;

  constructor(options: MetaProviderOptions = {}) {
    const hostingProvider = options.hostingProvider || 'together';
    const baseURL = MetaProvider.getBaseURL(hostingProvider, options.customBaseURL);

    const config: APIProviderConfig = {
      name: 'Meta',
      baseURL: baseURL,
      apiKeyEnvVar: MetaProvider.getAPIKeyEnvVar(hostingProvider),
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 120000, // 2 minutes
      models: [
        'llama-4-scout-preview',
        'llama-4-scout',
        'llama-3.3-70b-instruct',
        'llama-3.2-90b-vision-instruct',
        'llama-3.2-11b-vision-instruct',
        'llama-3.2-3b-instruct',
        'llama-3.2-1b-instruct',
        'llama-3.1-405b-instruct',
        'llama-3.1-70b-instruct',
        'llama-3.1-8b-instruct',
        'llama-3-70b-instruct',
        'llama-3-8b-instruct',
      ],
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    };

    super(config);
    this.hostingProvider = hostingProvider;
  }

  /**
   * Get base URL based on hosting provider
   */
  private static getBaseURL(provider: MetaHostingProvider, customURL?: string): string {
    switch (provider) {
      case 'together':
        return 'https://api.together.xyz/v1';
      case 'replicate':
        return 'https://api.replicate.com/v1';
      case 'anyscale':
        return 'https://api.endpoints.anyscale.com/v1';
      case 'groq':
        return 'https://api.groq.com/openai/v1';
      case 'perplexity':
        return 'https://api.perplexity.ai';
      case 'custom':
        if (!customURL) {
          throw new Error('Custom base URL must be provided for custom hosting provider');
        }
        return customURL;
      default:
        return 'https://api.together.xyz/v1';
    }
  }

  /**
   * Get API key environment variable based on hosting provider
   */
  private static getAPIKeyEnvVar(provider: MetaHostingProvider): string {
    switch (provider) {
      case 'together':
        return 'TOGETHER_API_KEY';
      case 'replicate':
        return 'REPLICATE_API_KEY';
      case 'anyscale':
        return 'ANYSCALE_API_KEY';
      case 'groq':
        return 'GROQ_API_KEY';
      case 'perplexity':
        return 'PERPLEXITY_API_KEY';
      case 'custom':
        return 'META_API_KEY';
      default:
        return 'TOGETHER_API_KEY';
    }
  }

  /**
   * Get auth headers based on hosting provider
   */
  protected getAuthHeaders(apiKey: string): Record<string, string> {
    switch (this.hostingProvider) {
      case 'replicate':
        return {
          'Authorization': `Token ${apiKey}`,
        };
      default:
        // Most providers use Bearer tokens
        return {
          'Authorization': `Bearer ${apiKey}`,
        };
    }
  }

  /**
   * Get the chat completion endpoint
   */
  protected getChatEndpoint(): string {
    switch (this.hostingProvider) {
      case 'replicate':
        return '/predictions';
      default:
        // Most providers use OpenAI-compatible endpoints
        return '/chat/completions';
    }
  }

  /**
   * Format model ID based on hosting provider
   */
  private formatModelId(modelId: string): string {
    // Some providers require specific model ID formats
    switch (this.hostingProvider) {
      case 'together':
        // Together uses specific format like "meta-llama/Llama-3-70b-chat-hf"
        if (modelId === 'llama-4-scout-preview') {
          return 'meta-llama/Llama-4-Scout-Preview';
        }
        if (modelId === 'llama-4-scout') {
          return 'meta-llama/Llama-4-Scout';
        }
        if (modelId === 'llama-3.3-70b-instruct') {
          return 'meta-llama/Llama-3.3-70B-Instruct';
        }
        if (modelId === 'llama-3.2-90b-vision-instruct') {
          return 'meta-llama/Llama-3.2-90B-Vision-Instruct';
        }
        if (modelId === 'llama-3.2-11b-vision-instruct') {
          return 'meta-llama/Llama-3.2-11B-Vision-Instruct';
        }
        if (modelId === 'llama-3.2-3b-instruct') {
          return 'meta-llama/Llama-3.2-3B-Instruct';
        }
        if (modelId === 'llama-3.2-1b-instruct') {
          return 'meta-llama/Llama-3.2-1B-Instruct';
        }
        if (modelId === 'llama-3.1-405b-instruct') {
          return 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo';
        }
        if (modelId === 'llama-3.1-70b-instruct') {
          return 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
        }
        if (modelId === 'llama-3.1-8b-instruct') {
          return 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
        }
        return modelId;

      case 'groq':
        // Groq uses simplified names
        if (modelId.includes('llama-3.3')) {
          return 'llama-3.3-70b-versatile';
        }
        if (modelId.includes('llama-3.2')) {
          return 'llama-3.2-90b-text-preview';
        }
        if (modelId.includes('llama-3.1-405b')) {
          return 'llama-3.1-405b-reasoning';
        }
        if (modelId.includes('llama-3.1-70b')) {
          return 'llama-3.1-70b-versatile';
        }
        if (modelId.includes('llama-3.1-8b')) {
          return 'llama-3.1-8b-instant';
        }
        return modelId;

      default:
        return modelId;
    }
  }

  /**
   * Format messages for Llama's format
   */
  formatMessages(messages: Message[]): Message[] {
    // Llama models typically use OpenAI's format
    const formattedMessages = messages.filter(m => m.content).map(message => ({
      role: message.role,
      content: message.content,
      ...(message.name && { name: message.name }),
    }));

    // Llama models work best with system prompts at the beginning
    const systemMessages = formattedMessages.filter(m => m.role === 'system');
    const otherMessages = formattedMessages.filter(m => m.role !== 'system');

    return [...systemMessages, ...otherMessages];
  }

  /**
   * Override for specific Llama models
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    const formattedModelId = this.formatModelId(model.id);

    // Llama 4 Scout - optimized for code and reasoning
    if (model.id.includes('llama-4-scout')) {
      const scoutOptions = {
        ...options,
        temperature: options?.temperature ?? 0.5,
        max_tokens: options?.max_tokens ?? 32768,
        // Scout models are optimized for code generation
        code_mode: true,
      };
      return this.makeProviderSpecificRequest(messages, formattedModelId, scoutOptions);
    }

    // Llama 3.3 - latest 70B model
    if (model.id.includes('llama-3.3')) {
      const llamaOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 8192,
      };
      return this.makeProviderSpecificRequest(messages, formattedModelId, llamaOptions);
    }

    // Vision models
    if (model.id.includes('vision')) {
      const visionOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 4096,
        // Enable vision processing
        vision_enabled: true,
      };
      return this.makeProviderSpecificRequest(messages, formattedModelId, visionOptions);
    }

    // 405B model - largest and most capable
    if (model.id.includes('405b')) {
      const largeOptions = {
        ...options,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 32768,
      };
      return this.makeProviderSpecificRequest(messages, formattedModelId, largeOptions);
    }

    return this.makeProviderSpecificRequest(messages, formattedModelId, options);
  }

  /**
   * Make provider-specific request
   */
  private async makeProviderSpecificRequest(
    messages: Message[],
    modelId: string,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    if (this.hostingProvider === 'replicate') {
      // Replicate has a different API structure
      return this.makeReplicateRequest(messages, modelId, options);
    }

    // Most providers use OpenAI-compatible format
    const request: ChatCompletionRequest = {
      model: modelId,
      messages: this.formatMessages(messages),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4096,
      stream: false,
      ...options,
    };

    return await this.withRetry(() =>
      this.makeRequest<ChatCompletionResponse>(
        this.getChatEndpoint(),
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )
    );
  }

  /**
   * Make Replicate-specific request
   */
  private async makeReplicateRequest(
    messages: Message[],
    modelId: string,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    // Replicate uses a different API structure
    const prompt = this.messagesToPrompt(messages);

    const request = {
      version: this.getReplicateVersion(modelId),
      input: {
        prompt: prompt,
        temperature: options?.temperature ?? 0.7,
        max_new_tokens: options?.max_tokens ?? 4096,
        top_p: options?.top_p ?? 0.9,
      },
    };

    const prediction = await this.withRetry(() =>
      this.makeRequest('/predictions', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    );

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await this.makeRequest(`/predictions/${result.id}`);
    }

    if (result.status !== 'succeeded') {
      throw new Error(`Replicate prediction failed: ${result.error}`);
    }

    // Convert Replicate response to OpenAI format
    return {
      id: result.id,
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: modelId,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: Array.isArray(result.output) ? result.output.join('') : result.output,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  /**
   * Get Replicate model version
   */
  private getReplicateVersion(modelId: string): string {
    // Map model IDs to Replicate versions
    // These are examples - actual versions should be updated based on Replicate's catalog
    const versionMap: Record<string, string> = {
      'llama-3.1-405b-instruct': 'meta/meta-llama-3.1-405b-instruct',
      'llama-3.1-70b-instruct': 'meta/meta-llama-3.1-70b-instruct',
      'llama-3.1-8b-instruct': 'meta/meta-llama-3.1-8b-instruct',
    };

    return versionMap[modelId] || modelId;
  }

  /**
   * Convert messages to prompt format for Replicate
   */
  private messagesToPrompt(messages: Message[]): string {
    let prompt = '';

    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }

    prompt += 'Assistant: ';
    return prompt;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.hostingProvider === 'replicate') {
        // Test Replicate connection
        await this.makeRequest('/');
        return true;
      }

      // Test OpenAI-compatible connection
      const response = await this.makeRequest('/models');
      return response && response.data && Array.isArray(response.data);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Handle provider-specific errors
   */
  handleError(error: any): any {
    const errorCode = error?.error?.code;

    // Rate limiting
    if (errorCode === 'rate_limit_exceeded' || error.status === 429) {
      return {
        error: {
          message: `${this.hostingProvider} rate limit exceeded. Please try again later.`,
          type: 'rate_limit',
          code: 'rate_limit_exceeded',
        },
        status: 429,
      };
    }

    // Authentication error
    if (error.status === 401 || error.status === 403) {
      return {
        error: {
          message: `Invalid ${this.hostingProvider} API key`,
          type: 'authentication',
          code: 'auth_error',
        },
        status: 401,
      };
    }

    return super.handleError(error);
  }

  /**
   * Get model-specific defaults
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // Llama 4 Scout - code and reasoning focused
    if (modelId.includes('llama-4-scout')) {
      return {
        temperature: 0.5,
        max_tokens: 32768,
        top_p: 0.9,
      };
    }

    // 405B models - largest capability
    if (modelId.includes('405b')) {
      return {
        temperature: 0.7,
        max_tokens: 32768,
        top_p: 0.9,
      };
    }

    // Vision models
    if (modelId.includes('vision')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.95,
      };
    }

    // Small models (1B, 3B)
    if (modelId.includes('1b') || modelId.includes('3b')) {
      return {
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
      };
    }

    // Default settings
    return {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
    };
  }
}