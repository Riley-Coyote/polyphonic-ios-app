/**
 * Persona Types for Custom AI Personalities
 */

export interface Persona {
  id: string;
  name: string;
  avatar?: string; // Base64 encoded image or emoji
  description: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isDefault?: boolean;

  // Persona characteristics
  personality: PersonalityTraits;
  voice: VoiceSettings;
  knowledge: KnowledgeDomains;
  behavior: BehaviorSettings;

  // System prompt configuration
  systemPrompt?: string;
  customInstructions?: string[];

  // Model preferences
  preferredModels?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface PersonalityTraits {
  tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'playful' | 'serious' | 'custom';
  empathy: 'low' | 'medium' | 'high';
  creativity: 'conservative' | 'balanced' | 'creative' | 'imaginative';
  verbosity: 'concise' | 'moderate' | 'detailed' | 'elaborate';
  humor: 'none' | 'subtle' | 'moderate' | 'playful';
  formality: number; // 0-10 scale
  enthusiasm: number; // 0-10 scale
  patience: number; // 0-10 scale
}

export interface VoiceSettings {
  perspective: 'first_person' | 'second_person' | 'third_person' | 'mixed';
  vocabulary: 'simple' | 'moderate' | 'advanced' | 'technical';
  sentenceStructure: 'simple' | 'varied' | 'complex';
  idioms: boolean;
  metaphors: boolean;
  technicalJargon: boolean;
  culturalReferences: boolean;
}

export interface KnowledgeDomains {
  expertise: string[];
  interests: string[];
  avoidTopics: string[];
  specialization?: string;
  experience?: string;
  background?: string;
}

export interface BehaviorSettings {
  questioningStyle: 'socratic' | 'direct' | 'exploratory' | 'none';
  teachingApproach: 'step_by_step' | 'conceptual' | 'practical' | 'mixed';
  responseStructure: 'structured' | 'conversational' | 'bullet_points' | 'narrative';
  interactionStyle: 'reactive' | 'proactive' | 'collaborative' | 'mentoring';
  clarificationFrequency: 'always' | 'often' | 'sometimes' | 'rarely';
  exampleUsage: 'frequent' | 'moderate' | 'minimal' | 'none';
}

// Preset personas
export interface PersonaTemplate {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'educational' | 'personal' | 'specialized';
  icon: string;
  description: string;
  preset: Partial<Persona>;
}

// Persona categories for organization
export enum PersonaCategory {
  ASSISTANT = 'assistant',
  TUTOR = 'tutor',
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
  COMPANION = 'companion',
  SPECIALIST = 'specialist',
  CUSTOM = 'custom'
}