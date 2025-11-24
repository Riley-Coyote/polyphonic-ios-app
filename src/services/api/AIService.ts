/**
 * Main AI Service - Orchestrates all AI providers
 */

import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { DeepSeekProvider } from './providers/deepseek';
import { MoonshotProvider } from './providers/moonshot';
import { MetaProvider } from './providers/meta';
import { XAIProvider } from './providers/xai';
import { APIProvider, Message, ChatCompletionResponse } from './types';
import { AIModel } from '../../constants/aiModels';
import { apiKeyManager } from '../security/apiKeyManager';

// Provider implementations
const providers: Record<string, APIProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  google: new GoogleProvider(),
  deepseek: new DeepSeekProvider(),
  moonshot: new MoonshotProvider(),
  meta: new MetaProvider(),
  xai: new XAIProvider(),
};

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  systemPrompt?: string;
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'minimal';
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface StreamingResponse {
  stream: AsyncGenerator<string, void, unknown>;
  cancel: () => void;
}

class AIService {
  private activeStreams: Map<string, AbortController> = new Map();

  /**
   * Get the provider for a model
   */
  private getProvider(model: AIModel): APIProvider {
    const providerName = model.provider.toLowerCase();
    const provider = providers[providerName];

    if (!provider) {
      throw new Error(`Provider ${model.provider} not implemented yet`);
    }

    return provider;
  }

  /**
   * Send a message to an AI model
   */
  async sendMessage(
    model: AIModel,
    messages: Message[],
    options?: AIServiceOptions
  ): Promise<AIResponse> {
    try {
      const provider = this.getProvider(model);

      // Check if API key exists
      const hasKey = await apiKeyManager.hasAPIKey(model.provider.toLowerCase());
      if (!hasKey) {
        throw new Error(`No API key configured for ${model.provider}`);
      }

      // Send the request
      const response = await provider.createChatCompletion(messages, model, {
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        reasoning_effort: options?.reasoningEffort,
      });

      return {
        content: provider.parseResponse(response),
        model: model.id,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      console.error('[AIService] Send message error:', {
        provider: model.provider,
        model: model.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        content: '',
        model: model.id,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Send a streaming message to an AI model
   */
  async sendStreamingMessage(
    model: AIModel,
    messages: Message[],
    options?: AIServiceOptions
  ): Promise<StreamingResponse> {
    const provider = this.getProvider(model);

    // Check if API key exists
    const hasKey = await apiKeyManager.hasAPIKey(model.provider.toLowerCase());
    if (!hasKey) {
      throw new Error(`No API key configured for ${model.provider}`);
    }

    // Create abort controller for cancellation
    const abortController = new AbortController();
    const streamId = `${model.id}_${Date.now()}`;
    this.activeStreams.set(streamId, abortController);

    const stream = provider.createStreamingChatCompletion(messages, model, {
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      reasoning_effort: options?.reasoningEffort,
    });

    // Wrap the stream to handle cancellation
    const wrappedStream = async function* () {
      try {
        for await (const chunk of stream) {
          if (abortController.signal.aborted) {
            break;
          }
          yield chunk;
        }
      } finally {
        // Clean up when stream ends
        this.activeStreams.delete(streamId);
      }
    }.bind(this);

    return {
      stream: wrappedStream(),
      cancel: () => {
        abortController.abort();
        this.activeStreams.delete(streamId);
      },
    };
  }

  /**
   * Send messages to multiple models in parallel
   */
  async sendToMultipleModels(
    models: AIModel[],
    messages: Message[],
    options?: AIServiceOptions
  ): Promise<AIResponse[]> {
    const promises = models.map(model =>
      this.sendMessage(model, messages, options)
    );

    return await Promise.all(promises);
  }

  /**
   * Stream from multiple models in parallel
   */
  async streamFromMultipleModels(
    models: AIModel[],
    messages: Message[],
    options?: AIServiceOptions
  ): Promise<StreamingResponse[]> {
    const promises = models.map(model =>
      this.sendStreamingMessage(model, messages, options)
    );

    return await Promise.all(promises);
  }

  /**
   * Test connection for a specific provider
   */
  async testProviderConnection(providerName: string): Promise<boolean> {
    const provider = providers[providerName.toLowerCase()];

    if (!provider) {
      return false;
    }

    // Check if API key exists
    const hasKey = await apiKeyManager.hasAPIKey(providerName.toLowerCase());
    if (!hasKey) {
      return false;
    }

    try {
      return await provider.testConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Test all configured providers
   */
  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const providerName of Object.keys(providers)) {
      results[providerName] = await this.testProviderConnection(providerName);
    }

    return results;
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams(): void {
    for (const [streamId, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  /**
   * Format error messages for display
   */
  private formatErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.message) {
      // Special handling for common errors
      if (error.message.includes('API key')) {
        return `API key error: Please check your ${error.message.split(' ')[0]} API key in Settings`;
      }
      if (error.message.includes('Rate limit')) {
        return 'Rate limit exceeded. Please wait a moment and try again.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      if (error.message.includes('Network')) {
        return 'Network error. Please check your connection.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Calculate resonance between multiple AI responses
   */
  calculateResonance(responses: AIResponse[]): number {
    if (responses.length < 2) {
      return 0;
    }

    const validResponses = responses.filter(r => !r.error && r.content);
    if (validResponses.length < 2) {
      return 0;
    }

    let totalSimilarity = 0;
    let comparisons = 0;

    // Compare each pair of responses
    for (let i = 0; i < validResponses.length; i++) {
      for (let j = i + 1; j < validResponses.length; j++) {
        const similarity = this.calculateSimilarity(
          validResponses[i].content,
          validResponses[j].content
        );
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Calculate similarity between two text strings (Jaccard similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get usage statistics for the current session
   */
  getSessionStats(): {
    totalRequests: number;
    activeStreams: number;
    providers: string[];
  } {
    return {
      totalRequests: 0, // This would need to be tracked
      activeStreams: this.activeStreams.size,
      providers: Object.keys(providers),
    };
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for convenience
export type { Message, ChatCompletionResponse } from './types';
export { apiKeyManager } from '../security/apiKeyManager';