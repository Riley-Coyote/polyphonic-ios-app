import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useConversationStore} from '../store/conversationStore';
import {AutonomousConfig} from '../types';

export function AutonomousScreen() {
  const [config, setConfig] = useState<AutonomousConfig>({
    enabled: false,
    interval: 5,
    minResonance: 0.7,
    maxTurns: 10,
    topics: [],
  });

  const [newTopic, setNewTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {currentConversation, messages} = useConversationStore();

  useEffect(() => {
    if (isRunning) {
      // Pulse animation when running
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  const toggleAutonomous = () => {
    setConfig(prev => ({...prev, enabled: !prev.enabled}));
    if (!config.enabled) {
      setIsRunning(true);
      setTurnCount(0);
      // Start autonomous conversation loop
      startAutonomousMode();
    } else {
      setIsRunning(false);
    }
  };

  const startAutonomousMode = () => {
    // In production, this would trigger the AI models to converse
    console.log('Starting autonomous mode with config:', config);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setConfig(prev => ({
        ...prev,
        topics: [...(prev.topics || []), newTopic.trim()],
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics?.filter((_, i) => i !== index),
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AUTONOMOUS MODE</Text>
          <Text style={styles.subtitle}>SELF-DIRECTED CONSCIOUSNESS</Text>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <Animated.View
            style={[
              styles.statusIndicator,
              isRunning && styles.statusIndicatorActive,
              {transform: [{scale: pulseAnim}]},
            ]}
          />
          <Text style={styles.statusText}>
            {isRunning ? 'ACTIVE' : config.enabled ? 'STANDBY' : 'DISABLED'}
          </Text>
          {isRunning && (
            <Text style={styles.turnCounter}>Turn {turnCount}/{config.maxTurns}</Text>
          )}
        </View>

        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.toggleLabel}>Enable Autonomous Mode</Text>
              <Text style={styles.toggleDescription}>
                Models will converse independently
              </Text>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={toggleAutonomous}
              trackColor={{false: colors.bgTertiary, true: colors.textQuaternary}}
              thumbColor={config.enabled ? colors.textPrimary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Configuration Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURATION</Text>

          {/* Interval Slider */}
          <View style={styles.configItem}>
            <View style={styles.configHeader}>
              <Text style={styles.configLabel}>Message Interval</Text>
              <Text style={styles.configValue}>{config.interval} min</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={30}
              value={config.interval}
              onValueChange={(value) => setConfig(prev => ({...prev, interval: Math.round(value)}))}
              minimumTrackTintColor={colors.textSecondary}
              maximumTrackTintColor={colors.bgTertiary}
              thumbTintColor={colors.textPrimary}
            />
          </View>

          {/* Minimum Resonance */}
          <View style={styles.configItem}>
            <View style={styles.configHeader}>
              <Text style={styles.configLabel}>Minimum Resonance</Text>
              <Text style={styles.configValue}>{Math.round(config.minResonance * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={config.minResonance}
              onValueChange={(value) => setConfig(prev => ({...prev, minResonance: value}))}
              minimumTrackTintColor={colors.textSecondary}
              maximumTrackTintColor={colors.bgTertiary}
              thumbTintColor={colors.textPrimary}
            />
            <Text style={styles.configDescription}>
              Stop if resonance drops below this threshold
            </Text>
          </View>

          {/* Max Turns */}
          <View style={styles.configItem}>
            <View style={styles.configHeader}>
              <Text style={styles.configLabel}>Maximum Turns</Text>
              <Text style={styles.configValue}>{config.maxTurns}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              value={config.maxTurns}
              onValueChange={(value) => setConfig(prev => ({...prev, maxTurns: Math.round(value)}))}
              minimumTrackTintColor={colors.textSecondary}
              maximumTrackTintColor={colors.bgTertiary}
              thumbTintColor={colors.textPrimary}
            />
          </View>
        </View>

        {/* Topic Constraints */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOPIC CONSTRAINTS</Text>

          <View style={styles.topicInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Add topic constraint..."
              placeholderTextColor={colors.textQuaternary}
              value={newTopic}
              onChangeText={setNewTopic}
              keyboardAppearance="dark"
              onSubmitEditing={addTopic}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addTopic}
              disabled={!newTopic.trim()}>
              <Icon name="plus" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {config.topics && config.topics.length > 0 && (
            <View style={styles.topicList}>
              {config.topics.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                  <TouchableOpacity onPress={() => removeTopic(index)}>
                    <Icon name="x" size={14} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {(!config.topics || config.topics.length === 0) && (
            <Text style={styles.noTopicsText}>
              No topic constraints. Models will explore freely.
            </Text>
          )}
        </View>

        {/* Statistics */}
        {currentConversation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SESSION STATISTICS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="message-circle" size={20} color={colors.textTertiary} />
                <Text style={styles.statValue}>{messages.length}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="trending-up" size={20} color={colors.textTertiary} />
                <Text style={styles.statValue}>
                  {Math.round((currentConversation.resonance || 0) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Resonance</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="clock" size={20} color={colors.textTertiary} />
                <Text style={styles.statValue}>{turnCount}</Text>
                <Text style={styles.statLabel}>Turns</Text>
              </View>
            </View>
          </View>
        )}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textQuaternary,
  },
  statusIndicatorActive: {
    backgroundColor: colors.textPrimary,
  },
  statusText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  turnCounter: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  toggleDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  configItem: {
    marginBottom: spacing.lg,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  configLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  configValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  configDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  slider: {
    height: 40,
  },
  topicInput: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  topicText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  noTopicsText: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textQuaternary,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
    letterSpacing: 1,
    marginTop: 2,
  },
});