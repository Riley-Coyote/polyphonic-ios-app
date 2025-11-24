import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { usePersonaStore } from '../store/personaStore';
import { Persona } from '../types/persona';

export function PersonaManagementScreen() {
  const navigation = useNavigation<any>();
  const {
    personas,
    activePersona,
    defaultPersona,
    isLoadingPersonas,
    loadPersonas,
    deletePersona,
    setActivePersona,
    setDefaultPersona,
    resetToDefaults,
  } = usePersonaStore();

  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleDeletePersona = (persona: Persona) => {
    Alert.alert(
      'Delete Persona',
      `Are you sure you want to delete "${persona.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePersona(persona.id);
            await loadPersonas();
          },
        },
      ]
    );
  };

  const handleSetActive = async (persona: Persona) => {
    await setActivePersona(persona);
  };

  const handleSetDefault = async (persona: Persona) => {
    await setDefaultPersona(persona);
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will delete all custom personas and restore the default templates. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
          },
        },
      ]
    );
  };

  const handleEditPersona = (persona: Persona) => {
    // Navigate to persona edit screen (to be implemented)
    navigation.navigate('PersonaEdit', { personaId: persona.id });
  };

  const handleCreatePersona = () => {
    // Navigate to persona creation screen
    navigation.navigate('PersonaEdit', { personaId: null });
  };

  const renderPersonaCard = (persona: Persona) => {
    const isActive = activePersona?.id === persona.id;
    const isDefault = defaultPersona?.id === persona.id;

    return (
      <View key={persona.id} style={[styles.personaCard, isActive && styles.activeCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.personaAvatar}>{persona.avatar || '🤖'}</Text>
            <View style={styles.cardTitleContent}>
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaDescription}>{persona.description}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPersona(persona)}
              activeOpacity={0.7}>
              <Icon name="edit-2" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePersona(persona)}
              activeOpacity={0.7}>
              <Icon name="trash-2" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          {/* Personality traits */}
          <View style={styles.traitsSection}>
            <Text style={styles.sectionLabel}>PERSONALITY</Text>
            <View style={styles.traitsList}>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Tone</Text>
                <Text style={styles.traitValue}>{persona.personality.tone}</Text>
              </View>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Empathy</Text>
                <Text style={styles.traitValue}>{persona.personality.empathy}</Text>
              </View>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Creativity</Text>
                <Text style={styles.traitValue}>{persona.personality.creativity}</Text>
              </View>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Verbosity</Text>
                <Text style={styles.traitValue}>{persona.personality.verbosity}</Text>
              </View>
            </View>
          </View>

          {/* Voice settings */}
          <View style={styles.traitsSection}>
            <Text style={styles.sectionLabel}>VOICE</Text>
            <View style={styles.traitsList}>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Perspective</Text>
                <Text style={styles.traitValue}>
                  {persona.voice.perspective.replace('_', ' ')}
                </Text>
              </View>
              <View style={styles.trait}>
                <Text style={styles.traitLabel}>Vocabulary</Text>
                <Text style={styles.traitValue}>{persona.voice.vocabulary}</Text>
              </View>
            </View>
          </View>

          {/* Knowledge domains */}
          {persona.knowledge.expertise.length > 0 && (
            <View style={styles.traitsSection}>
              <Text style={styles.sectionLabel}>EXPERTISE</Text>
              <View style={styles.tagsList}>
                {persona.knowledge.expertise.map((domain, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{domain}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.footerButton, isActive && styles.activeButton]}
            onPress={() => handleSetActive(persona)}
            activeOpacity={0.7}>
            <Icon
              name={isActive ? 'check-circle' : 'circle'}
              size={16}
              color={isActive ? colors.textPrimary : colors.textSecondary}
            />
            <Text style={[styles.footerButtonText, isActive && styles.activeButtonText]}>
              {isActive ? 'ACTIVE' : 'SET ACTIVE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, isDefault && styles.defaultButton]}
            onPress={() => handleSetDefault(persona)}
            activeOpacity={0.7}>
            <Icon
              name={isDefault ? 'star' : 'star'}
              size={16}
              color={isDefault ? colors.resonanceHigh : colors.textSecondary}
            />
            <Text style={[styles.footerButtonText, isDefault && styles.defaultButtonText]}>
              {isDefault ? 'DEFAULT' : 'SET DEFAULT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MANAGE PERSONAS</Text>
          <TouchableOpacity onPress={handleCreatePersona} style={styles.addButton}>
            <Icon name="plus" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {isLoadingPersonas ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.textSecondary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {personas.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="users" size={48} color={colors.textQuaternary} />
                <Text style={styles.emptyStateTitle}>No Personas</Text>
                <Text style={styles.emptyStateText}>
                  Create custom personas to give your AI unique personalities
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreatePersona}
                  activeOpacity={0.7}>
                  <Icon name="plus" size={16} color={colors.textPrimary} />
                  <Text style={styles.createButtonText}>CREATE PERSONA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {personas.map(renderPersonaCard)}

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetToDefaults}
                  activeOpacity={0.7}>
                  <Icon name="refresh-cw" size={16} color={colors.textSecondary} />
                  <Text style={styles.resetButtonText}>RESET TO DEFAULTS</Text>
                </TouchableOpacity>
              </>
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
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
  addButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  activeCard: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.bgElevated,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  cardTitleRow: {
    flexDirection: 'row',
    flex: 1,
  },
  personaAvatar: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  cardTitleContent: {
    flex: 1,
  },
  personaName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  personaDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.system,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  cardBody: {
    padding: spacing.md,
  },
  traitsSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trait: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  traitLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textQuaternary,
  },
  traitValue: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  cardFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
  },
  footerButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  activeButton: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  activeButtonText: {
    color: colors.textPrimary,
  },
  defaultButton: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.resonanceHigh,
  },
  defaultButtonText: {
    color: colors.resonanceHigh,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 4,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  createButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});