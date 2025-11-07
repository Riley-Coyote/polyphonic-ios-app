import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useRoute, useNavigation} from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useConversationStore} from '../store/conversationStore';
import {MessageBubble} from '../components/chat/MessageBubble';
import {ResonanceIndicator} from '../components/chat/ResonanceIndicator';
import {RootStackParamList} from '../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'ConversationDetail'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ConversationDetail'>;

export function ConversationDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const {conversationId} = route.params;

  const {conversations, setCurrentConversation} = useConversationStore();
  const conversation = conversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversationId);
    }
  }, [conversationId, conversation, setCurrentConversation]);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="alert-circle" size={48} color={colors.textQuaternary} />
          <Text style={styles.emptyStateText}>Conversation not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderMessage = ({item}: {item: any}) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Conversation Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{conversation.title}</Text>
          <Text style={styles.metadata}>
            {conversation.messages.length} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.modelChips}>
          {conversation.models.map(model => (
            <View key={model} style={styles.modelChip}>
              <Text style={styles.modelChipText}>{model.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Resonance Indicator */}
      <ResonanceIndicator resonance={conversation.resonance} />

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="edit-3" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-2" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="save" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Memory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="link-2" size={16} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Chain</Text>
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
        data={conversation.messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Continue Conversation Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('Main')}>
        <Icon name="message-circle" size={20} color={colors.bgPrimary} />
        <Text style={styles.continueButtonText}>Continue Conversation</Text>
      </TouchableOpacity>
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
  },
  headerInfo: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metadata: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  modelChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modelChip: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  modelChipText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textPrimary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  continueButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.bgPrimary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  backButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  backButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
});