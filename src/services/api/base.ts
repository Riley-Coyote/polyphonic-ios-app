/**
 * Base API Provider Implementation
 */

import {
  APIProvider,
  APIProviderConfig,
  Message,
  ChatCompletionRequest,
  ChatCompletionResponse,
  APIError,
  StreamChunk,
} from './types';
import { AIModel } from '../../constants/aiModels';
import { apiKeyManager } from '../security/apiKeyManager';

export abstract class BaseAPIProvider implements APIProvider {
  config: APIProviderConfig;
  private apiKey: string | null = null;

  constructor(config: APIProviderConfig) {
    this.config = config;
  }

  /**
   * Get the API key for this provider
   */
  protected async getAPIKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = await apiKeyManager.getAPIKey(this.config.name.toLowerCase());
      if (!this.apiKey) {
        throw new Error(`No API key found for ${this.config.name}`);
      }
    }
    return this.apiKey;
  }

  /**
   * Make an authenticated request to the API
   */
  protected async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const apiKey = await this.getAPIKey();

    const headers = {
      ...this.config.defaultHeaders,
      ...this.getAuthHeaders(apiKey),
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.config.timeout || 30000);

    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
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
   * Create a streaming request
   * React Native compatible implementation that simulates streaming
   */
  protected async *makeStreamingRequest(
    endpoint: string,
    body: any
  ): AsyncGenerator<string, void, unknown> {
    const apiKey = await this.getAPIKey();
    console.log('[BaseAPI] API key retrieved:', !!apiKey);

    const headers = {
      ...this.config.defaultHeaders,
      ...this.getAuthHeaders(apiKey),
      'Content-Type': 'application/json',
    };

    // React Native doesn't support response.body.getReader()
    // So we'll make a non-streaming request and simulate streaming
    const nonStreamingBody = { ...body, stream: false };

    console.log('[BaseAPI] Making streaming request:', {
      provider: this.config.name,
      endpoint: `${this.config.baseURL}${endpoint}`,
      model: body.model,
    });

    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(nonStreamingBody),
      });

      console.log('[BaseAPI] Response received:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[BaseAPI] API Error Response:', {
          status: response.status,
          error: errorData,
        });
        throw this.createAPIError(errorData, response.status);
      }

      const data = await response.json() as ChatCompletionResponse;
      const fullText = data.choices[0]?.message?.content || '';

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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retry logic for failed requests
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on authentication errors
        if (error.status === 401 || error.status === 403) {
          throw error;
        }

        // Exponential backoff
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError;
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Most providers support a models endpoint
      await this.makeRequest('/models');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Default implementation for non-streaming completion
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: model.id,
      messages: this.formatMessages(messages),
      temperature: options?.temperature ?? 0.7,
      stream: false,
      ...options, // Spread options first
      // Then apply conditional logic (this has final say to prevent both params being sent)
      ...(options?.max_completion_tokens ? {} : { max_tokens: options?.max_tokens ?? 2048 }),
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
   * Default implementation for streaming completion
   */
  async *createStreamingChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): AsyncGenerator<string, void, unknown> {
    if (!this.config.supportsStreaming) {
      // Fallback to non-streaming for providers that don't support it
      const response = await this.createChatCompletion(messages, model, options);
      yield response.choices[0].message.content || '';
      return;
    }

    const request: ChatCompletionRequest = {
      model: model.id,
      messages: this.formatMessages(messages),
      temperature: options?.temperature ?? 0.7,
      stream: true,
      ...options, // Spread options first
      // Then apply conditional logic (this has final say to prevent both params being sent)
      ...(options?.max_completion_tokens ? {} : { max_tokens: options?.max_tokens ?? 2048 }),
    };

    yield* this.makeStreamingRequest(this.getChatEndpoint(), request);
  }

  /**
   * Create an API error object
   */
  protected createAPIError(data: any, status?: number): APIError {
    return {
      error: {
        message: data?.error?.message || data?.message || 'Unknown error',
        type: data?.error?.type || 'api_error',
        code: data?.error?.code,
      },
      status,
    };
  }

  /**
   * Default error handler
   */
  handleError(error: any): APIError {
    if (error.error) {
      return error;
    }

    return {
      error: {
        message: error.message || 'Unknown error occurred',
        type: 'unknown_error',
      },
    };
  }

  /**
   * Default message formatter (OpenAI format)
   */
  formatMessages(messages: Message[]): Message[] {
    return messages;
  }

  /**
   * Default response parser
   */
  parseResponse(data: ChatCompletionResponse): string {
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Extract content from a streaming chunk
   */
  protected extractContentFromChunk(chunk: StreamChunk): string | null {
    return chunk.choices[0]?.delta?.content || null;
  }

  /**
   * Get authentication headers for the provider
   */
  protected abstract getAuthHeaders(apiKey: string): Record<string, string>;

  /**
   * Get the chat completion endpoint
   */
  protected abstract getChatEndpoint(): string;
}