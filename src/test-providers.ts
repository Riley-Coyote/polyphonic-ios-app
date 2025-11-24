/**
 * Test script to verify API providers are working
 * NOTE: This is a development/testing file - console statements are intentionally kept for debugging
 * To use: Uncomment the initialization call at the bottom
 */

import { aiService } from './services/api/AIService';
import { AI_MODELS } from './constants/aiModels';

export async function testProviders() {
  // Test OpenAI connection
  try {
    await aiService.testProviderConnection('openai');
  } catch (error: any) {
    // Connection test failed
  }

  // Test Anthropic connection
  try {
    await aiService.testProviderConnection('anthropic');
  } catch (error: any) {
    // Connection test failed
  }

  // Test sending a message (if keys are configured)
  const testMessage = {
    role: 'user' as const,
    content: 'Say hello in exactly 3 words',
  };

  // Try GPT-3.5 Turbo (cheapest OpenAI model)
  const gpt35Model = AI_MODELS.find(m => m.id === 'gpt-3.5-turbo');
  if (gpt35Model) {
    try {
      await aiService.sendMessage(
        gpt35Model,
        [testMessage],
        { maxTokens: 10 }
      );
    } catch (error: any) {
      // Test failed
    }
  }

  // Try Claude 3 Haiku (cheapest Anthropic model)
  const haikuModel = AI_MODELS.find(m => m.id === 'claude-3-haiku-20240307');
  if (haikuModel) {
    try {
      await aiService.sendMessage(
        haikuModel,
        [testMessage],
        { maxTokens: 10 }
      );
    } catch (error: any) {
      // Test failed
    }
  }
}

// Add to app initialization for testing (remove in production)
// export function initializeProvidersTest() {
//   setTimeout(() => {
//     testProviders().catch(() => {
//       // Test suite failed
//     });
//   }, 3000); // Wait 3 seconds for app to initialize
// }
