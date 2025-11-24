/**
 * Persona State Management Store
 */

import { create } from 'zustand';
import { Persona, PersonaTemplate } from '../types/persona';
import { personaStorage } from '../services/storage/PersonaStorage';

export interface PersonaState {
  // Personas
  personas: Persona[];
  activePersona: Persona | null;
  defaultPersona: Persona | null;
  templates: PersonaTemplate[];

  // Loading states
  isLoadingPersonas: boolean;
  isSavingPersona: boolean;

  // Actions
  loadPersonas: () => Promise<void>;
  createPersona: (persona: Partial<Persona>) => Promise<Persona>;
  updatePersona: (id: string, updates: Partial<Persona>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;

  // Active persona management
  setActivePersona: (persona: Persona | null) => Promise<void>;
  setDefaultPersona: (persona: Persona | null) => Promise<void>;

  // Template management
  createFromTemplate: (template: PersonaTemplate) => Promise<Persona>;
  resetToDefaults: () => Promise<void>;

  // Utility functions
  getPersonaById: (id: string) => Persona | null;
  getActiveSystemPrompt: () => string | null;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  // Initial state
  personas: [],
  activePersona: null,
  defaultPersona: null,
  templates: personaStorage.getDefaultPersonaTemplates(),
  isLoadingPersonas: false,
  isSavingPersona: false,

  // Load all personas and set active/default
  loadPersonas: async () => {
    set({ isLoadingPersonas: true });
    try {
      const personas = await personaStorage.loadPersonas();
      const activeId = await personaStorage.getActivePersonaId();
      const defaultId = await personaStorage.getDefaultPersonaId();

      const activePersona = activeId ? personas.find(p => p.id === activeId) || null : null;
      const defaultPersona = defaultId ? personas.find(p => p.id === defaultId) || null : null;

      set({
        personas,
        activePersona,
        defaultPersona,
        isLoadingPersonas: false
      });
    } catch (error) {
      console.error('Error loading personas:', error);
      set({ isLoadingPersonas: false });
    }
  },

  // Create a new persona
  createPersona: async (personaData: Partial<Persona>) => {
    set({ isSavingPersona: true });
    try {
      const newPersona = await personaStorage.createPersona(personaData);
      const personas = await personaStorage.loadPersonas();

      set({
        personas,
        isSavingPersona: false
      });

      return newPersona;
    } catch (error) {
      set({ isSavingPersona: false });
      throw error;
    }
  },

  // Update an existing persona
  updatePersona: async (id: string, updates: Partial<Persona>) => {
    set({ isSavingPersona: true });
    try {
      const updatedPersona = await personaStorage.updatePersona(id, updates);
      if (!updatedPersona) {
        throw new Error('Persona not found');
      }

      const personas = await personaStorage.loadPersonas();
      const { activePersona, defaultPersona } = get();

      // Update active/default if they were modified
      const newActivePersona = activePersona?.id === id ? updatedPersona : activePersona;
      const newDefaultPersona = defaultPersona?.id === id ? updatedPersona : defaultPersona;

      set({
        personas,
        activePersona: newActivePersona,
        defaultPersona: newDefaultPersona,
        isSavingPersona: false
      });
    } catch (error) {
      set({ isSavingPersona: false });
      throw error;
    }
  },

  // Delete a persona
  deletePersona: async (id: string) => {
    set({ isSavingPersona: true });
    try {
      const success = await personaStorage.deletePersona(id);
      if (!success) {
        throw new Error('Failed to delete persona');
      }

      const personas = await personaStorage.loadPersonas();
      const { activePersona, defaultPersona } = get();

      // Clear active/default if they were deleted
      const newActivePersona = activePersona?.id === id ? null : activePersona;
      const newDefaultPersona = defaultPersona?.id === id ? null : defaultPersona;

      set({
        personas,
        activePersona: newActivePersona,
        defaultPersona: newDefaultPersona,
        isSavingPersona: false
      });
    } catch (error) {
      set({ isSavingPersona: false });
      throw error;
    }
  },

  // Set active persona
  setActivePersona: async (persona: Persona | null) => {
    try {
      await personaStorage.setActivePersonaId(persona?.id || null);
      set({ activePersona: persona });
    } catch (error) {
      console.error('Error setting active persona:', error);
      throw error;
    }
  },

  // Set default persona
  setDefaultPersona: async (persona: Persona | null) => {
    try {
      await personaStorage.setDefaultPersonaId(persona?.id || null);
      set({ defaultPersona: persona });
    } catch (error) {
      throw error;
    }
  },

  // Create persona from template
  createFromTemplate: async (template: PersonaTemplate) => {
    const personaData = personaStorage.createPersonaFromTemplate(template);
    return get().createPersona(personaData);
  },

  // Reset to default personas
  resetToDefaults: async () => {
    set({ isLoadingPersonas: true });
    try {
      await personaStorage.resetToDefaults();
      await get().loadPersonas();
    } catch (error) {
      set({ isLoadingPersonas: false });
      throw error;
    }
  },

  // Get persona by ID
  getPersonaById: (id: string) => {
    return get().personas.find(p => p.id === id) || null;
  },

  // Get active system prompt
  getActiveSystemPrompt: () => {
    const { activePersona, defaultPersona } = get();
    const persona = activePersona || defaultPersona;

    if (!persona) return null;

    // Build system prompt from persona configuration
    const parts = [];

    // Custom system prompt
    if (persona.systemPrompt) {
      parts.push(persona.systemPrompt);
    }

    // Personality traits
    parts.push(`Personality: ${persona.personality.tone} tone with ${persona.personality.empathy} empathy.`);
    parts.push(`Creativity level: ${persona.personality.creativity}.`);
    parts.push(`Response style: ${persona.personality.verbosity} with ${persona.personality.humor} humor.`);

    // Voice settings
    parts.push(`Speaking from ${persona.voice.perspective} perspective.`);
    parts.push(`Using ${persona.voice.vocabulary} vocabulary with ${persona.voice.sentenceStructure} sentence structure.`);

    // Knowledge domains
    if (persona.knowledge.expertise.length > 0) {
      parts.push(`Expertise in: ${persona.knowledge.expertise.join(', ')}.`);
    }
    if (persona.knowledge.avoidTopics.length > 0) {
      parts.push(`Avoiding topics: ${persona.knowledge.avoidTopics.join(', ')}.`);
    }

    // Behavior settings
    parts.push(`Interaction style: ${persona.behavior.interactionStyle} with ${persona.behavior.responseStructure} responses.`);
    parts.push(`Teaching approach: ${persona.behavior.teachingApproach}.`);

    // Custom instructions
    if (persona.customInstructions && persona.customInstructions.length > 0) {
      parts.push('\nAdditional instructions:');
      parts.push(...persona.customInstructions);
    }

    return parts.join('\n');
  },
}));