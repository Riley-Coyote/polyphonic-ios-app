/**
 * API Service Types and Interfaces
 */

import { AIModel } from '../../constants/aiModels';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  function_call?: any;
}

export type ReasoningEffort =
  // GPT-5.1 values
  | 'none'    // Default for GPT-5.1, no reasoning
  | 'low'     // Moderate reasoning
  | 'medium'  // Significant reasoning
  | 'high'    // Maximum reasoning
  // GPT-5 (non-5.1) values
  | 'minimal'; // Minimal reasoning for GPT-5

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  n?: number;
  reasoning_effort?: ReasoningEffort;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}

export interface APIError {
  error: {
    message: string;
    type: string;
    code?: string;
    param?: string;
  };
  status?: number;
}

export interface APIProviderConfig {
  name: string;
  baseURL: string;
  apiKeyEnvVar: string;
  defaultHeaders?: Record<string, string>;
  models: string[];
  supportsStreaming: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface APIProvider {
  config: APIProviderConfig;

  /**
   * Send a chat completion request
   */
  createChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse>;

  /**
   * Send a streaming chat completion request
   */
  createStreamingChatCompletion(
    messages: Message[],
    model: AIModel,
    options?: Partial<ChatCompletionRequest>
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Test the API connection with the current API key
   */
  testConnection(): Promise<boolean>;

  /**
   * Format messages for the specific provider's format
   */
  formatMessages(messages: Message[]): any;

  /**
   * Parse the provider's response format
   */
  parseResponse(data: any): string;

  /**
   * Handle provider-specific errors
   */
  handleError(error: any): APIError;
}

export interface APIKeyManager {
  /**
   * Store an API key securely
   */
  setAPIKey(provider: string, key: string): Promise<void>;

  /**
   * Retrieve an API key
   */
  getAPIKey(provider: string): Promise<string | null>;

  /**
   * Remove an API key
   */
  removeAPIKey(provider: string): Promise<void>;

  /**
   * Check if an API key exists
   */
  hasAPIKey(provider: string): Promise<boolean>;

  /**
   * Get all stored provider names
   */
  getStoredProviders(): Promise<string[]>;
}