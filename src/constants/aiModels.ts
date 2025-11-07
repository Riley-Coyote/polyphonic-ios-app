/**
 * AI Model Configurations for Polyphonic
 * Updated: October 2025
 * All latest models from major AI providers
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
  description: string;
  contextWindow: number;
  inputCost: number; // per million tokens
  outputCost: number; // per million tokens
  features: string[];
  apiEndpoint?: string;
  category: 'flagship' | 'fast' | 'efficient' | 'specialized' | 'thinking';
  releaseDate: string;
  maxOutput?: number;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI GPT-5 Models (Released August 2025)
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    icon: '◎',
    description: 'State-of-the-art reasoning with minimal hallucinations',
    contextWindow: 272000,
    inputCost: 1.25,
    outputCost: 10,
    maxOutput: 128000,
    features: ['reasoning', 'multimodal', 'coding', 'analysis'],
    category: 'flagship',
    releaseDate: '2025-08',
    apiEndpoint: 'https://api.openai.com/v1'
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    icon: '◉',
    description: 'Balanced performance and cost efficiency',
    contextWindow: 272000,
    inputCost: 0.5,
    outputCost: 5,
    maxOutput: 64000,
    features: ['reasoning', 'multimodal', 'fast'],
    category: 'efficient',
    releaseDate: '2025-08',
    apiEndpoint: 'https://api.openai.com/v1'
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'OpenAI',
    icon: '○',
    description: 'Lightweight model for edge deployment',
    contextWindow: 128000,
    inputCost: 0.25,
    outputCost: 2.5,
    maxOutput: 32000,
    features: ['fast', 'efficient', 'edge'],
    category: 'fast',
    releaseDate: '2025-08',
    apiEndpoint: 'https://api.openai.com/v1'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    icon: '⊙',
    description: 'Optimized for real-time audio and multimodal tasks',
    contextWindow: 128000,
    inputCost: 2.5,
    outputCost: 10,
    features: ['audio', 'realtime', 'multimodal'],
    category: 'specialized',
    releaseDate: '2024-05',
    apiEndpoint: 'https://api.openai.com/v1'
  },

  // Anthropic Claude Models (Claude 4.x Series)
  {
    id: 'claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    icon: '⬢',
    description: 'Most intelligent Claude for complex reasoning',
    contextWindow: 200000,
    inputCost: 15,
    outputCost: 75,
    features: ['reasoning', 'analysis', 'creative', 'coding'],
    category: 'flagship',
    releaseDate: '2025-06',
    apiEndpoint: 'https://api.anthropic.com'
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    icon: '⬡',
    description: 'Balanced intelligence and speed for enterprise',
    contextWindow: 200000,
    inputCost: 3,
    outputCost: 15,
    features: ['balanced', 'enterprise', 'coding', 'vision'],
    category: 'efficient',
    releaseDate: '2025-07',
    apiEndpoint: 'https://api.anthropic.com'
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    icon: '◈',
    description: 'Fastest Claude for instant responses',
    contextWindow: 200000,
    inputCost: 0.25,
    outputCost: 1.25,
    features: ['fast', 'efficient', 'instant'],
    category: 'fast',
    releaseDate: '2025-07',
    apiEndpoint: 'https://api.anthropic.com'
  },

  // Google Gemini Models (2.5 & 2.0 Series)
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    icon: '◆',
    description: 'Advanced thinking model with reasoning capabilities',
    contextWindow: 1000000,
    inputCost: 0.15,
    outputCost: 3,
    features: ['thinking', 'reasoning', 'multimodal', 'long-context'],
    category: 'thinking',
    releaseDate: '2025-09',
    apiEndpoint: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    icon: '◇',
    description: 'Low latency with thinking capabilities',
    contextWindow: 1000000,
    inputCost: 0.1,
    outputCost: 2,
    features: ['fast', 'thinking', 'efficient', 'multimodal'],
    category: 'efficient',
    releaseDate: '2025-09',
    apiEndpoint: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'Google',
    icon: '◊',
    description: 'Ultra-fast with optional thinking mode',
    contextWindow: 1000000,
    inputCost: 0.075,
    outputCost: 1.5,
    features: ['ultrafast', 'optional-thinking', 'edge'],
    category: 'fast',
    releaseDate: '2025-09',
    apiEndpoint: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    icon: '△',
    description: 'Generally available with native tool use',
    contextWindow: 1000000,
    inputCost: 0.1,
    outputCost: 2,
    features: ['tools', 'multimodal', 'stable'],
    category: 'efficient',
    releaseDate: '2025-02',
    apiEndpoint: 'https://generativelanguage.googleapis.com'
  },

  // Moonshot AI Kimi Models
  {
    id: 'kimi-k2-thinking',
    name: 'Kimi K2 Thinking',
    provider: 'Moonshot',
    icon: '⧈',
    description: 'Open-source thinking model with 200+ tool calls',
    contextWindow: 256000,
    inputCost: 0.15,
    outputCost: 2.5,
    features: ['thinking', 'tools', 'open-source', 'agentic'],
    category: 'thinking',
    releaseDate: '2025-11',
    apiEndpoint: 'https://platform.moonshot.ai'
  },
  {
    id: 'kimi-k2-instruct',
    name: 'Kimi K2 Instruct',
    provider: 'Moonshot',
    icon: '⧉',
    description: 'General-purpose chat with 1T parameters',
    contextWindow: 256000,
    inputCost: 0.15,
    outputCost: 2.5,
    features: ['chat', 'coding', 'reasoning'],
    category: 'flagship',
    releaseDate: '2025-07',
    apiEndpoint: 'https://platform.moonshot.ai'
  },

  // Meta Llama Models
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    icon: '⬟',
    description: '400B MoE model with 128 experts',
    contextWindow: 1000000,
    inputCost: 0.2,
    outputCost: 3,
    features: ['moe', 'multimodal', 'long-context', 'reasoning'],
    category: 'flagship',
    releaseDate: '2025-04',
    apiEndpoint: 'various' // Available through multiple providers
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    icon: '⬠',
    description: '109B MoE model with 16 experts',
    contextWindow: 10000000,
    inputCost: 0.15,
    outputCost: 2,
    features: ['moe', 'multimodal', 'ultra-long-context'],
    category: 'efficient',
    releaseDate: '2025-04',
    apiEndpoint: 'various'
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    icon: '⬞',
    description: 'Cost-efficient high-quality text generation',
    contextWindow: 128000,
    inputCost: 0.1,
    outputCost: 1.5,
    features: ['text', 'efficient', 'stable'],
    category: 'efficient',
    releaseDate: '2025-05',
    apiEndpoint: 'various'
  },
  {
    id: 'llama-3.2-90b-vision',
    name: 'Llama 3.2 90B Vision',
    provider: 'Meta',
    icon: '⬣',
    description: 'Multimodal model for vision tasks',
    contextWindow: 128000,
    inputCost: 0.3,
    outputCost: 4,
    features: ['vision', 'multimodal', 'image-understanding'],
    category: 'specialized',
    releaseDate: '2024-09',
    apiEndpoint: 'various'
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    icon: '⬝',
    description: 'Lightweight model for edge deployment',
    contextWindow: 128000,
    inputCost: 0.05,
    outputCost: 0.5,
    features: ['edge', 'lightweight', 'fast'],
    category: 'fast',
    releaseDate: '2024-09',
    apiEndpoint: 'various'
  },

  // Mistral AI Models
  {
    id: 'mistral-large-2407',
    name: 'Mistral Large 2',
    provider: 'Mistral',
    icon: '✦',
    description: '123B dense model with strong reasoning',
    contextWindow: 128000,
    inputCost: 2,
    outputCost: 6,
    features: ['reasoning', 'coding', 'multilingual'],
    category: 'flagship',
    releaseDate: '2024-07',
    apiEndpoint: 'https://api.mistral.ai'
  },
  {
    id: 'codestral-2501',
    name: 'Codestral 25.01',
    provider: 'Mistral',
    icon: '✧',
    description: 'Specialized for code generation',
    contextWindow: 128000,
    inputCost: 1,
    outputCost: 3,
    features: ['coding', 'development', 'completion'],
    category: 'specialized',
    releaseDate: '2025-01',
    apiEndpoint: 'https://api.mistral.ai'
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'Mistral',
    icon: '✤',
    description: '12B model with 128k context',
    contextWindow: 128000,
    inputCost: 0.15,
    outputCost: 1.5,
    features: ['efficient', 'multilingual', 'apache-licensed'],
    category: 'efficient',
    releaseDate: '2024-07',
    apiEndpoint: 'https://api.mistral.ai'
  },
  {
    id: 'pixtral-large',
    name: 'Pixtral Large',
    provider: 'Mistral',
    icon: '✥',
    description: 'Multimodal model for text and images',
    contextWindow: 128000,
    inputCost: 2.5,
    outputCost: 7,
    features: ['multimodal', 'vision', 'image-text'],
    category: 'specialized',
    releaseDate: '2024-11',
    apiEndpoint: 'https://api.mistral.ai'
  }
];

// Provider configurations for API integration
export const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    apiKeyEnv: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    models: AI_MODELS.filter(m => m.provider === 'OpenAI')
  },
  anthropic: {
    name: 'Anthropic',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
    models: AI_MODELS.filter(m => m.provider === 'Anthropic')
  },
  google: {
    name: 'Google',
    apiKeyEnv: 'GOOGLE_AI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: AI_MODELS.filter(m => m.provider === 'Google')
  },
  moonshot: {
    name: 'Moonshot',
    apiKeyEnv: 'MOONSHOT_API_KEY',
    baseUrl: 'https://platform.moonshot.ai',
    models: AI_MODELS.filter(m => m.provider === 'Moonshot')
  },
  meta: {
    name: 'Meta',
    note: 'Available through various cloud providers',
    models: AI_MODELS.filter(m => m.provider === 'Meta')
  },
  mistral: {
    name: 'Mistral',
    apiKeyEnv: 'MISTRAL_API_KEY',
    baseUrl: 'https://api.mistral.ai',
    models: AI_MODELS.filter(m => m.provider === 'Mistral')
  }
};

// Group models by category for UI display
export const MODEL_CATEGORIES = {
  flagship: {
    name: 'Flagship Models',
    description: 'Most capable models for complex tasks',
    models: AI_MODELS.filter(m => m.category === 'flagship')
  },
  thinking: {
    name: 'Thinking Models',
    description: 'Models with advanced reasoning capabilities',
    models: AI_MODELS.filter(m => m.category === 'thinking')
  },
  efficient: {
    name: 'Balanced Performance',
    description: 'Best balance of capability and cost',
    models: AI_MODELS.filter(m => m.category === 'efficient')
  },
  fast: {
    name: 'Fast & Lightweight',
    description: 'Optimized for speed and edge deployment',
    models: AI_MODELS.filter(m => m.category === 'fast')
  },
  specialized: {
    name: 'Specialized Models',
    description: 'Optimized for specific tasks',
    models: AI_MODELS.filter(m => m.category === 'specialized')
  }
};

// Helper function to get model by ID
export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

// Helper function to get models by provider
export const getModelsByProvider = (provider: string): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider);
};

// Default selected models for initial state
export const DEFAULT_SELECTED_MODELS = [
  'gpt-5',
  'claude-sonnet-4.5',
  'gemini-2.5-flash',
  'kimi-k2-thinking'
];