import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';

export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high' | 'minimal';

interface ReasoningEffortOption {
  value: ReasoningEffort;
  label: string;
  description: string;
  icon: string;
  speedLabel: string;
  costLabel: string;
  forModel: 'gpt-5.1' | 'gpt-5' | 'both';
}

const REASONING_OPTIONS: ReasoningEffortOption[] = [
  {
    value: 'none',
    label: 'None',
    description: 'No reasoning • Fastest • Lowest cost',
    icon: 'zap',
    speedLabel: 'Instant',
    costLabel: '$',
    forModel: 'gpt-5.1',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Basic reasoning • Very fast • Low cost',
    icon: 'zap',
    speedLabel: 'Very Fast',
    costLabel: '$',
    forModel: 'gpt-5',
  },
  {
    value: 'low',
    label: 'Low',
    description: 'Moderate reasoning • Fast • Low cost',
    icon: 'wind',
    speedLabel: 'Fast',
    costLabel: '$$',
    forModel: 'gpt-5.1',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Significant reasoning • Moderate speed',
    icon: 'activity',
    speedLabel: 'Moderate',
    costLabel: '$$$',
    forModel: 'both',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Maximum reasoning • Slower • Highest cost',
    icon: 'cpu',
    speedLabel: 'Slower',
    costLabel: '$$$$',
    forModel: 'gpt-5.1',
  },
];

interface ReasoningEffortSelectorProps {
  value: ReasoningEffort;
  onChange: (value: ReasoningEffort) => void;
  modelType: 'gpt-5.1' | 'gpt-5' | 'auto';
  showDescription?: boolean;
  compact?: boolean;
}

export function ReasoningEffortSelector({
  value,
  onChange,
  modelType,
  showDescription = true,
  compact = false,
}: ReasoningEffortSelectorProps) {
  // Filter options based on model type
  const availableOptions = REASONING_OPTIONS.filter(option => {
    if (modelType === 'auto') return option.forModel !== 'gpt-5'; // Show 5.1 options by default
    if (modelType === 'gpt-5.1') return option.forModel === 'gpt-5.1' || option.forModel === 'both';
    if (modelType === 'gpt-5') return option.forModel === 'gpt-5' || option.forModel === 'both';
    return true;
  });

  const getReasoningInfo = (effort: ReasoningEffort) => {
    return REASONING_OPTIONS.find(opt => opt.value === effort);
  };

  const selectedInfo = getReasoningInfo(value);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Icon name="cpu" size={14} color={colors.textTertiary} />
          <Text style={styles.compactLabel}>Reasoning</Text>
        </View>
        <View style={styles.compactOptions}>
          {availableOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.compactOption,
                value === option.value && styles.compactOptionSelected,
              ]}
              onPress={() => onChange(option.value)}
              accessible={true}
              accessibilityLabel={`${option.label} reasoning effort`}
              accessibilityHint={option.description}
              accessibilityRole="button"
              accessibilityState={{selected: value === option.value}}
            >
              <Text
                style={[
                  styles.compactOptionText,
                  value === option.value && styles.compactOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="cpu" size={18} color={colors.textSecondary} />
          <Text style={styles.title}>Reasoning Effort</Text>
        </View>
        {selectedInfo && (
          <View style={styles.selectedBadge}>
            <Icon name={selectedInfo.icon} size={12} color={colors.textPrimary} />
            <Text style={styles.selectedText}>{selectedInfo.label}</Text>
          </View>
        )}
      </View>

      {showDescription && (
        <Text style={styles.subtitle}>
          {modelType === 'gpt-5.1'
            ? 'Control how much thinking time GPT-5.1 uses'
            : modelType === 'gpt-5'
            ? 'Control reasoning depth for GPT-5'
            : 'Adjust reasoning effort for better speed or intelligence'}
        </Text>
      )}

      <View style={styles.optionsContainer}>
        {availableOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${option.label} reasoning effort: ${option.description}`}
            accessibilityRole="radio"
            accessibilityState={{
              selected: value === option.value,
              checked: value === option.value,
            }}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.radio,
                    value === option.value && styles.radioSelected,
                  ]}
                >
                  {value === option.value && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <View style={styles.optionInfo}>
                  <View style={styles.optionHeader}>
                    <Icon
                      name={option.icon}
                      size={16}
                      color={
                        value === option.value
                          ? colors.textPrimary
                          : colors.textTertiary
                      }
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        value === option.value && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <View style={styles.metricBadge}>
                  <Icon name="zap" size={10} color={colors.textQuaternary} />
                  <Text style={styles.metricText}>{option.speedLabel}</Text>
                </View>
                <View style={styles.metricBadge}>
                  <Icon name="dollar-sign" size={10} color={colors.textQuaternary} />
                  <Text style={styles.metricText}>{option.costLabel}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Icon name="info" size={14} color={colors.textTertiary} />
        <Text style={styles.infoText}>
          {modelType === 'gpt-5.1'
            ? "GPT-5.1 defaults to 'none' for speed. Use 'low'/'medium' for complex tasks."
            : modelType === 'gpt-5'
            ? "GPT-5 defaults to 'medium'. Use 'minimal' for fastest responses."
            : "Higher effort = more thinking time = higher cost but better intelligence."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  selectedText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  optionSelected: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.borderActive,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.textPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textPrimary,
  },
  optionInfo: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  optionLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.textPrimary,
  },
  optionDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  optionRight: {
    gap: 4,
    alignItems: 'flex-end',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  // Compact mode styles
  compactContainer: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  compactLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  compactOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  compactOption: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    alignItems: 'center',
  },
  compactOptionSelected: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.borderActive,
  },
  compactOptionText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  compactOptionTextSelected: {
    color: colors.textPrimary,
  },
});