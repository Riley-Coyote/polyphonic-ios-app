/**
 * Anthropic API Provider Implementation
 */

import { BaseAPIProvider } from '../base';
import { APIProviderConfig, Message, ChatCompletionRequest, ChatCompletionResponse } from '../types';
import { AIModel } from '../../../constants/aiModels';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseAPIProvider {
  constructor() {
    const config: APIProviderConfig = {
      name: 'Anthropic',
      baseURL: 'https://api.anthropic.com/v1',
      apiKeyEnvVar: 'ANTHROPIC_API_KEY',
      supportsStreaming: true,
      maxRetries: 3,
      timeout: 60000,
      models: [
        'claude-opus-4-1-20250805',
        'claude-sonnet-4-5-20250929',
        'claude-haiku-4-5-20250929',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
      ],
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15',
      },
    };
    super(config);
  }

  /**
   * Get Anthropic-specific auth headers
   */
  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'x-api-key': apiKey,
    };
  }

  /**
   * Get the messages endpoint
   */
  protected getChatEndpoint(): string {
    return '/messages';
  }

  /**
   * Convert OpenAI format messages to Anthropic format
   */
  formatMessages(messages: Message[]): AnthropicMessage[] {
    const anthropicMessages: AnthropicMessage[] = [];
    let currentRole: 'user' | 'assistant' | null = null;
    let currentContent = '';

    for (const message of messages) {
      // Skip system messages (will be handled separately)
      if (message.role === 'system') {
        continue;
      }

      const role = message.role === 'user' ? 'user' : 'assistant';

      // Anthropic requires alternating user/assistant messages
      if (role === currentRole) {
        // Combine consecutive messages from the same role
        currentContent += '\n\n' + message.content;
      } else {
        if (currentRole !== null && currentContent) {
          anthropicMessages.push({
            role: currentRole,
            content: currentContent,
          });
        }
        currentRole = role;
        currentContent = message.content;
      }
    }

    // Add the last message
    if (currentRole !== null && currentContent) {
      anthropicMessages.push({
        role: currentRole,
        content: currentContent,
      });
    }

    // Ensure first message is from user (Anthropic requirement)
    if (anthropicMessages.length > 0 && anthropicMessages[0].role !== 'user') {
      anthropicMessages.unshift({
        role: 'user',
        content: 'Continue the conversation.',
      });
    }

    return anthropicMessages;
  }

  /**
   * Extract system message from messages
   */
  private extractSystemMessage(messages: Message[]): string | undefined {
    const systemMessages = messages.filter(m => m.role === 'system');
    return systemMessages.length > 0
      ? systemMessages.map(m => m.content).join('\n\n')
      : undefined;
  }

  /**
   * Override createChatCompletion for Anthropic's format
   */
  async createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    const anthropicMessages = this.formatMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);

    const request: AnthropicRequest = {
      model: model.id,
      messages: anthropicMessages,
      max_tokens: options?.max_tokens || 4096,
      temperature: options?.temperature,
      top_p: options?.top_p,
      stream: false,
      ...(systemMessage && { system: systemMessage }),
    };

    const response = await this.withRetry(() =>
      this.makeRequest<AnthropicResponse>('/messages', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    );

    // Convert Anthropic response to OpenAI format
    return this.convertToOpenAIFormat(response, model.id);
  }

  /**
   * Override streaming for Anthropic's format
   * React Native doesn't support ReadableStream, so we'll simulate streaming
   */
  async *createStreamingChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): AsyncGenerator<string, void, unknown> {
    const anthropicMessages = this.formatMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);

    // For React Native, we'll use non-streaming API and simulate streaming
    // This is a workaround since React Native fetch doesn't support streaming
    const request: AnthropicRequest = {
      model: model.id,
      messages: anthropicMessages,
      max_tokens: options?.max_tokens || 4096,
      temperature: options?.temperature,
      top_p: options?.top_p,
      stream: false, // Changed to false for React Native compatibility
      ...(systemMessage && { system: systemMessage }),
    };

    try {
      const response = await fetch(`${this.config.baseURL}/messages`, {
        method: 'POST',
        headers: {
          ...this.config.defaultHeaders,
          ...this.getAuthHeaders(await this.getAPIKey()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createAPIError(errorData, response.status);
      }

      const data = await response.json() as AnthropicResponse;

      // Extract the full text from the response
      const fullText = data.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('');

      // Simulate streaming by yielding chunks of text
      const chunkSize = 5; // Characters per chunk
      for (let i = 0; i < fullText.length; i += chunkSize) {
        yield fullText.slice(i, i + chunkSize);
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert Anthropic response to OpenAI format
   */
  private convertToOpenAIFormat(
    response: AnthropicResponse,
    model: string
  ): ChatCompletionResponse {
    const content = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    return {
      id: response.id,
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
          finish_reason: response.stop_reason,
        },
      ],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  /**
   * Test connection with a simple request
   */
  async testConnection(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we'll do a minimal message request
      const testRequest: AnthropicRequest = {
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      };

      await this.makeRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(testRequest),
      });

      return true;
    } catch (error: any) {
      // Connection test failed - return false for any error
      return false;
    }
  }

  /**
   * Handle Anthropic-specific errors
   */
  handleError(error: any): any {
    const errorType = error?.error?.type;

    switch (errorType) {
      case 'rate_limit_error':
        return {
          error: {
            message: 'Rate limit exceeded. Please try again later.',
            type: 'rate_limit',
            code: errorType,
          },
          status: 429,
        };

      case 'invalid_request_error':
        return {
          error: {
            message: error?.error?.message || 'Invalid request',
            type: 'invalid_request',
            code: errorType,
          },
          status: 400,
        };

      case 'authentication_error':
        return {
          error: {
            message: 'Invalid API key',
            type: 'authentication',
            code: errorType,
          },
          status: 401,
        };

      case 'overloaded_error':
        return {
          error: {
            message: 'Anthropic servers are overloaded. Please try again.',
            type: 'overloaded',
            code: errorType,
          },
          status: 503,
        };

      default:
        return super.handleError(error);
    }
  }

  /**
   * Get model-specific parameters
   */
  getModelDefaults(modelId: string): Partial<ChatCompletionRequest> {
    // Opus models - highest capability
    if (modelId.includes('opus')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      };
    }

    // Sonnet models - balanced
    if (modelId.includes('sonnet')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      };
    }

    // Haiku models - fast and efficient
    if (modelId.includes('haiku')) {
      return {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
      };
    }

    // Default
    return {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
    };
  }
}