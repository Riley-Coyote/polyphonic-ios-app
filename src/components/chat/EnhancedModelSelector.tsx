import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { AI_MODELS, MODEL_CATEGORIES, AIModel } from '../../constants/aiModels';
import { theme } from '../../constants/theme';

interface EnhancedModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  maxSelections?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EnhancedModelSelector: React.FC<EnhancedModelSelectorProps> = ({
  selectedModels,
  onModelsChange,
  maxSelections = 4
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('flagship');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onModelsChange(selectedModels.filter(id => id !== modelId));
    } else if (selectedModels.length < maxSelections) {
      onModelsChange([...selectedModels, modelId]);
    }
  };

  const getSelectedModelObjects = (): AIModel[] => {
    return selectedModels
      .map(id => AI_MODELS.find(m => m.id === id))
      .filter(Boolean) as AIModel[];
  };

  const renderModelCard = (model: AIModel) => {
    const isSelected = selectedModels.includes(model.id);
    const isDisabled = !isSelected && selectedModels.length >= maxSelections;

    return (
      <TouchableOpacity
        key={model.id}
        style={[
          styles.modelCard,
          isSelected && styles.modelCardSelected,
          isDisabled && styles.modelCardDisabled
        ]}
        onPress={() => !isDisabled && toggleModel(model.id)}
        activeOpacity={0.7}
      >
        <View style={styles.modelHeader}>
          <Text style={[styles.modelIcon, isSelected && styles.modelIconSelected]}>
            {model.icon}
          </Text>
          <View style={styles.modelInfo}>
            <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
              {model.name}
            </Text>
            <Text style={styles.modelProvider}>{model.provider}</Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>

        <Text style={styles.modelDescription} numberOfLines={2}>
          {model.description}
        </Text>

        <View style={styles.modelStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Context</Text>
            <Text style={styles.statValue}>
              {model.contextWindow >= 1000000
                ? `${(model.contextWindow / 1000000).toFixed(0)}M`
                : `${(model.contextWindow / 1000).toFixed(0)}K`}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Input</Text>
            <Text style={styles.statValue}>${model.inputCost}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Output</Text>
            <Text style={styles.statValue}>${model.outputCost}</Text>
          </View>
        </View>

        <View style={styles.modelFeatures}>
          {model.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureChip}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Compact Selected Models Display */}
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedModelsScroll}
        >
          {getSelectedModelObjects().map((model, index) => (
            <TouchableOpacity
              key={model.id}
              style={styles.selectedModelChip}
              onPress={openModal}
              activeOpacity={0.8}
            >
              <Text style={styles.selectedModelIcon}>{model.icon}</Text>
              <Text style={styles.selectedModelName}>{model.name}</Text>
            </TouchableOpacity>
          ))}

          {selectedModels.length < maxSelections && (
            <TouchableOpacity
              style={styles.addModelButton}
              onPress={openModal}
              activeOpacity={0.7}
            >
              <Text style={styles.addModelIcon}>⊕</Text>
              <Text style={styles.addModelText}>Add Model</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.configButton}
          onPress={openModal}
        >
          <Text style={styles.configIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Full Model Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View
          style={[styles.modalOverlay, { opacity: fadeAnim }]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT AI MODELS</Text>
              <Text style={styles.modalSubtitle}>
                {selectedModels.length} of {maxSelections} selected
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {Object.entries(MODEL_CATEGORIES).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryTab,
                    selectedCategory === key && styles.categoryTabActive
                  ]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <Text style={[
                    styles.categoryTabText,
                    selectedCategory === key && styles.categoryTabTextActive
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {category.models.length}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Description */}
            <Text style={styles.categoryDescription}>
              {MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES]?.description}
            </Text>

            {/* Model Grid */}
            <ScrollView
              style={styles.modelGrid}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modelGridContent}>
                {MODEL_CATEGORIES[selectedCategory as keyof typeof MODEL_CATEGORIES]?.models.map(model =>
                  renderModelCard(model)
                )}
              </View>
            </ScrollView>

            {/* Selection Summary */}
            <View style={styles.selectionSummary}>
              <View style={styles.selectedModelsList}>
                {getSelectedModelObjects().map(model => (
                  <View key={model.id} style={styles.selectedModelBadge}>
                    <Text style={styles.selectedModelBadgeIcon}>{model.icon}</Text>
                    <Text style={styles.selectedModelBadgeText}>{model.name}</Text>
                    <TouchableOpacity
                      onPress={() => toggleModel(model.id)}
                      style={styles.removeBadge}
                    >
                      <Text style={styles.removeBadgeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={closeModal}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderPrimary,
  },
  selectedModelsScroll: {
    alignItems: 'center',
    paddingRight: 8,
  },
  selectedModelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedModelIcon: {
    fontSize: 16,
    marginRight: 6,
    color: theme.colors.textSecondary,
  },
  selectedModelName: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  addModelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderPrimary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderStyle: 'dashed',
  },
  addModelIcon: {
    fontSize: 16,
    marginRight: 6,
    color: theme.colors.textQuaternary,
  },
  addModelText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textQuaternary,
    letterSpacing: 0.5,
  },
  configButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  configIcon: {
    fontSize: 18,
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    maxHeight: '90%',
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderPrimary,
  },
  modalTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 18,
    color: theme.colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.colors.textTertiary,
  },
  categoryTabs: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderPrimary,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.bgElevated,
  },
  categoryTabText: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginRight: 6,
  },
  categoryTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  categoryCount: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textQuaternary,
    backgroundColor: theme.colors.bgTertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryDescription: {
    fontFamily: theme.fonts.primary,
    fontSize: 11,
    color: theme.colors.textQuaternary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    fontStyle: 'italic',
  },
  modelGrid: {
    flex: 1,
  },
  modelGridContent: {
    padding: 16,
  },
  modelCard: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderPrimary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modelCardSelected: {
    backgroundColor: theme.colors.bgElevated,
    borderColor: theme.colors.borderActive,
  },
  modelCardDisabled: {
    opacity: 0.5,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modelIcon: {
    fontSize: 24,
    marginRight: 12,
    color: theme.colors.textTertiary,
  },
  modelIconSelected: {
    color: theme.colors.textPrimary,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  modelNameSelected: {
    color: theme.colors.textPrimary,
  },
  modelProvider: {
    fontFamily: theme.fonts.primary,
    fontSize: 11,
    color: theme.colors.textQuaternary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: theme.colors.bgPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modelDescription: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    color: theme.colors.textTertiary,
    lineHeight: 16,
    marginBottom: 12,
  },
  modelStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    color: theme.colors.textQuaternary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: theme.fonts.primary,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  modelFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureChip: {
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  featureText: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectionSummary: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderPrimary,
    padding: 16,
  },
  selectedModelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedModelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedModelBadgeIcon: {
    fontSize: 12,
    marginRight: 4,
    color: theme.colors.textSecondary,
  },
  selectedModelBadgeText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  removeBadge: {
    padding: 2,
  },
  removeBadgeText: {
    fontSize: 10,
    color: theme.colors.textQuaternary,
  },
  doneButton: {
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});