export type AIModel = 'claude-3' | 'gpt-4' | 'gemini' | 'llama';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  model?: AIModel;
  timestamp: string;
  resonance?: number; // 0 to 1, alignment score between models
  edited?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'code';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  models: AIModel[];
  resonance: number; // Overall conversation resonance
  isAutonomous?: boolean;
  tags?: string[];
  memoryId?: string; // Link to persistent memory
  blockchain?: BlockchainReference;
}

export interface BlockchainReference {
  txHash: string;
  network: 'solana' | 'ethereum';
  timestamp: string;
}

export interface Memory {
  id: string;
  conversationId?: string;
  type: 'personal' | 'community';
  content: string;
  embedding?: number[]; // Vector for similarity search
  metadata: {
    topics: string[];
    sentiment: number; // -1 to 1
    importance: number; // 0 to 1
    accessCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  id: AIModel;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  publicKey?: string; // For blockchain integration
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  defaultModels: AIModel[];
  theme: 'dark' | 'light' | 'auto';
  autoSaveToMemory: boolean;
  shareToCommmmunity: boolean;
  notificationsEnabled: boolean;
}

export interface UserStats {
  totalConversations: number;
  totalMessages: number;
  averageResonance: number;
  topModels: Array<{model: AIModel; count: number}>;
  memoriesCreated: number;
}

export interface AutonomousConfig {
  enabled: boolean;
  interval: number; // Minutes between autonomous messages
  minResonance: number; // Minimum resonance to continue
  maxTurns: number; // Maximum autonomous turns
  topics?: string[]; // Constrain to specific topics
}

export interface ShareableConversation {
  id: string;
  title: string;
  messages: Array<{
    role: MessageRole;
    content: string;
    model?: AIModel;
  }>;
  resonance: number;
  timestamp: string;
  shareUrl?: string;
}