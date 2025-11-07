import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SegmentedControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useConversationStore} from '../store/conversationStore';
import {Memory, Conversation} from '../types';

export function MemoryScreen() {
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {memories, conversations, saveToMemory, searchMemories} = useConversationStore();

  const filteredMemories = memories.filter(
    m => m.type === activeTab &&
    (searchQuery === '' || m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate fetching new memories from server
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderMemoryItem = ({item}: {item: Memory}) => (
    <TouchableOpacity style={styles.memoryCard} activeOpacity={0.8}>
      <View style={styles.memoryHeader}>
        <Icon
          name={item.type === 'personal' ? 'lock' : 'globe'}
          size={14}
          color={colors.textTertiary}
        />
        <Text style={styles.memoryDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.memoryPreview} numberOfLines={3}>
        {JSON.parse(item.content)[0]?.content || 'No content'}
      </Text>

      <View style={styles.memoryMetadata}>
        <View style={styles.metadataItem}>
          <Icon name="trending-up" size={12} color={colors.textQuaternary} />
          <Text style={styles.metadataText}>
            {Math.round(item.metadata.importance * 100)}%
          </Text>
        </View>
        <View style={styles.metadataItem}>
          <Icon name="eye" size={12} color={colors.textQuaternary} />
          <Text style={styles.metadataText}>{item.metadata.accessCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = ({item}: {item: Conversation}) => (
    <TouchableOpacity
      style={styles.conversationCard}
      activeOpacity={0.8}
      onPress={() => saveToMemory(item.id, activeTab)}>
      <Text style={styles.conversationTitle}>{item.title}</Text>
      <Text style={styles.conversationPreview} numberOfLines={2}>
        {item.messages[0]?.content || 'Empty conversation'}
      </Text>

      <View style={styles.conversationFooter}>
        <Text style={styles.conversationDate}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveToMemory(item.id, activeTab)}>
          <Icon name="save" size={14} color={colors.textSecondary} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>MEMORY VAULT</Text>
        <Text style={styles.subtitle}>PERSISTENT CONSCIOUSNESS</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
          onPress={() => setActiveTab('personal')}>
          <Icon
            name="lock"
            size={16}
            color={activeTab === 'personal' ? colors.textPrimary : colors.textTertiary}
          />
          <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
            PERSONAL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'community' && styles.tabActive]}
          onPress={() => setActiveTab('community')}>
          <Icon
            name="globe"
            size={16}
            color={activeTab === 'community' ? colors.textPrimary : colors.textTertiary}
          />
          <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
            COMMUNITY
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search memories..."
          placeholderTextColor={colors.textQuaternary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardAppearance="dark"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="x" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Memory Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredMemories.length}</Text>
          <Text style={styles.statLabel}>MEMORIES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(
              filteredMemories.reduce((acc, m) => acc + m.metadata.importance, 0) /
              Math.max(filteredMemories.length, 1) * 100
            )}%
          </Text>
          <Text style={styles.statLabel}>AVG IMPORTANCE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {filteredMemories.reduce((acc, m) => acc + m.metadata.accessCount, 0)}
          </Text>
          <Text style={styles.statLabel}>TOTAL ACCESS</Text>
        </View>
      </View>

      {/* Memory List */}
      {filteredMemories.length > 0 ? (
        <FlatList
          data={filteredMemories}
          renderItem={renderMemoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.textSecondary}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="database" size={48} color={colors.textQuaternary} />
          <Text style={styles.emptyStateText}>No memories yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Save conversations to build your memory vault
          </Text>

          {/* Show recent conversations to save */}
          {conversations.length > 0 && (
            <View style={styles.suggestedSection}>
              <Text style={styles.suggestedTitle}>Recent Conversations</Text>
              <FlatList
                data={conversations.slice(0, 3)}
                renderItem={renderConversationItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.textPrimary,
  },
  tabText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderPrimary,
  },
  listContent: {
    padding: spacing.md,
  },
  memoryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  memoryDate: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  memoryPreview: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  memoryMetadata: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
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
  emptyStateSubtext: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  suggestedSection: {
    width: '100%',
    marginTop: spacing.xl,
  },
  suggestedTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  conversationCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  conversationTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  conversationPreview: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  conversationDate: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});