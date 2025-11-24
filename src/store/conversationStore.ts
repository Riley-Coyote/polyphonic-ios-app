import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Message, Conversation, AIModel, Memory} from '../types';
import {conversationStorage, SavedConversation} from '../services/storage/ConversationStorage';
import {ConversationMode} from '../services/conversation/ConversationManager';

export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high' | 'minimal';

interface ConversationState {
  conversations: Conversation[];
  savedConversations: SavedConversation[]; // Loaded from storage
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  currentConversationMode: ConversationMode;
  messages: Message[];
  memories: Memory[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  error: string | null;

  // Reasoning effort settings
  globalReasoningEffort: ReasoningEffort;
  conversationReasoningEffort: Record<string, ReasoningEffort>; // Per-conversation overrides

  // Actions
  createConversation: (title?: string, models?: AIModel[], mode?: ConversationMode) => Promise<Conversation>;
  setCurrentConversation: (conversationId: string) => void;
  loadSavedConversations: () => Promise<void>;
  loadSavedConversation: (id: string) => Promise<void>;
  saveCurrentConversation: () => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  calculateResonance: () => number;
  clearCurrentConversation: () => void;
  deleteConversation: (conversationId: string) => void;

  // Reasoning effort actions
  setGlobalReasoningEffort: (effort: ReasoningEffort) => void;
  setConversationReasoningEffort: (conversationId: string, effort: ReasoningEffort) => void;
  getReasoningEffort: (conversationId?: string) => ReasoningEffort;

  // Memory actions
  saveToMemory: (conversationId: string, type: 'personal' | 'community') => Promise<void>;
  searchMemories: (query: string) => Promise<Memory[]>;

  // Persistence
  loadConversations: () => Promise<void>;
  syncToCloud: () => Promise<void>;
}

const calculateMessageResonance = (messages: Message[]): number => {
  // Calculate resonance based on model agreement patterns
  const modelMessages = messages.filter(m => m.role === 'assistant' && m.model);

  if (modelMessages.length < 2) return 0;

  // Optimized O(n) algorithm using sliding window approach
  // Only compare recent messages within a window to avoid O(n²) complexity
  const WINDOW_SIZE = 5; // Compare only last 5 model responses
  const recentMessages = modelMessages.slice(-WINDOW_SIZE);

  const uniqueModels = new Set(recentMessages.map(m => m.model));
  const modelDiversity = uniqueModels.size / 4; // Max 4 models

  // Build a global word frequency map for all recent messages - O(n)
  const globalWordFreq = new Map<string, number>();
  const messageWordSets: Set<string>[] = [];

  for (const msg of recentMessages) {
    const words = new Set(msg.content.toLowerCase().split(/\s+/));
    messageWordSets.push(words);

    for (const word of words) {
      globalWordFreq.set(word, (globalWordFreq.get(word) || 0) + 1);
    }
  }

  // Calculate consensus score based on shared vocabulary - O(n)
  let consensusScore = 0;
  let totalWords = 0;

  for (const [word, freq] of globalWordFreq) {
    if (freq > 1) {
      // Word appears in multiple messages
      consensusScore += freq / recentMessages.length;
    }
    totalWords++;
  }

  // Normalize consensus score
  const normalizedConsensus = totalWords > 0 ? consensusScore / Math.sqrt(totalWords) : 0;

  // Calculate final resonance with model diversity bonus
  const resonance = Math.min(1, normalizedConsensus * (1 + modelDiversity * 0.2));

  return resonance;
};

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      savedConversations: [],
      currentConversationId: null,
      currentConversation: null,
      currentConversationMode: 'sequential' as ConversationMode,
      messages: [],
      memories: [],
      isLoading: false,
      isLoadingConversations: false,
      error: null,

      // Reasoning effort defaults
      globalReasoningEffort: 'none', // Default for GPT-5.1
      conversationReasoningEffort: {},

      createConversation: async (title, models = ['claude-3', 'gpt-4'], mode = 'sequential') => {
        const conversation: Conversation = {
          id: Date.now().toString(),
          title: title || `Conversation ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
          models,
          resonance: 0,
        };

        set(state => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: conversation.id,
          currentConversation: conversation,
          currentConversationMode: mode,
          messages: [],
        }));

        // Save to storage
        await conversationStorage.setActiveConversationId(conversation.id);

        const savedConversation: SavedConversation = {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          lastMessageAt: conversation.updatedAt,
          messageCount: 0,
          activeModels: models as string[],
          mode,
          messages: [],
          resonanceField: 0,
          preview: "New conversation",
        };

        await conversationStorage.saveConversation(savedConversation);

        return conversation;
      },

      loadSavedConversations: async () => {
        set({ isLoadingConversations: true });
        try {
          const data = await conversationStorage.loadConversations();
          set({
            savedConversations: data.conversations,
            isLoadingConversations: false
          });
        } catch (error) {
          set({ isLoadingConversations: false });
        }
      },

      loadSavedConversation: async (id: string) => {
        set({ isLoading: true });
        try {
          const saved = await conversationStorage.loadConversation(id);
          if (saved) {
            const conversation: Conversation = {
              id: saved.id,
              title: saved.title,
              createdAt: saved.createdAt,
              updatedAt: saved.lastMessageAt,
              messages: saved.messages,
              models: saved.activeModels,
              resonance: saved.resonanceField,
            };

            set({
              currentConversationId: conversation.id,
              currentConversation: conversation,
              currentConversationMode: saved.mode,
              messages: saved.messages,
              isLoading: false,
            });

            await conversationStorage.setActiveConversationId(id);
          }
        } catch (error) {
          set({ isLoading: false });
        }
      },

      saveCurrentConversation: async () => {
        const state = get();
        if (!state.currentConversation) return;

        const saved: SavedConversation = {
          id: state.currentConversation.id,
          title: state.currentConversation.title ||
                 conversationStorage.generateConversationTitle(state.messages),
          createdAt: state.currentConversation.createdAt,
          lastMessageAt: new Date().toISOString(),
          messageCount: state.messages.length,
          activeModels: state.currentConversation.models as string[],
          mode: state.currentConversationMode,
          messages: state.messages,
          resonanceField: state.currentConversation.resonance,
          preview: conversationStorage.generatePreview(state.messages),
        };

        await conversationStorage.saveConversation(saved);

        // Update savedConversations in state
        set(state => ({
          savedConversations: [
            saved,
            ...state.savedConversations.filter(c => c.id !== saved.id)
          ]
        }));
      },

      renameConversation: async (conversationId: string, title: string) => {
        await conversationStorage.renameConversation(conversationId, title);

        set(state => {
          const updatedConversations = state.conversations.map(c =>
            c.id === conversationId ? { ...c, title } : c
          );

          const updatedSavedConversations = state.savedConversations.map(c =>
            c.id === conversationId ? { ...c, title } : c
          );

          const updatedCurrent = state.currentConversation?.id === conversationId
            ? { ...state.currentConversation, title }
            : state.currentConversation;

          return {
            conversations: updatedConversations,
            savedConversations: updatedSavedConversations,
            currentConversation: updatedCurrent,
          };
        });
      },

      setCurrentConversation: (conversationId) => {
        const conversation = get().conversations.find(c => c.id === conversationId);
        if (conversation) {
          set({
            currentConversationId: conversationId,
            currentConversation: conversation,
            messages: conversation.messages,
          });
        }
      },

      addMessage: (message) => {
        set(state => {
          const updatedMessages = [...state.messages, message];

          if (state.currentConversation) {
            const updatedConversation = {
              ...state.currentConversation,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            };

            const updatedConversations = state.conversations.map(c =>
              c.id === state.currentConversationId ? updatedConversation : c
            );

            return {
              messages: updatedMessages,
              currentConversation: updatedConversation,
              conversations: updatedConversations,
            };
          }

          return {messages: updatedMessages};
        });
      },

      updateMessage: (messageId, updates) => {
        set(state => {
          const updatedMessages = state.messages.map(m =>
            m.id === messageId ? {...m, ...updates} : m
          );

          if (state.currentConversation) {
            const updatedConversation = {
              ...state.currentConversation,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            };

            const updatedConversations = state.conversations.map(c =>
              c.id === state.currentConversationId ? updatedConversation : c
            );

            return {
              messages: updatedMessages,
              currentConversation: updatedConversation,
              conversations: updatedConversations,
            };
          }

          return {messages: updatedMessages};
        });
      },

      deleteMessage: (messageId) => {
        set(state => {
          const updatedMessages = state.messages.filter(m => m.id !== messageId);

          if (state.currentConversation) {
            const updatedConversation = {
              ...state.currentConversation,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            };

            const updatedConversations = state.conversations.map(c =>
              c.id === state.currentConversationId ? updatedConversation : c
            );

            return {
              messages: updatedMessages,
              currentConversation: updatedConversation,
              conversations: updatedConversations,
            };
          }

          return {messages: updatedMessages};
        });
      },

      calculateResonance: () => {
        const messages = get().messages;
        const resonance = calculateMessageResonance(messages);

        set(state => {
          if (state.currentConversation) {
            const updatedConversation = {
              ...state.currentConversation,
              resonance,
            };

            const updatedConversations = state.conversations.map(c =>
              c.id === state.currentConversationId ? updatedConversation : c
            );

            return {
              currentConversation: updatedConversation,
              conversations: updatedConversations,
            };
          }

          return state;
        });

        return resonance;
      },

      clearCurrentConversation: () => {
        set({
          currentConversationId: null,
          currentConversation: null,
          messages: [],
        });
      },

      deleteConversation: async (conversationId) => {
        // Delete from storage
        await conversationStorage.deleteConversation(conversationId);

        set(state => {
          const updatedConversations = state.conversations.filter(
            c => c.id !== conversationId
          );

          const updatedSavedConversations = state.savedConversations.filter(
            c => c.id !== conversationId
          );

          if (state.currentConversationId === conversationId) {
            return {
              conversations: updatedConversations,
              savedConversations: updatedSavedConversations,
              currentConversationId: null,
              currentConversation: null,
              messages: [],
            };
          }

          return {
            conversations: updatedConversations,
            savedConversations: updatedSavedConversations,
          };
        });
      },

      // Reasoning effort actions
      setGlobalReasoningEffort: (effort) => {
        set({ globalReasoningEffort: effort });
      },

      setConversationReasoningEffort: (conversationId, effort) => {
        set(state => ({
          conversationReasoningEffort: {
            ...state.conversationReasoningEffort,
            [conversationId]: effort,
          },
        }));
      },

      getReasoningEffort: (conversationId) => {
        const state = get();
        // First check for conversation-specific override
        if (conversationId && state.conversationReasoningEffort[conversationId]) {
          return state.conversationReasoningEffort[conversationId];
        }
        // Fall back to global setting
        return state.globalReasoningEffort;
      },

      saveToMemory: async (conversationId, type) => {
        const conversation = get().conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        const memory: Memory = {
          id: Date.now().toString(),
          conversationId,
          type,
          content: JSON.stringify(conversation.messages),
          metadata: {
            topics: [], // Would be extracted via NLP
            sentiment: 0, // Would be calculated
            importance: conversation.resonance,
            accessCount: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          memories: [...state.memories, memory],
        }));

        // In production, this would sync to backend
      },

      searchMemories: async (query) => {
        // In production, this would query backend with vector search
        const memories = get().memories;

        // Simple text search for now
        const results = memories.filter(m =>
          m.content.toLowerCase().includes(query.toLowerCase())
        );

        return results;
      },

      loadConversations: async () => {
        set({isLoading: true, error: null});

        try {
          // In production, this would fetch from backend
          // For now, just using local storage through Zustand persist
          set({isLoading: false});
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load conversations',
          });
        }
      },

      syncToCloud: async () => {
        // In production, this would sync to backend
        // Currently a no-op until cloud sync is implemented
      },
    }),
    {
      name: 'polyphonic-conversations',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        memories: state.memories,
      }),
    }
  )
);