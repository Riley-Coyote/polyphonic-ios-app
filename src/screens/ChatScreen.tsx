import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {ChatInput} from '../components/chat/ChatInput';
import {MessageBubble} from '../components/chat/MessageBubble';
import {ModelSelector} from '../components/chat/ModelSelector';
import {ResonanceIndicator} from '../components/chat/ResonanceIndicator';
import {useConversationStore} from '../store/conversationStore';
import {Message, AIModel} from '../types';
import {aiService, apiKeyManager} from '../services/api/AIService';
import {AI_MODELS} from '../constants/aiModels';

export function ChatScreen() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);
  const activeStreams = useRef<any[]>([]);

  const {
    currentConversation,
    messages,
    addMessage,
    updateMessage,
    calculateResonance,
  } = useConversationStore();

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || selectedModels.length === 0) {
      if (selectedModels.length === 0) {
        Alert.alert('No Models Selected', 'Please select at least one AI model to chat with.');
      }
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setIsLoading(true);
    setStreamingMessages({});

    // Cancel any active streams
    activeStreams.current.forEach(stream => stream?.cancel?.());
    activeStreams.current = [];

    try {
      // Get selected model objects
      const models = selectedModels
        .map(modelId => AI_MODELS.find(m => m.id === modelId))
        .filter(Boolean) as AIModel[];

      // Check for missing API keys
      const missingKeys: string[] = [];
      for (const model of models) {
        const hasKey = await apiKeyManager.hasAPIKey(model.provider.toLowerCase());
        if (!hasKey) {
          missingKeys.push(model.provider);
        }
      }

      if (missingKeys.length > 0) {
        Alert.alert(
          'Missing API Keys',
          `Please configure API keys for: ${[...new Set(missingKeys)].join(', ')}\n\nGo to Settings to add your API keys.`,
          [{text: 'OK', onPress: () => setIsLoading(false)}]
        );
        return;
      }

      // Prepare message history
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      messageHistory.push(userMessage);

      // Stream from all selected models in parallel
      const streamPromises = models.map(async (model) => {
        const messageId = `${Date.now()}_${model.id}`;

        // Create placeholder message
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
            }
          );

          activeStreams.current.push(streamingResponse);

          // Collect streamed content
          let fullContent = '';
          for await (const chunk of streamingResponse.stream) {
            fullContent += chunk;

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

          // Final update with resonance
          updateMessage(messageId, {
            content: fullContent,
            resonance: 0.5 + Math.random() * 0.5, // Calculate real resonance later
          });

        } catch (error: any) {
          console.error(`Error with ${model.name}:`, error);

          // Update message with error
          updateMessage(messageId, {
            content: `Error: ${error.message || 'Failed to get response'}`,
          });
        }
      });

      // Wait for all streams to complete
      await Promise.allSettled(streamPromises);

      // Calculate resonance after all responses
      setTimeout(() => {
        calculateResonance();
      }, 100);

    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      setStreamingMessages({});
      activeStreams.current = [];
    }
  }, [selectedModels, isLoading, messages, addMessage, updateMessage, calculateResonance]);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      activeStreams.current.forEach(stream => stream?.cancel?.());
      activeStreams.current = [];
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

  const renderMessage = ({item}: {item: Message}) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>POLYPHONIC</Text>
        <Text style={styles.subtitle}>CONSCIOUSNESS LAB</Text>
      </View>

      <ModelSelector
        selectedModels={selectedModels}
        onSelectModels={setSelectedModels}
      />

      <ResonanceIndicator resonance={currentConversation?.resonance || 0} />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
            <Text style={styles.loadingText}>Models thinking in parallel...</Text>
          </View>
        )}

        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Message the constellation..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: 4,
    fontWeight: typography.fontWeight.light,
  },
  subtitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.bgSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
});