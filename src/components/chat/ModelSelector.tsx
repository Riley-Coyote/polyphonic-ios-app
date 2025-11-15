import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';
import {AIModel} from '../../types';

interface ModelSelectorProps {
  selectedModels: AIModel[];
  onSelectModels: (models: AIModel[]) => void;
  maxModels?: number;
}

const AVAILABLE_MODELS: Array<{
  id: AIModel;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'claude-3',
    name: 'Claude 3',
    description: 'Anthropic\'s advanced reasoning',
    icon: 'hexagon',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI\'s latest model',
    icon: 'circle',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s multimodal AI',
    icon: 'triangle',
  },
  {
    id: 'llama',
    name: 'Llama',
    description: 'Meta\'s open source model',
    icon: 'square',
  },
];

export function ModelSelector({
  selectedModels,
  onSelectModels,
  maxModels = 3,
}: ModelSelectorProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const toggleModel = (modelId: AIModel) => {
    if (selectedModels.includes(modelId)) {
      onSelectModels(selectedModels.filter(m => m !== modelId));
    } else if (selectedModels.length < maxModels) {
      onSelectModels([...selectedModels, modelId]);
    }
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setModalVisible(true);
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
                  AVAILABLE_MODELS.find(m => m.id === id)?.name
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
                  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
                  return model ? (
                    <View key={modelId} style={styles.modelChip} importantForAccessibility="no">
                      <Icon name={model.icon} size={12} color={colors.textSecondary} />
                      <Text style={styles.modelChipText}>{model.name}</Text>
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
        onRequestClose={() => setModalVisible(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          accessible={true}
          accessibilityLabel="Close model selection"
          accessibilityRole="button"
          accessibilityHint="Tap outside to close"
        >
          <View
            style={styles.modalContent}
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

            <ScrollView
              style={styles.modelList}
              accessible={false} // Let children handle accessibility
            >
              {AVAILABLE_MODELS.map(model => {
                const isSelected = selectedModels.includes(model.id);
                const isDisabled = !isSelected && selectedModels.length >= maxModels;

                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelOption,
                      isSelected && styles.modelOptionSelected,
                      isDisabled && styles.modelOptionDisabled,
                    ]}
                    onPress={() => toggleModel(model.id)}
                    disabled={isDisabled}
                    // Accessibility props
                    accessible={true}
                    accessibilityLabel={`${model.name}: ${model.description}`}
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
                          name={model.icon}
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
                          ]}>
                          {model.name}
                        </Text>
                        <Text
                          style={[
                            styles.modelDescription,
                            isDisabled && styles.textDisabled,
                          ]}>
                          {model.description}
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
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              accessible={true}
              accessibilityLabel="Done selecting models"
              accessibilityRole="button"
              accessibilityHint="Double tap to close model selection"
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '70%',
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
    padding: spacing.md,
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