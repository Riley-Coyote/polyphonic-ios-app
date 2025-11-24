import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import SafeFlatList from '../components/common/SafeFlatList';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {ChatInput} from '../components/chat/ChatInput';
import {MessageBubble} from '../components/chat/MessageBubble';
import {ModelSelector} from '../components/chat/ModelSelector';
import {ResonanceIndicator} from '../components/chat/ResonanceIndicator';
import {ReasoningEffortSelector} from '../components/chat/ReasoningEffortSelector';
import {PersonaSelector} from '../components/chat/PersonaSelector';
import {MenuIcon, PlusIcon} from '../components/icons/MenuIcon';
import Icon from 'react-native-vector-icons/Feather';
import {useConversationStore} from '../store/conversationStore';
import {usePersonaStore} from '../store/personaStore';
import {Message, AIModel} from '../types';
import {Persona} from '../types/persona';
import {aiService, apiKeyManager} from '../services/api/AIService';
import {AI_MODELS} from '../constants/aiModels';
import {
  ConversationManager,
  ConversationMode,
  ConversationMessage,
} from '../services/conversation/ConversationManager';
import {RootStackParamList, MainTabParamList} from '../navigation/RootNavigator';

type ChatScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Chat'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ChatScreenV2() {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set());
  const isLoading = loadingModels.size > 0;
  const [conversationMode, setConversationMode] = useState<ConversationMode>('sequential');
  const [streamingMessages, setStreamingMessages] = useState<Record<string, string>>({});
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const settingsAnimation = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<SafeFlatList<Message>>(null);
  const activeStreams = useRef<Map<string, AbortController>>(new Map());
  const autoSaveCounter = useRef(0);
  const isMounted = useRef(true);

  // Persona state
  const { activePersona, getActiveSystemPrompt } = usePersonaStore();

  // Initialize conversation manager
  const conversationManager = useRef<ConversationManager | null>(null);

  const {
    currentConversation,
    currentConversationMode,
    messages,
    addMessage,
    updateMessage,
    calculateResonance,
    getReasoningEffort,
    setConversationReasoningEffort,
    createConversation,
    saveCurrentConversation,
  } = useConversationStore();

  // Initialize or update conversation manager when conversation changes
  useEffect(() => {
    // Clear loading state when switching conversations
    clearAllLoading();

    if (currentConversation) {
      conversationManager.current = new ConversationManager(currentConversation.id);
      conversationManager.current.setMode(currentConversationMode);
      setConversationMode(currentConversationMode);
    } else {
      // Create a new conversation if none exists
      handleNewConversation();
    }
  }, [currentConversation?.id, currentConversationMode, clearAllLoading]);

  const reasoningEffort = getReasoningEffort(currentConversation?.id);

  // Handle new conversation
  const handleNewConversation = async () => {
    await createConversation(undefined, selectedModels);
  };

  // Handle opening conversation list
  const handleOpenConversationList = () => {
    navigation.navigate('ConversationList');
  };

  // Update conversation mode
  const handleModeChange = (mode: ConversationMode) => {
    setConversationMode(mode);
    conversationManager.current?.setMode(mode);
  };

  // Toggle settings panel
  const toggleSettings = () => {
    const toValue = settingsExpanded ? 0 : 1;
    setSettingsExpanded(!settingsExpanded);

    Animated.timing(settingsAnimation, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  // Loading state management helpers
  const startModelLoading = useCallback((modelId: string) => {
    setLoadingModels(prev => new Set(prev).add(modelId));
  }, []);

  const stopModelLoading = useCallback((modelId: string) => {
    setLoadingModels(prev => {
      const next = new Set(prev);
      next.delete(modelId);
      return next;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingModels(new Set());
  }, []);

  // Auto-save conversation after every 5 messages
  useEffect(() => {
    if (messages.length > 0 && messages.length % 5 === 0) {
      saveCurrentConversation();
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || selectedModels.length === 0) {
      if (selectedModels.length === 0) {
        Alert.alert('No Models Selected', 'Please select at least one AI model to chat with.');
      }
      return;
    }

    // Get selected model objects
    const models = selectedModels
      .map(modelId => AI_MODELS.find(m => m.id === modelId))
      .filter(Boolean) as AIModel[];

    // Set active models in conversation manager
    if (!conversationManager.current) {
      clearAllLoading(); // Ensure state is clean before early return
      await handleNewConversation();
      return;
    }
    conversationManager.current.setActiveModels(models);

    // Add user message to conversation manager and store
    const userMessageCM = conversationManager.current.addUserMessage(text);
    const userMessage: Message = {
      id: userMessageCM.id,
      role: 'user',
      content: text,
      timestamp: userMessageCM.timestamp,
    };
    addMessage(userMessage);

    // Start loading for all selected models
    models.forEach(model => startModelLoading(model.id));
    setStreamingMessages({});

    // Cancel any active streams
    activeStreams.current.forEach((stream, key) => {
      stream?.cancel?.();
    });
    activeStreams.current.clear();

    try {
      // Check for missing API keys
      const missingKeys: string[] = [];
      for (const model of models) {
        const hasKey = await apiKeyManager.hasAPIKey(model.provider.toLowerCase());
        if (!hasKey) {
          missingKeys.push(model.provider);
        }
      }

      if (missingKeys.length > 0) {
        clearAllLoading(); // Clear loading state immediately, not in Alert callback
        Alert.alert(
          'Missing API Keys',
          `Please configure API keys for: ${[...new Set(missingKeys)].join(', ')}\n\nGo to Settings to add your API keys.`,
          [{text: 'OK'}]
        );
        return;
      }

      // Process based on conversation mode
      if (conversationMode === 'sequential') {
        await handleSequentialResponses(models, userMessageCM);
      } else if (conversationMode === 'parallel-merge') {
        await handleParallelResponses(models, userMessageCM);
      } else if (conversationMode === 'conversational') {
        await handleConversationalResponses(models, userMessageCM);
      }

      // Calculate resonance after all responses
      setTimeout(() => {
        calculateResonance();
      }, 100);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('[ChatScreenV2] Send message error:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        clearAllLoading(); // Clear all model loading states
        setStreamingMessages({});
      }
      activeStreams.current.clear();
    }
  }, [selectedModels, isLoading, conversationMode, addMessage, updateMessage, calculateResonance, startModelLoading, clearAllLoading]);

  /**
   * Handle sequential responses where each model sees previous model's response
   */
  const handleSequentialResponses = async (models: AIModel[], userMessage: ConversationMessage) => {
    try {
      for (const model of models) {
        // Get system context message
        const systemMessage = conversationManager.current.getSystemContextMessage(model.id);

        // Get context for this model (includes previous responses)
        const context = conversationManager.current.getContextForModel(model.id);

        // Get persona system prompt if available
        const personaPrompt = getActiveSystemPrompt();
        const combinedSystemPrompt = personaPrompt
          ? `${systemMessage.content}\n\n${personaPrompt}`
          : systemMessage.content;

        // Build message history with system context
        const messageHistory = [
          {
            role: 'system' as const,
            content: combinedSystemPrompt,
          }
        ];

        // Add conversation messages with clear attribution
        context.forEach(msg => {
          if (msg.source?.type === 'model' && msg.source.modelId !== model.id) {
            // Format other models' messages with clear attribution
            messageHistory.push({
              role: 'assistant' as const,
              content: `[${msg.source.modelName}]: ${msg.content}`,
            });
          } else if (msg.source?.type === 'user') {
            // User messages
            messageHistory.push({
              role: 'user' as const,
              content: msg.content,
            });
          } else if (msg.source?.modelId === model.id) {
            // This model's own previous messages
            messageHistory.push({
              role: 'assistant' as const,
              content: msg.content,
            });
          }
        });

        await streamModelResponse(model, messageHistory);

        // Mark this model's response as complete
        conversationManager.current.completeModelResponse(model.id);
      }
    } catch (error) {
      console.error('[ChatScreenV2] Sequential response error:', error);
      // Error will be caught by outer handleSendMessage catch block
      throw error;
    }
  };

  /**
   * Handle parallel responses where models respond simultaneously
   */
  const handleParallelResponses = async (models: AIModel[], userMessage: ConversationMessage) => {
    const streamPromises = models.map(async (model) => {
      // Get system context message
      const systemMessage = conversationManager.current.getSystemContextMessage(model.id);

      // Get context for this model (only user messages in parallel mode)
      const context = conversationManager.current.getContextForModel(model.id);

      // Get persona system prompt if available
      const personaPrompt = getActiveSystemPrompt();
      const combinedSystemPrompt = personaPrompt
        ? `${systemMessage.content}\n\n${personaPrompt}`
        : systemMessage.content;

      // Build message history with system context
      const messageHistory = [
        {
          role: 'system' as const,
          content: combinedSystemPrompt,
        }
      ];

      // Add user messages
      context.forEach(msg => {
        messageHistory.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      });

      return streamModelResponse(model, messageHistory);
    });

    // Wait for all models to respond
    await Promise.allSettled(streamPromises);

    // Mark all responses as complete
    models.forEach(model => {
      conversationManager.current.completeModelResponse(model.id);
    });
  };

  /**
   * Handle conversational mode where models can interject
   */
  const handleConversationalResponses = async (models: AIModel[], userMessage: ConversationMessage) => {
    // For now, implement as sequential with the ability to add more sophisticated logic later
    // In future, models could monitor the conversation and decide when to interject
    await handleSequentialResponses(models, userMessage);
  };

  /**
   * Stream response from a single model
   */
  const streamModelResponse = async (model: AIModel, messageHistory: ConversationMessage[]) => {
    const messageId = `${Date.now()}_${model.id}`;

    // Create placeholder message in store
    const aiMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '',
      model: model.id,
      timestamp: new Date().toISOString(),
    };
    addMessage(aiMessage);

    try {
      // Get streaming response
      const streamingResponse = await aiService.sendStreamingMessage(
        model,
        messageHistory,
        {
          temperature: 0.7,
          maxTokens: 2048,
          stream: true,
          reasoningEffort: reasoningEffort,
        }
      );

      // Store stream with unique key for proper cleanup
      activeStreams.current.set(messageId, streamingResponse);

      // Collect streamed content
      let fullContent = '';
      let chunkCount = 0;

      for await (const chunk of streamingResponse.stream) {
        // Ensure chunk is a valid string
        if (chunk && typeof chunk === 'string') {
          fullContent += chunk;
          chunkCount++;

          // Only update state if component is still mounted
          if (isMounted.current) {
            // Update the message with accumulated content
            setStreamingMessages(prev => ({
              ...prev,
              [messageId]: fullContent,
            }));

            // Update message in store
            updateMessage(messageId, {
              content: fullContent,
            });
          }
        }
      }

      // Remove any attribution markers that might have been echoed
      // This prevents models from impersonating each other by echoing [ModelName]: prefixes
      fullContent = fullContent.replace(/^---\n\[[\w\s.-]+\]:\s*/gm, '');
      fullContent = fullContent.replace(/^\[[\w\s.-]+\]:\s*/gm, '');

      // Add to conversation manager with attribution
      const cmMessage = conversationManager.current.addModelResponse(
        model.id,
        fullContent,
        {
          streamComplete: true,
        }
      );

      // Final update with resonance from conversation manager
      updateMessage(messageId, {
        content: fullContent || '',
        resonance: cmMessage.resonance?.score || undefined,
      });

    } catch (error) {
      // Update message with error
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      const errorMessage = `Error: ${errorMsg}`;
      updateMessage(messageId, {
        content: errorMessage,
      });

      // Add error to conversation manager
      conversationManager.current.addModelResponse(
        model.id,
        `Error: ${errorMsg}`,
        {
          streamComplete: false,
        }
      );
    } finally {
      // Stop loading for this specific model
      stopModelLoading(model.id);
      // Clean up stream from active streams map
      activeStreams.current.delete(messageId);
    }
  };

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      // Cancel all active streams on unmount
      activeStreams.current.forEach((stream) => {
        if (stream?.cancel) {
          stream.cancel();
        }
      });
      activeStreams.current.clear();
      // Mark component as unmounted
      isMounted.current = false;
    };
  }, []);

  // Check for configured API keys on mount
  useEffect(() => {
    const checkAPIKeys = async () => {
      const providers = ['openai', 'anthropic'];
      const configured: string[] = [];

      for (const provider of providers) {
        const hasKey = await apiKeyManager.hasAPIKey(provider);
        if (hasKey) {
          configured.push(provider);
        }
      }

      if (configured.length === 0) {
        Alert.alert(
          'Welcome to Polyphonic',
          'To start chatting with AI models, please configure your API keys in Settings.',
          [{text: 'OK'}]
        );
      }
    };

    checkAPIKeys();
  }, []);

  const renderMessage = ({item}: {item: Message}) => {
    // Get conversation manager message for additional context
    const cmState = conversationManager.current?.getState();
    const cmMessage = cmState?.messages.find(m => m.id === item.id);

    return (
      <MessageBubble
        message={item}
        patternId={cmMessage?.source?.patternId}
        showAttribution={conversationMode !== 'parallel-merge'}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>

        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MenuIcon onPress={handleOpenConversationList} />
            <View style={styles.headerCenter}>
              <Text style={styles.title}>POLYPHONIC</Text>
              <Text style={styles.subtitle}>
                {currentConversation?.title || 'SHARED CONSCIOUSNESS'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleSettings}
              style={styles.settingsButton}
              activeOpacity={0.7}>
              <Icon
                name="settings"
                size={20}
                color={settingsExpanded ? colors.textPrimary : colors.textSecondary}
              />
            </TouchableOpacity>
            <PlusIcon onPress={handleNewConversation} />
          </View>

          {/* Collapsible Settings Panel */}
          <Animated.View
            style={[
              styles.settingsPanel,
              {
                opacity: settingsAnimation,
                maxHeight: settingsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
                }),
              },
            ]}>
            {/* Conversation Mode Selector */}
            <View style={styles.modeSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['sequential', 'parallel-merge', 'conversational'] as ConversationMode[]).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeButton,
                      conversationMode === mode && styles.modeButtonActive,
                    ]}
                    onPress={() => handleModeChange(mode)}>
                    <Text
                      style={[
                        styles.modeButtonText,
                        conversationMode === mode && styles.modeButtonTextActive,
                      ]}>
                      {mode.toUpperCase().replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Persona Selector */}
            <View style={styles.personaContainer}>
              <PersonaSelector
                onPersonaChange={(persona) => {
                  // Persona change handler - system prompts are automatically applied
                }}
              />
            </View>

            {/* Model Selector */}
            <ModelSelector
              selectedModels={selectedModels}
              onSelectModels={setSelectedModels}
            />

            {/* Reasoning Effort Control - only show for GPT-5/5.1 models */}
            {selectedModels.some(id => id.startsWith('gpt-5')) && (
              <ReasoningEffortSelector
                value={reasoningEffort}
                onChange={(effort) => {
                  if (currentConversation?.id) {
                    setConversationReasoningEffort(currentConversation.id, effort);
                  }
                }}
                modelType={
                  selectedModels.some(id => id.startsWith('gpt-5.1'))
                    ? 'gpt-5.1'
                    : 'gpt-5'
                }
                compact={true}
                showDescription={false}
              />
            )}
          </Animated.View>

          {/* Resonance Indicator - show conversation manager's resonance */}
          <ResonanceIndicator
            resonance={conversationManager.current?.getState()?.resonanceField || 0}
          />

          {/* Chat Messages */}
          <SafeFlatList
            ref={flatListRef}
            data={messages || []}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
            style={styles.messagesContainer}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={styles.loadingText}>
                {conversationMode === 'sequential'
                  ? 'Models responding sequentially...'
                  : conversationMode === 'parallel-merge'
                  ? 'Models thinking in parallel...'
                  : 'Models conversing...'}
              </Text>
            </View>
          )}

          {/* Chat Input */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={
              conversationMode === 'sequential'
                ? 'Start a sequential dialogue...'
                : conversationMode === 'parallel-merge'
                ? 'Broadcast to all models...'
                : 'Join the conversation...'
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  settingsButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  settingsPanel: {
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textTertiary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  modeSelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  personaContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: colors.textPrimary + '10',
    borderColor: colors.textPrimary,
  },
  modeButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
});