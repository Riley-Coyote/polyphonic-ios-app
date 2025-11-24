import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { usePersonaStore } from '../../store/personaStore';
import { Persona } from '../../types/persona';
import { fadeInAnimation, pressAnimation } from '../../utils/animations';

interface PersonaSelectorProps {
  onPersonaChange?: (persona: Persona | null) => void;
}

export function PersonaSelector({ onPersonaChange }: PersonaSelectorProps) {
  const navigation = useNavigation<any>();
  const [showModal, setShowModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const {
    personas,
    activePersona,
    templates,
    isLoadingPersonas,
    loadPersonas,
    setActivePersona,
    createFromTemplate,
  } = usePersonaStore();

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    if (showModal) {
      fadeInAnimation(fadeAnim).start();
    }
  }, [showModal]);

  const handleSelectPersona = async (persona: Persona | null) => {
    try {
      await setActivePersona(persona);
      onPersonaChange?.(persona);
      setShowModal(false);
    } catch (error) {
      console.error('Error selecting persona:', error);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const newPersona = await createFromTemplate(template);
      await handleSelectPersona(newPersona);
    } catch (error) {
      console.error('Error creating persona from template:', error);
    }
  };

  const renderPersonaItem = (persona: Persona) => {
    const isActive = activePersona?.id === persona.id;

    return (
      <TouchableOpacity
        key={persona.id}
        style={[styles.personaItem, isActive && styles.personaItemActive]}
        onPress={() => handleSelectPersona(persona)}
        activeOpacity={0.7}>
        <View style={styles.personaAvatar}>
          <Text style={styles.personaAvatarText}>
            {persona.avatar || '🤖'}
          </Text>
        </View>
        <View style={styles.personaInfo}>
          <Text style={styles.personaName}>{persona.name}</Text>
          <Text style={styles.personaDescription} numberOfLines={1}>
            {persona.description}
          </Text>
          <View style={styles.personaTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{persona.personality.tone}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{persona.personality.empathy}</Text>
            </View>
          </View>
        </View>
        {isActive && (
          <Icon name="check-circle" size={20} color={colors.textPrimary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderTemplateItem = (template: any) => (
    <TouchableOpacity
      key={template.id}
      style={styles.templateItem}
      onPress={() => handleCreateFromTemplate(template)}
      activeOpacity={0.7}>
      <View style={styles.templateIcon}>
        <Text style={styles.templateIconText}>{template.icon}</Text>
      </View>
      <Text style={styles.templateName}>{template.name}</Text>
      <Icon name="plus" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}>
        <View style={styles.selectorContent}>
          {activePersona ? (
            <>
              <Text style={styles.selectorAvatar}>
                {activePersona.avatar || '🤖'}
              </Text>
              <Text style={styles.selectorLabel}>{activePersona.name}</Text>
            </>
          ) : (
            <>
              <Icon name="user" size={16} color={colors.textSecondary} />
              <Text style={styles.selectorLabel}>Select Persona</Text>
            </>
          )}
          <Icon name="chevron-down" size={16} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          />
          <SafeAreaView style={styles.modalContentWrapper}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT PERSONA</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}>
                <Icon name="x" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {isLoadingPersonas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.textSecondary} />
              </View>
            ) : (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}>
                {/* Default option (no persona) */}
                <TouchableOpacity
                  style={[
                    styles.personaItem,
                    !activePersona && styles.personaItemActive,
                  ]}
                  onPress={() => handleSelectPersona(null)}
                  activeOpacity={0.7}>
                  <View style={styles.personaAvatar}>
                    <Icon name="zap" size={24} color={colors.textSecondary} />
                  </View>
                  <View style={styles.personaInfo}>
                    <Text style={styles.personaName}>Default AI</Text>
                    <Text style={styles.personaDescription}>
                      Standard AI behavior without customization
                    </Text>
                  </View>
                  {!activePersona && (
                    <Icon name="check-circle" size={20} color={colors.textPrimary} />
                  )}
                </TouchableOpacity>

                {/* Saved personas */}
                {personas.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>YOUR PERSONAS</Text>
                    {personas.map(renderPersonaItem)}
                  </>
                )}

                {/* Templates */}
                <Text style={styles.sectionTitle}>CREATE FROM TEMPLATE</Text>
                <View style={styles.templateGrid}>
                  {templates.map(renderTemplateItem)}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => {
                  setShowModal(false);
                  navigation.navigate('PersonaManagement');
                }}
                activeOpacity={0.7}>
                <Icon name="settings" size={16} color={colors.textSecondary} />
                <Text style={styles.footerButtonText}>MANAGE PERSONAS</Text>
              </TouchableOpacity>
            </View>
          </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectorAvatar: {
    fontSize: 16,
  },
  selectorLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    flexShrink: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 200,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  personaItemActive: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.bgElevated,
  },
  personaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  personaAvatarText: {
    fontSize: 20,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  personaDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.system,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  personaTags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  templateItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  templateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  templateIconText: {
    fontSize: 16,
  },
  templateName: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
  modalFooter: {
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSecondary,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  footerButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});