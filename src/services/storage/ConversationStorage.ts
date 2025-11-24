/**
 * ConversationStorage - Handles persistence of conversation data
 * Uses AsyncStorage for local storage with potential for future cloud sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../../types';
import { ConversationMode } from '../conversation/ConversationManager';

export interface SavedConversation {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  activeModels: string[];
  mode: ConversationMode;
  messages: Message[];
  resonanceField: number;
  preview: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface ConversationStorageData {
  conversations: SavedConversation[];
  activeConversationId: string | null;
  lastAccessedAt: string;
}

class ConversationStorage {
  private static STORAGE_KEY = '@polyphonic_conversations';
  private static ACTIVE_CONVERSATION_KEY = '@polyphonic_active_conversation';

  /**
   * Load all conversations from storage
   */
  async loadConversations(): Promise<ConversationStorageData> {
    try {
      const data = await AsyncStorage.getItem(ConversationStorage.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      // Return default state on error
    }

    // Return default empty state
    return {
      conversations: [],
      activeConversationId: null,
      lastAccessedAt: new Date().toISOString(),
    };
  }

  /**
   * Save all conversations to storage
   */
  async saveConversations(data: ConversationStorageData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        ConversationStorage.STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save a single conversation
   */
  async saveConversation(conversation: SavedConversation): Promise<void> {
    const data = await this.loadConversations();

    // Find and update existing or add new
    const existingIndex = data.conversations.findIndex(c => c.id === conversation.id);
    if (existingIndex >= 0) {
      data.conversations[existingIndex] = conversation;
    } else {
      data.conversations.unshift(conversation); // Add to beginning
    }

    // Update last accessed
    data.lastAccessedAt = new Date().toISOString();

    await this.saveConversations(data);
  }

  /**
   * Load a specific conversation by ID
   */
  async loadConversation(id: string): Promise<SavedConversation | null> {
    const data = await this.loadConversations();
    return data.conversations.find(c => c.id === id) || null;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    const data = await this.loadConversations();
    data.conversations = data.conversations.filter(c => c.id !== id);

    // Clear active conversation if it was deleted
    if (data.activeConversationId === id) {
      data.activeConversationId = null;
    }

    await this.saveConversations(data);
  }

  /**
   * Archive/unarchive a conversation
   */
  async archiveConversation(id: string, isArchived: boolean): Promise<void> {
    const data = await this.loadConversations();
    const conversation = data.conversations.find(c => c.id === id);

    if (conversation) {
      conversation.isArchived = isArchived;
      await this.saveConversations(data);
    }
  }

  /**
   * Rename a conversation
   */
  async renameConversation(id: string, title: string): Promise<void> {
    const data = await this.loadConversations();
    const conversation = data.conversations.find(c => c.id === id);

    if (conversation) {
      conversation.title = title;
      await this.saveConversations(data);
    }
  }

  /**
   * Get/Set active conversation ID
   */
  async getActiveConversationId(): Promise<string | null> {
    try {
      const id = await AsyncStorage.getItem(ConversationStorage.ACTIVE_CONVERSATION_KEY);
      return id;
    } catch (error) {
      return null;
    }
  }

  async setActiveConversationId(id: string | null): Promise<void> {
    try {
      if (id) {
        await AsyncStorage.setItem(ConversationStorage.ACTIVE_CONVERSATION_KEY, id);
      } else {
        await AsyncStorage.removeItem(ConversationStorage.ACTIVE_CONVERSATION_KEY);
      }
    } catch (error) {
      // Silently fail on storage errors
    }
  }

  /**
   * Clear all conversations (for debugging/reset)
   */
  async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ConversationStorage.STORAGE_KEY);
      await AsyncStorage.removeItem(ConversationStorage.ACTIVE_CONVERSATION_KEY);
    } catch (error) {
      // Silently fail on storage errors
    }
  }

  /**
   * Export conversation as JSON
   */
  async exportConversation(id: string): Promise<string | null> {
    const conversation = await this.loadConversation(id);
    if (conversation) {
      return JSON.stringify(conversation, null, 2);
    }
    return null;
  }

  /**
   * Generate conversation title from messages
   */
  generateConversationTitle(messages: Message[]): string {
    if (messages.length === 0) return "New Conversation";

    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      // Clean up the content and truncate
      const cleanContent = firstUserMessage.content
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanContent.length > 50) {
        return cleanContent.slice(0, 47) + "...";
      }
      return cleanContent;
    }

    // Fallback to models and date
    const models = [...new Set(messages
      .map(m => m.model)
      .filter(Boolean)
    )];

    if (models.length > 0) {
      return `${models.slice(0, 2).join(' & ')} - ${new Date().toLocaleDateString()}`;
    }

    return `Conversation - ${new Date().toLocaleDateString()}`;
  }

  /**
   * Generate preview text from last message
   */
  generatePreview(messages: Message[]): string {
    if (messages.length === 0) return "No messages yet";

    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content || "";
    const cleanContent = content
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanContent.length > 100) {
      return cleanContent.slice(0, 97) + "...";
    }
    return cleanContent || "Empty message";
  }
}

export const conversationStorage = new ConversationStorage();