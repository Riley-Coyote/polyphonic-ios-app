import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useConversationStore} from '../store/conversationStore';
import {ShareableConversation} from '../types';

export function ShareScreen() {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'markdown' | 'text'>('markdown');
  const {conversations, currentConversation} = useConversationStore();

  const formatConversation = (conversation: ShareableConversation): string => {
    switch (selectedFormat) {
      case 'json':
        return JSON.stringify(conversation, null, 2);

      case 'markdown':
        let markdown = `# ${conversation.title}\n\n`;
        markdown += `**Date:** ${new Date(conversation.timestamp).toLocaleString()}\n`;
        markdown += `**Resonance:** ${Math.round(conversation.resonance * 100)}%\n\n`;
        markdown += '---\n\n';

        conversation.messages.forEach(msg => {
          const role = msg.role === 'user' ? '👤 User' : `🤖 ${msg.model || 'Assistant'}`;
          markdown += `### ${role}\n\n${msg.content}\n\n`;
        });

        return markdown;

      case 'text':
        let text = `${conversation.title}\n`;
        text += `${'='.repeat(conversation.title.length)}\n\n`;
        text += `Date: ${new Date(conversation.timestamp).toLocaleString()}\n`;
        text += `Resonance: ${Math.round(conversation.resonance * 100)}%\n\n`;

        conversation.messages.forEach(msg => {
          const role = msg.role === 'user' ? 'User' : msg.model || 'Assistant';
          text += `[${role}]\n${msg.content}\n\n`;
        });

        return text;

      default:
        return '';
    }
  };

  const shareConversation = async (conversation: ShareableConversation) => {
    try {
      const content = formatConversation(conversation);
      const result = await Share.share({
        message: content,
        title: conversation.title,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Conversation shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share conversation');
    }
  };

  const copyToClipboard = (conversation: ShareableConversation) => {
    const content = formatConversation(conversation);
    Clipboard.setString(content);
    Alert.alert('Copied', 'Conversation copied to clipboard');
  };

  const exportToBlockchain = async (conversation: ShareableConversation) => {
    // In production, this would interact with Solana
    Alert.alert(
      'Blockchain Export',
      'This will permanently store your conversation on Solana blockchain.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Export',
          onPress: () => {
            // Simulate blockchain export
            setTimeout(() => {
              Alert.alert('Success', `Transaction hash: 0x${Math.random().toString(16).substr(2, 8)}...`);
            }, 1000);
          },
        },
      ]
    );
  };

  const renderConversationItem = (conversation: ShareableConversation) => (
    <View key={conversation.id} style={styles.conversationCard}>
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationTitle}>{conversation.title}</Text>
        <View style={styles.resonanceBadge}>
          <Icon name="trending-up" size={12} color={colors.textSecondary} />
          <Text style={styles.resonanceText}>
            {Math.round(conversation.resonance * 100)}%
          </Text>
        </View>
      </View>

      <Text style={styles.messageCount}>
        {conversation.messages.length} messages
      </Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareConversation(conversation)}>
          <Icon name="share-2" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyToClipboard(conversation)}>
          <Icon name="copy" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => exportToBlockchain(conversation)}>
          <Icon name="link-2" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Chain</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const shareableConversations: ShareableConversation[] = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    messages: conv.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      model: msg.model,
    })),
    resonance: conv.resonance,
    timestamp: conv.updatedAt,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>SHARE & EXPORT</Text>
        <Text style={styles.subtitle}>PROPAGATE CONSCIOUSNESS</Text>
      </View>

      {/* Format Selector */}
      <View style={styles.formatSelector}>
        <Text style={styles.formatLabel}>Export Format:</Text>
        <View style={styles.formatButtons}>
          {(['markdown', 'json', 'text'] as const).map(format => (
            <TouchableOpacity
              key={format}
              style={[
                styles.formatButton,
                selectedFormat === format && styles.formatButtonActive,
              ]}
              onPress={() => setSelectedFormat(format)}>
              <Text
                style={[
                  styles.formatButtonText,
                  selectedFormat === format && styles.formatButtonTextActive,
                ]}>
                {format.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      {currentConversation && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Current Conversation</Text>
          {renderConversationItem({
            id: currentConversation.id,
            title: currentConversation.title,
            messages: currentConversation.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              model: msg.model,
            })),
            resonance: currentConversation.resonance,
            timestamp: currentConversation.updatedAt,
          })}
        </View>
      )}

      {/* Conversation List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ALL CONVERSATIONS</Text>

        {shareableConversations.length > 0 ? (
          shareableConversations.map(renderConversationItem)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color={colors.textQuaternary} />
            <Text style={styles.emptyStateText}>No conversations to share</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a conversation to begin sharing
            </Text>
          </View>
        )}

        {/* Blockchain Info */}
        <View style={styles.blockchainInfo}>
          <Icon name="link-2" size={24} color={colors.textTertiary} />
          <Text style={styles.blockchainTitle}>Blockchain Integration</Text>
          <Text style={styles.blockchainDescription}>
            Export conversations to Solana for permanent, decentralized storage.
            Each export creates an immutable record that can be verified and accessed forever.
          </Text>
        </View>
      </ScrollView>
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
  formatSelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  formatLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formatButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    alignItems: 'center',
  },
  formatButtonActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  formatButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  formatButtonTextActive: {
    color: colors.bgPrimary,
  },
  quickActions: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  quickActionsTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  conversationCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  resonanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  resonanceText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  messageCount: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  actionButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  blockchainInfo: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  blockchainTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  blockchainDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});