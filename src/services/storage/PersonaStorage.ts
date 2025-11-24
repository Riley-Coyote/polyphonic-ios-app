/**
 * Persona Storage Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona, PersonaTemplate, PersonaCategory } from '../../types/persona';
import uuid from 'react-native-uuid';

const PERSONAS_KEY = '@polyphonic_personas';
const ACTIVE_PERSONA_KEY = '@polyphonic_active_persona';
const DEFAULT_PERSONA_KEY = '@polyphonic_default_persona';

export interface PersonaStorageData {
  personas: Persona[];
  activePersonaId: string | null;
  defaultPersonaId: string | null;
}

class PersonaStorageService {
  /**
   * Load all personas
   */
  async loadPersonas(): Promise<Persona[]> {
    try {
      const data = await AsyncStorage.getItem(PERSONAS_KEY);
      if (data) {
        const personas: Persona[] = JSON.parse(data);
        // Ensure personas have required fields
        return personas.map(p => ({
          ...this.getDefaultPersona(),
          ...p,
          updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
        }));
      }

      // Initialize with default personas if none exist
      const defaultPersonas = this.getDefaultPersonaTemplates().map(template =>
        this.createPersonaFromTemplate(template)
      );

      try {
        await this.savePersonas(defaultPersonas);
        return defaultPersonas;
      } catch (saveError) {
        console.error('Error saving default personas:', saveError);
        return defaultPersonas; // Return them even if save fails
      }
    } catch (error) {
      console.error('Error loading personas:', error);
      return [];
    }
  }

  /**
   * Save all personas
   */
  async savePersonas(personas: Persona[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
    } catch (error) {
      console.error('Error saving personas:', error);
      throw error;
    }
  }

  /**
   * Create a new persona
   */
  async createPersona(persona: Partial<Persona>): Promise<Persona> {
    const newPersona: Persona = {
      ...this.getDefaultPersona(),
      ...persona,
      id: uuid.v4() as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const personas = await this.loadPersonas();
    personas.push(newPersona);
    await this.savePersonas(personas);

    return newPersona;
  }

  /**
   * Update an existing persona
   */
  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona | null> {
    const personas = await this.loadPersonas();
    const index = personas.findIndex(p => p.id === id);

    if (index === -1) return null;

    personas[index] = {
      ...personas[index],
      ...updates,
      id: personas[index].id, // Prevent ID from being overwritten
      createdAt: personas[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await this.savePersonas(personas);
    return personas[index];
  }

  /**
   * Delete a persona
   */
  async deletePersona(id: string): Promise<boolean> {
    const personas = await this.loadPersonas();
    const filteredPersonas = personas.filter(p => p.id !== id);

    if (filteredPersonas.length === personas.length) {
      return false; // Persona not found
    }

    // If deleted persona was active or default, clear those settings
    const activeId = await this.getActivePersonaId();
    const defaultId = await this.getDefaultPersonaId();

    if (activeId === id) {
      await this.setActivePersonaId(null);
    }
    if (defaultId === id) {
      await this.setDefaultPersonaId(null);
    }

    await this.savePersonas(filteredPersonas);
    return true;
  }

  /**
   * Get a persona by ID
   */
  async getPersona(id: string): Promise<Persona | null> {
    const personas = await this.loadPersonas();
    return personas.find(p => p.id === id) || null;
  }

  /**
   * Set the active persona
   */
  async setActivePersonaId(id: string | null): Promise<void> {
    try {
      if (id === null) {
        await AsyncStorage.removeItem(ACTIVE_PERSONA_KEY);
      } else {
        await AsyncStorage.setItem(ACTIVE_PERSONA_KEY, id);
      }
    } catch (error) {
      // Silently fail on storage errors
    }
  }

  /**
   * Get the active persona ID
   */
  async getActivePersonaId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_PERSONA_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get the active persona
   */
  async getActivePersona(): Promise<Persona | null> {
    const id = await this.getActivePersonaId();
    if (!id) return null;
    return this.getPersona(id);
  }

  /**
   * Set the default persona
   */
  async setDefaultPersonaId(id: string | null): Promise<void> {
    try {
      if (id === null) {
        await AsyncStorage.removeItem(DEFAULT_PERSONA_KEY);
      } else {
        await AsyncStorage.setItem(DEFAULT_PERSONA_KEY, id);
      }
    } catch (error) {
      // Silently fail on storage errors
    }
  }

  /**
   * Get the default persona ID
   */
  async getDefaultPersonaId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DEFAULT_PERSONA_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a persona from a template
   */
  createPersonaFromTemplate(template: PersonaTemplate): Persona {
    return {
      ...this.getDefaultPersona(),
      ...template.preset,
      id: uuid.v4() as string,
      name: template.name,
      description: template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      isDefault: false,
    };
  }

  /**
   * Get default persona structure
   */
  private getDefaultPersona(): Persona {
    return {
      id: '',
      name: 'New Persona',
      description: 'A custom AI personality',
      avatar: '🤖',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      isDefault: false,
      personality: {
        tone: 'friendly',
        empathy: 'medium',
        creativity: 'balanced',
        verbosity: 'moderate',
        humor: 'subtle',
        formality: 5,
        enthusiasm: 5,
        patience: 7,
      },
      voice: {
        perspective: 'second_person',
        vocabulary: 'moderate',
        sentenceStructure: 'varied',
        idioms: true,
        metaphors: false,
        technicalJargon: false,
        culturalReferences: false,
      },
      knowledge: {
        expertise: [],
        interests: [],
        avoidTopics: [],
      },
      behavior: {
        questioningStyle: 'direct',
        teachingApproach: 'mixed',
        responseStructure: 'conversational',
        interactionStyle: 'reactive',
        clarificationFrequency: 'sometimes',
        exampleUsage: 'moderate',
      },
    };
  }

  /**
   * Get default persona templates
   */
  getDefaultPersonaTemplates(): PersonaTemplate[] {
    return [
      {
        id: 'assistant',
        name: 'Helpful Assistant',
        category: 'professional',
        icon: '🤝',
        description: 'Professional, helpful, and efficient',
        preset: {
          personality: {
            tone: 'professional',
            empathy: 'medium',
            creativity: 'balanced',
            verbosity: 'moderate',
            humor: 'none',
            formality: 7,
            enthusiasm: 5,
            patience: 8,
          },
          voice: {
            perspective: 'second_person',
            vocabulary: 'moderate',
            sentenceStructure: 'varied',
            idioms: false,
            metaphors: false,
            technicalJargon: false,
            culturalReferences: false,
          },
          behavior: {
            questioningStyle: 'direct',
            teachingApproach: 'step_by_step',
            responseStructure: 'structured',
            interactionStyle: 'reactive',
            clarificationFrequency: 'often',
            exampleUsage: 'moderate',
          },
        },
      },
      {
        id: 'creative',
        name: 'Creative Companion',
        category: 'creative',
        icon: '🎨',
        description: 'Imaginative, playful, and inspiring',
        preset: {
          personality: {
            tone: 'playful',
            empathy: 'high',
            creativity: 'imaginative',
            verbosity: 'detailed',
            humor: 'playful',
            formality: 3,
            enthusiasm: 9,
            patience: 6,
          },
          voice: {
            perspective: 'first_person',
            vocabulary: 'advanced',
            sentenceStructure: 'complex',
            idioms: true,
            metaphors: true,
            technicalJargon: false,
            culturalReferences: true,
          },
          behavior: {
            questioningStyle: 'exploratory',
            teachingApproach: 'conceptual',
            responseStructure: 'narrative',
            interactionStyle: 'proactive',
            clarificationFrequency: 'rarely',
            exampleUsage: 'frequent',
          },
        },
      },
      {
        id: 'tutor',
        name: 'Patient Tutor',
        category: 'educational',
        icon: '📚',
        description: 'Educational, clear, and encouraging',
        preset: {
          personality: {
            tone: 'friendly',
            empathy: 'high',
            creativity: 'balanced',
            verbosity: 'detailed',
            humor: 'subtle',
            formality: 5,
            enthusiasm: 7,
            patience: 10,
          },
          voice: {
            perspective: 'second_person',
            vocabulary: 'simple',
            sentenceStructure: 'simple',
            idioms: false,
            metaphors: true,
            technicalJargon: false,
            culturalReferences: false,
          },
          behavior: {
            questioningStyle: 'socratic',
            teachingApproach: 'step_by_step',
            responseStructure: 'structured',
            interactionStyle: 'mentoring',
            clarificationFrequency: 'always',
            exampleUsage: 'frequent',
          },
        },
      },
      {
        id: 'technical',
        name: 'Technical Expert',
        category: 'specialized',
        icon: '💻',
        description: 'Precise, detailed, and technical',
        preset: {
          personality: {
            tone: 'serious',
            empathy: 'low',
            creativity: 'conservative',
            verbosity: 'concise',
            humor: 'none',
            formality: 8,
            enthusiasm: 3,
            patience: 5,
          },
          voice: {
            perspective: 'third_person',
            vocabulary: 'technical',
            sentenceStructure: 'complex',
            idioms: false,
            metaphors: false,
            technicalJargon: true,
            culturalReferences: false,
          },
          behavior: {
            questioningStyle: 'none',
            teachingApproach: 'practical',
            responseStructure: 'bullet_points',
            interactionStyle: 'reactive',
            clarificationFrequency: 'sometimes',
            exampleUsage: 'minimal',
          },
        },
      },
    ];
  }

  /**
   * Reset to default personas
   */
  async resetToDefaults(): Promise<void> {
    const templates = this.getDefaultPersonaTemplates();
    const defaultPersonas = templates.map(t => this.createPersonaFromTemplate(t));
    await this.savePersonas(defaultPersonas);
    await this.setActivePersonaId(null);
    await this.setDefaultPersonaId(null);
  }
}

// Export singleton instance
export const personaStorage = new PersonaStorageService();