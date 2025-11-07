import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Message, Conversation, AIModel, Memory} from '../types';

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  messages: Message[];
  memories: Memory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createConversation: (title?: string, models?: AIModel[]) => Conversation;
  setCurrentConversation: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  calculateResonance: () => number;
  clearCurrentConversation: () => void;
  deleteConversation: (conversationId: string) => void;

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

  // Simple resonance calculation based on content similarity
  // In production, this would use embeddings and semantic similarity
  const uniqueModels = new Set(modelMessages.map(m => m.model));
  const modelDiversity = uniqueModels.size / 4; // Max 4 models

  // Calculate based on response patterns
  let totalResonance = 0;
  let comparisons = 0;

  for (let i = 0; i < modelMessages.length - 1; i++) {
    for (let j = i + 1; j < modelMessages.length; j++) {
      if (modelMessages[i].model !== modelMessages[j].model) {
        // Simple similarity based on length and word overlap
        const words1 = new Set(modelMessages[i].content.toLowerCase().split(/\s+/));
        const words2 = new Set(modelMessages[j].content.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        const similarity = intersection.size / union.size;
        totalResonance += similarity;
        comparisons++;
      }
    }
  }

  const averageResonance = comparisons > 0 ? totalResonance / comparisons : 0;

  // Factor in model diversity (more models = potentially higher resonance)
  return Math.min(1, averageResonance * (1 + modelDiversity * 0.2));
};

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      currentConversation: null,
      messages: [],
      memories: [],
      isLoading: false,
      error: null,

      createConversation: (title, models = ['claude-3', 'gpt-4']) => {
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
          messages: [],
        }));

        return conversation;
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

      deleteConversation: (conversationId) => {
        set(state => {
          const updatedConversations = state.conversations.filter(
            c => c.id !== conversationId
          );

          if (state.currentConversationId === conversationId) {
            return {
              conversations: updatedConversations,
              currentConversationId: null,
              currentConversation: null,
              messages: [],
            };
          }

          return {conversations: updatedConversations};
        });
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
        console.log('Memory saved:', memory);
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
        console.log('Syncing to cloud...');
        const state = get();
        console.log('Conversations:', state.conversations.length);
        console.log('Memories:', state.memories.length);
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