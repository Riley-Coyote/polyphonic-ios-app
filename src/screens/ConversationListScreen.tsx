import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useConversationStore} from '../store/conversationStore';
import {SavedConversation} from '../services/storage/ConversationStorage';
import {PlusIcon} from '../components/icons/MenuIcon';

export function ConversationListScreen() {
  const navigation = useNavigation<any>();
  const {
    savedConversations,
    isLoadingConversations,
    loadSavedConversations,
    loadSavedConversation,
    deleteConversation,
    renameConversation,
  } = useConversationStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedConversations();
  }, []);

  const handleConversationPress = async (conversation: SavedConversation) => {
    await loadSavedConversation(conversation.id);
    navigation.goBack();
  };

  const handleConversationLongPress = (conversation: SavedConversation) => {
    setSelectedId(conversation.id);
    Alert.alert(
      'Conversation Options',
      conversation.title,
      [
        {
          text: 'Rename',
          onPress: () => handleRename(conversation),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(conversation),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setSelectedId(null),
        },
      ]
    );
  };

  const handleRename = (conversation: SavedConversation) => {
    Alert.prompt(
      'Rename Conversation',
      'Enter a new title:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Rename',
          onPress: async (newTitle) => {
            if (newTitle && newTitle.trim()) {
              await renameConversation(conversation.id, newTitle.trim());
              await loadSavedConversations();
            }
          },
        },
      ],
      'plain-text',
      conversation.title
    );
  };

  const handleDelete = (conversation: SavedConversation) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteConversation(conversation.id);
            setSelectedId(null);
          },
        },
      ]
    );
  };

  const handleNewConversation = async () => {
    const {createConversation} = useConversationStore.getState();
    await createConversation();
    navigation.goBack();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversationItem = ({item}: {item: SavedConversation}) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, isSelected && styles.conversationCardSelected]}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleConversationLongPress(item)}
        activeOpacity={0.7}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.conversationTime}>
            {formatTimeAgo(item.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.conversationModels}>
          {item.activeModels.slice(0, 3).map((model, index) => (
            <View key={index} style={styles.modelTag}>
              <Text style={styles.modelTagText}>
                {model.toUpperCase().replace('-', ' ')}
              </Text>
            </View>
          ))}
          {item.activeModels.length > 3 && (
            <Text style={styles.moreModels}>+{item.activeModels.length - 3}</Text>
          )}
        </View>

        <Text style={styles.conversationPreview} numberOfLines={2}>
          {item.preview}
        </Text>

        <View style={styles.conversationFooter}>
          <View style={styles.messageCount}>
            <Icon name="message-circle" size={12} color={colors.textQuaternary} />
            <Text style={styles.messageCountText}>{item.messageCount}</Text>
          </View>

          {item.resonanceField > 0 && (
            <View style={styles.resonanceContainer}>
              <Text style={styles.resonanceLabel}>Resonance</Text>
              <View style={styles.resonanceBar}>
                <View
                  style={[
                    styles.resonanceFill,
                    {width: `${item.resonanceField * 100}%`},
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="message-square" size={48} color={colors.textQuaternary} />
      <Text style={styles.emptyStateTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyStateText}>
        Start a new conversation to begin exploring multi-model interactions
      </Text>
      <TouchableOpacity style={styles.newConversationButton} onPress={handleNewConversation}>
        <Text style={styles.newConversationButtonText}>START YOUR FIRST CONVERSATION</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONVERSATIONS</Text>
        <PlusIcon onPress={handleNewConversation} />
      </View>

      {isLoadingConversations ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textSecondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {savedConversations.length === 0 ? (
            renderEmptyState()
          ) : (
            savedConversations.map((item) => (
              <React.Fragment key={item.id}>
                {renderConversationItem({item})}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    ...Platform.select({
      ios: {
        paddingTop: 0,
        marginTop: 0,
      },
    }),
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  conversationCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  conversationCardSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.bgElevated,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  conversationTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  conversationTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
  },
  conversationModels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  modelTag: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  modelTagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
  moreModels: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  conversationPreview: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.system,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageCountText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
    marginLeft: spacing.xs,
  },
  resonanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.md,
  },
  resonanceLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
    marginRight: spacing.xs,
  },
  resonanceBar: {
    flex: 1,
    height: 2,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
  },
  resonanceFill: {
    height: '100%',
    backgroundColor: colors.resonanceHigh,
    borderRadius: borderRadius.full,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.system,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  newConversationButton: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  newConversationButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});