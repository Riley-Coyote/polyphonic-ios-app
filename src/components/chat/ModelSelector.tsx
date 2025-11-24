import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  SectionList,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';
import {AI_MODELS, getModelsByCategory} from '../../constants/aiModels';
import {springConfig, pressAnimation} from '../../utils/animations';

interface ModelSelectorProps {
  selectedModels: string[];
  onSelectModels: (models: string[]) => void;
  maxModels?: number;
}

export function ModelSelector({
  selectedModels,
  onSelectModels,
  maxModels = 5,
}: ModelSelectorProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const modalSlideAnim = React.useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = React.useRef(new Animated.Value(0)).current;

  // Organize models by category
  const modelSections = useMemo(() => {
    const categories = getModelsByCategory();
    return Object.entries(categories).map(([category, models]) => ({
      title: category.toUpperCase(),
      data: models,
    }));
  }, []);

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onSelectModels(selectedModels.filter(m => m !== modelId));
    } else if (selectedModels.length < maxModels) {
      onSelectModels([...selectedModels, modelId]);
    }
  };

  // Get icon for provider
  const getProviderIcon = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'circle';
      case 'anthropic': return 'hexagon';
      case 'google': return 'triangle';
      case 'meta': return 'square';
      case 'moonshot': return 'moon';
      case 'deepseek': return 'layers';
      case 'xai': return 'zap';
      default: return 'box';
    }
  };

  const handlePress = () => {
    pressAnimation(scaleAnim).start();
    setModalVisible(true);

    // Animate modal in
    Animated.parallel([
      Animated.spring(modalSlideAnim, {
        toValue: 0,
        ...springConfig,
        velocity: 2,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    // Animate modal out
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 300,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handlePress}
          style={styles.selectorButton}
          activeOpacity={0.8}
          // Accessibility props
          accessible={true}
          accessibilityLabel={
            selectedModels.length > 0
              ? `Selected models: ${selectedModels.map(id =>
                  AI_MODELS.find(m => m.id === id)?.name
                ).join(', ')}`
              : 'No models selected'
          }
          accessibilityHint="Double tap to open model selection menu"
          accessibilityRole="button"
          accessibilityState={{expanded: isModalVisible}}
        >
          <Animated.View
            style={[
              styles.buttonContent,
              {transform: [{scale: scaleAnim}]},
            ]}
            accessible={false} // Let parent handle accessibility
          >
            <Text style={styles.label}>MODELS</Text>
            <View style={styles.selectedModelsContainer}>
              {selectedModels.length > 0 ? (
                selectedModels.map(modelId => {
                  const model = AI_MODELS.find(m => m.id === modelId);
                  return model ? (
                    <View key={modelId} style={styles.modelChip} importantForAccessibility="no">
                      <Icon name={getProviderIcon(model.provider)} size={12} color={colors.textSecondary} />
                      <Text style={styles.modelChipText} numberOfLines={1}>{model.name}</Text>
                    </View>
                  ) : null;
                })
              ) : (
                <Text style={styles.placeholderText}>Select models</Text>
              )}
            </View>
            <Icon
              name={isModalVisible ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textTertiary}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
          accessible={true}
          accessibilityLabel="Close model selection"
          accessibilityRole="button"
          accessibilityHint="Tap outside to close"
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            accessible={false} // Let children handle accessibility
          >
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
                accessibilityLevel={1}
              >
                Select Models
              </Text>
              <Text
                style={styles.modalSubtitle}
                accessible={true}
                accessibilityRole="text"
              >
                Choose up to {maxModels} models for parallel processing
              </Text>
            </View>

            <SectionList
              style={styles.modelList}
              sections={modelSections}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({section}) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
              )}
              renderItem={({item: model}) => {
                const isSelected = selectedModels.includes(model.id);
                const isDisabled = !isSelected && selectedModels.length >= maxModels;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modelOption,
                      isSelected && styles.modelOptionSelected,
                      isDisabled && styles.modelOptionDisabled,
                    ]}
                    onPress={() => toggleModel(model.id)}
                    disabled={isDisabled}
                    // Accessibility props
                    accessible={true}
                    accessibilityLabel={`${model.name}: ${model.provider}`}
                    accessibilityHint={
                      isDisabled
                        ? `Maximum of ${maxModels} models reached. Deselect another model first.`
                        : isSelected
                        ? "Double tap to deselect this model"
                        : "Double tap to select this model"
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: isSelected,
                      disabled: isDisabled,
                    }}
                  >
                    <View style={styles.modelInfo} importantForAccessibility="no">
                      <View style={styles.modelIconContainer} importantForAccessibility="no">
                        <Icon
                          name={getProviderIcon(model.provider)}
                          size={20}
                          color={
                            isSelected
                              ? colors.textPrimary
                              : isDisabled
                              ? colors.textDisabled
                              : colors.textTertiary
                          }
                        />
                      </View>
                      <View style={styles.modelDetails} importantForAccessibility="no">
                        <Text
                          style={[
                            styles.modelName,
                            isDisabled && styles.textDisabled,
                          ]}
                          numberOfLines={1}>
                          {model.name}
                        </Text>
                        <Text
                          style={[
                            styles.modelDescription,
                            isDisabled && styles.textDisabled,
                          ]}
                          numberOfLines={1}>
                          {model.provider} • {model.contextWindow?.toLocaleString()} tokens
                        </Text>
                      </View>
                    </View>
                    <View style={styles.checkboxContainer} importantForAccessibility="no">
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}>
                        {isSelected && (
                          <Icon name="check" size={14} color={colors.bgPrimary} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
              accessible={true}
              accessibilityLabel="Done selecting models"
              accessibilityRole="button"
              accessibilityHint="Double tap to close model selection"
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  selectorButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginRight: spacing.sm,
  },
  selectedModelsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    gap: 4,
  },
  modelChipText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textQuaternary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '70%',
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
  },
  modalHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  modelList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionHeader: {
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    fontWeight: typography.fontWeight.semibold,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  modelOptionSelected: {
    borderColor: colors.borderActive,
    backgroundColor: colors.bgElevated,
  },
  modelOptionDisabled: {
    opacity: 0.5,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  modelDetails: {
    flex: 1,
  },
  modelName: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  modelDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.textDisabled,
  },
  checkboxContainer: {
    marginLeft: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  modalCloseButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.bgPrimary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 1,
  },
});