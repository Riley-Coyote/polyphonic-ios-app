import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {ChatInput} from '../components/chat/ChatInput';
import {MessageBubble} from '../components/chat/MessageBubble';
import {ModelSelector} from '../components/chat/ModelSelector';
import {ResonanceIndicator} from '../components/chat/ResonanceIndicator';
import {useConversationStore} from '../store/conversationStore';
import {Message, AIModel} from '../types';

export function ChatScreen() {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(['claude-3', 'gpt-4']);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    currentConversation,
    messages,
    addMessage,
    calculateResonance,
  } = useConversationStore();

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    // Simulate parallel AI responses
    try {
      // Here we would call the actual AI APIs
      // For now, simulating responses
      setTimeout(() => {
        selectedModels.forEach((model, index) => {
          setTimeout(() => {
            const aiMessage: Message = {
              id: `${Date.now()}_${model}`,
              role: 'assistant',
              content: `This is a response from ${model.toUpperCase()}. I can see the other models' responses and build upon them.`,
              model,
              timestamp: new Date().toISOString(),
              resonance: Math.random() * 0.3 + 0.7, // Random resonance between 0.7-1.0
            };
            addMessage(aiMessage);
          }, index * 500); // Stagger responses slightly
        });

        setIsLoading(false);

        // Calculate overall resonance
        setTimeout(() => {
          calculateResonance();
        }, selectedModels.length * 500 + 100);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }, [selectedModels, isLoading, addMessage, calculateResonance]);

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