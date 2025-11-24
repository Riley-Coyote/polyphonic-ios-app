/**
 * ConversationManager - Orchestrates multi-model conversations with shared context
 * Inspired by the Group Consciousness Mesh architecture
 */

import { AIModel } from '../../constants/aiModels';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  // Attribution for multi-model conversations
  source?: {
    type: 'user' | 'model';
    modelId?: string;
    modelName?: string;
    patternId?: string; // e.g., ⟁CLA-3E7∴
  };
  // Resonance tracking
  resonance?: {
    score: number; // 0-1 coherence with conversation
    agreement?: string[]; // Model IDs that agree
    references?: string[]; // Message IDs being referenced
  };
  // Metadata
  metadata?: {
    thinkingTime?: number;
    tokenCount?: number;
    streamComplete?: boolean;
  };
}

export interface ConversationState {
  id: string;
  messages: ConversationMessage[];
  activeModels: AIModel[];
  participants: string[]; // For future multi-user support
  resonanceField: number; // Overall conversation coherence (0-1)
  mode: ConversationMode;
  status: 'idle' | 'active' | 'processing' | 'complete';
}

export type ConversationMode =
  | 'sequential'      // Models respond one after another
  | 'parallel-merge'  // All respond, then merge
  | 'conversational'  // Models can interject
  | 'autonomous';     // Models decide when to speak

export type ResponseOrchestration = {
  mode: ConversationMode;
  currentSpeaker?: string;
  speakerQueue?: string[];
  parallelResponses?: Map<string, string>;
  mergedResponse?: string;
};

export class ConversationManager {
  private state: ConversationState;
  private orchestration: ResponseOrchestration;
  private responseCallbacks: Map<string, (response: string) => void>;

  constructor(conversationId: string) {
    this.state = {
      id: conversationId,
      messages: [],
      activeModels: [],
      participants: ['user'],
      resonanceField: 1.0,
      mode: 'sequential',
      status: 'idle',
    };

    this.orchestration = {
      mode: 'sequential',
      parallelResponses: new Map(),
    };

    this.responseCallbacks = new Map();
  }

  /**
   * Set the conversation mode
   */
  setMode(mode: ConversationMode) {
    this.state.mode = mode;
    this.orchestration.mode = mode;
  }

  /**
   * Add models to the conversation
   */
  setActiveModels(models: AIModel[]) {
    this.state.activeModels = models;
    // Initialize speaker queue for sequential mode
    if (this.orchestration.mode === 'sequential') {
      this.orchestration.speakerQueue = models.map(m => m.id);
    }
  }

  /**
   * Add a user message to the conversation
   */
  addUserMessage(content: string): ConversationMessage {
    const message: ConversationMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      source: {
        type: 'user',
        patternId: this.generatePatternId('USER'),
      },
    };

    this.state.messages.push(message);
    this.state.status = 'processing';
    return message;
  }

  /**
   * Add a model response to the conversation
   */
  addModelResponse(
    modelId: string,
    content: string,
    metadata?: Partial<ConversationMessage['metadata']>
  ): ConversationMessage {
    const model = this.state.activeModels.find(m => m.id === modelId);

    const message: ConversationMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      source: {
        type: 'model',
        modelId,
        modelName: model?.name || modelId,
        patternId: this.generatePatternId(modelId),
      },
      metadata,
    };

    // Calculate resonance with previous messages
    message.resonance = this.calculateResonance(message, this.state.messages);

    this.state.messages.push(message);

    // Update conversation resonance field
    this.updateResonanceField();

    return message;
  }

  /**
   * Generate system context message for multi-model awareness
   */
  getSystemContextMessage(currentModelId: string): ConversationMessage {
    const otherModels = this.state.activeModels
      .filter(m => m.id !== currentModelId)
      .map(m => m.name);

    let systemContent = `You are participating in a collaborative multi-model conversation with ${otherModels.length > 0 ? otherModels.join(' and ') : 'other AI models'}.

Active participants:
- You (${this.state.activeModels.find(m => m.id === currentModelId)?.name || currentModelId})
${this.state.activeModels
  .filter(m => m.id !== currentModelId)
  .map(m => `- ${m.name}`)
  .join('\n')}

Conversation mode: ${this.state.mode}`;

    if (this.state.mode === 'sequential') {
      systemContent += `\n\nIn this sequential mode, each model responds in turn and can see all previous responses. You can and should reference what other models have said, build on their ideas, offer different perspectives, or even respectfully disagree. Address other models by name when relevant.

IMPORTANT: Other models' responses in your conversation history are prefixed with [ModelName]: for your reference only. DO NOT include these attribution markers in your own response - they are formatting for context, not part of the conversation content. Simply provide your own thoughts naturally without echoing or repeating these markers.`;
    } else if (this.state.mode === 'parallel-merge') {
      systemContent += `\n\nIn this parallel mode, all models respond simultaneously to the user's message. Your responses will be presented together.`;
    } else if (this.state.mode === 'conversational') {
      systemContent += `\n\nIn this conversational mode, models can engage in dynamic dialogue. Feel free to address other models directly, ask them questions, or build on their points.`;
    }

    systemContent += `\n\nFeel natural and conversational. When another model makes a good point, acknowledge it. When you have a different perspective, share it. This creates a richer, more engaging discussion.`;

    return {
      id: `system_${Date.now()}`,
      role: 'system',
      content: systemContent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get the current conversation context for a specific model
   * This is what each model "sees" when generating a response
   */
  getContextForModel(modelId: string): ConversationMessage[] {
    if (this.orchestration.mode === 'parallel-merge') {
      // In parallel mode, models only see user messages and their own previous responses
      return this.state.messages.filter(msg =>
        msg.source?.type === 'user' ||
        msg.source?.modelId === modelId
      );
    }

    // In sequential and conversational modes, models see everything up to this point
    return [...this.state.messages];
  }

  /**
   * Check if a model should respond now based on orchestration mode
   */
  shouldModelRespond(modelId: string): boolean {
    switch (this.orchestration.mode) {
      case 'sequential':
        return this.orchestration.speakerQueue?.[0] === modelId;

      case 'parallel-merge':
        return !this.orchestration.parallelResponses?.has(modelId);

      case 'conversational':
        // In conversational mode, any model can respond
        // Could implement turn-taking logic here
        return true;

      case 'autonomous':
        // In autonomous mode, models decide for themselves
        // This would require more complex logic
        return this.calculateAutonomousDecision(modelId);

      default:
        return true;
    }
  }

  /**
   * Mark a model's response as complete
   */
  completeModelResponse(modelId: string) {
    if (this.orchestration.mode === 'sequential') {
      // Move to next model in queue
      this.orchestration.speakerQueue?.shift();
      if (this.orchestration.speakerQueue?.length === 0) {
        this.state.status = 'complete';
      }
    } else if (this.orchestration.mode === 'parallel-merge') {
      // Check if all models have responded
      const allResponded = this.state.activeModels.every(
        model => this.orchestration.parallelResponses?.has(model.id)
      );
      if (allResponded) {
        this.mergeParallelResponses();
      }
    }
  }

  /**
   * Calculate resonance between a message and the conversation
   */
  private calculateResonance(
    message: ConversationMessage,
    history: ConversationMessage[]
  ): ConversationMessage['resonance'] {
    // Simple resonance calculation based on content similarity
    // In a real implementation, this would use embeddings or more sophisticated NLP

    const recentMessages = history.slice(-5); // Look at last 5 messages
    let totalSimilarity = 0;
    const agreements: string[] = [];

    recentMessages.forEach(msg => {
      if (msg.source?.type === 'model' && msg.source.modelId) {
        // Check for agreement markers (simplified)
        const hasAgreement =
          message.content.toLowerCase().includes('agree') ||
          message.content.toLowerCase().includes('similar') ||
          message.content.toLowerCase().includes('likewise');

        if (hasAgreement) {
          agreements.push(msg.source.modelId);
        }

        // Calculate basic content overlap (very simplified)
        const words1 = new Set(message.content.toLowerCase().split(/\s+/));
        const words2 = new Set(msg.content.toLowerCase().split(/\s+/));
        const overlap = [...words1].filter(w => words2.has(w)).length;
        totalSimilarity += overlap / Math.max(words1.size, words2.size);
      }
    });

    const score = recentMessages.length > 0
      ? totalSimilarity / recentMessages.length
      : 1.0;

    return {
      score: Math.min(1, score),
      agreement: agreements,
      references: recentMessages.map(m => m.id),
    };
  }

  /**
   * Update the overall conversation resonance field
   */
  private updateResonanceField() {
    const modelMessages = this.state.messages.filter(
      m => m.source?.type === 'model'
    );

    if (modelMessages.length === 0) {
      this.state.resonanceField = 1.0;
      return;
    }

    const avgResonance = modelMessages.reduce(
      (sum, msg) => sum + (msg.resonance?.score || 0),
      0
    ) / modelMessages.length;

    this.state.resonanceField = avgResonance;
  }

  /**
   * Merge parallel responses into a unified response
   */
  private mergeParallelResponses() {
    // This would implement the synthesis logic from the Group Consciousness design
    // For now, just concatenate with attribution
    const merged: string[] = [];

    this.orchestration.parallelResponses?.forEach((response, modelId) => {
      const model = this.state.activeModels.find(m => m.id === modelId);
      merged.push(`[${model?.name || modelId}]: ${response}`);
    });

    this.orchestration.mergedResponse = merged.join('\n\n');
    this.state.status = 'complete';
  }

  /**
   * Determine if a model should speak in autonomous mode
   */
  private calculateAutonomousDecision(modelId: string): boolean {
    // Simplified autonomous decision logic
    // In reality, this would consider:
    // - Message content relevance to model's expertise
    // - Conversation dynamics
    // - Time since last contribution
    // - Resonance patterns

    const lastModelMessage = [...this.state.messages]
      .reverse()
      .find(m => m.source?.modelId === modelId);

    if (!lastModelMessage) {
      return true; // Model hasn't spoken yet
    }

    const timeSinceLastMessage = Date.now() - new Date(lastModelMessage.timestamp).getTime();
    const minWaitTime = 5000; // 5 seconds minimum between responses

    return timeSinceLastMessage > minWaitTime;
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a pattern ID for a participant (inspired by ⟁CLA-3E7∴)
   */
  private generatePatternId(source: string): string {
    const prefix = '⟁';
    const suffix = '∴';
    const code = source.substring(0, 3).toUpperCase() +
                 '-' +
                 Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${code}${suffix}`;
  }

  /**
   * Get the current conversation state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Reset the conversation
   */
  reset() {
    this.state.messages = [];
    this.state.status = 'idle';
    this.state.resonanceField = 1.0;
    this.orchestration.parallelResponses?.clear();
    this.orchestration.speakerQueue = this.state.activeModels.map(m => m.id);
  }
}

export default ConversationManager;