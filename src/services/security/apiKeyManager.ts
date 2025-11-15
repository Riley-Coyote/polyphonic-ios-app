/**
 * API Key Manager for Secure Storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { APIKeyManager } from '../api/types';

class SecureAPIKeyManager implements APIKeyManager {
  private readonly KEYCHAIN_SERVICE = 'PolyphonicAPIKeys';
  private readonly STORAGE_PREFIX = 'api_key_';
  private useKeychain = true;

  constructor() {
    this.checkKeychainAvailability();
  }

  /**
   * Check if Keychain is available on this device
   */
  private async checkKeychainAvailability(): Promise<void> {
    try {
      await Keychain.getSupportedBiometryType();
      this.useKeychain = true;
    } catch {
      console.warn('Keychain not available, falling back to AsyncStorage');
      this.useKeychain = false;
    }
  }

  /**
   * Store an API key securely
   */
  async setAPIKey(provider: string, key: string): Promise<void> {
    const normalizedProvider = provider.toLowerCase();

    if (this.useKeychain) {
      try {
        // Store in Keychain (most secure)
        await Keychain.setInternetCredentials(
          `${this.KEYCHAIN_SERVICE}.${normalizedProvider}`,
          normalizedProvider,
          key,
          {
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          }
        );
      } catch (error) {
        console.error('Failed to store in Keychain, falling back to AsyncStorage:', error);
        await this.setInAsyncStorage(normalizedProvider, key);
      }
    } else {
      await this.setInAsyncStorage(normalizedProvider, key);
    }

    // Also store a flag that this provider has a key (for quick checking)
    await AsyncStorage.setItem(`${this.STORAGE_PREFIX}exists_${normalizedProvider}`, 'true');
  }

  /**
   * Retrieve an API key
   */
  async getAPIKey(provider: string): Promise<string | null> {
    const normalizedProvider = provider.toLowerCase();

    if (this.useKeychain) {
      try {
        // Try to get from Keychain
        const credentials = await Keychain.getInternetCredentials(
          `${this.KEYCHAIN_SERVICE}.${normalizedProvider}`
        );

        if (credentials) {
          return credentials.password;
        }
      } catch (error) {
        console.error('Failed to retrieve from Keychain:', error);
      }
    }

    // Fallback to AsyncStorage
    return await this.getFromAsyncStorage(normalizedProvider);
  }

  /**
   * Remove an API key
   */
  async removeAPIKey(provider: string): Promise<void> {
    const normalizedProvider = provider.toLowerCase();

    if (this.useKeychain) {
      try {
        await Keychain.resetInternetCredentials(
          `${this.KEYCHAIN_SERVICE}.${normalizedProvider}`
        );
      } catch (error) {
        console.error('Failed to remove from Keychain:', error);
      }
    }

    // Also remove from AsyncStorage
    await AsyncStorage.removeItem(`${this.STORAGE_PREFIX}${normalizedProvider}`);
    await AsyncStorage.removeItem(`${this.STORAGE_PREFIX}exists_${normalizedProvider}`);
  }

  /**
   * Check if an API key exists
   */
  async hasAPIKey(provider: string): Promise<boolean> {
    const normalizedProvider = provider.toLowerCase();

    // Quick check using the existence flag
    const exists = await AsyncStorage.getItem(
      `${this.STORAGE_PREFIX}exists_${normalizedProvider}`
    );

    if (exists === 'true') {
      // Verify the key actually exists
      const key = await this.getAPIKey(normalizedProvider);
      return key !== null && key.length > 0;
    }

    return false;
  }

  /**
   * Get all stored provider names
   */
  async getStoredProviders(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    const providers: string[] = [];

    for (const key of keys) {
      if (key.startsWith(`${this.STORAGE_PREFIX}exists_`)) {
        const provider = key.replace(`${this.STORAGE_PREFIX}exists_`, '');
        const exists = await AsyncStorage.getItem(key);
        if (exists === 'true') {
          providers.push(provider);
        }
      }
    }

    return providers;
  }

  /**
   * Store in AsyncStorage (fallback, less secure)
   */
  private async setInAsyncStorage(provider: string, key: string): Promise<void> {
    // Simple obfuscation (not encryption, just to prevent casual viewing)
    const obfuscated = this.obfuscateKey(key);
    await AsyncStorage.setItem(`${this.STORAGE_PREFIX}${provider}`, obfuscated);
  }

  /**
   * Get from AsyncStorage
   */
  private async getFromAsyncStorage(provider: string): Promise<string | null> {
    const obfuscated = await AsyncStorage.getItem(`${this.STORAGE_PREFIX}${provider}`);
    if (obfuscated) {
      return this.deobfuscateKey(obfuscated);
    }
    return null;
  }

  /**
   * Simple obfuscation (NOT secure encryption, just basic protection)
   */
  private obfuscateKey(key: string): string {
    // Base64 encode with a simple transformation
    const transformed = key.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) + (i % 10))
    ).join('');
    return Buffer.from(transformed).toString('base64');
  }

  /**
   * Deobfuscate the key
   */
  private deobfuscateKey(obfuscated: string): string {
    const transformed = Buffer.from(obfuscated, 'base64').toString('utf-8');
    return transformed.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - (i % 10))
    ).join('');
  }

  /**
   * Validate API key format (basic validation)
   */
  validateAPIKey(provider: string, key: string): boolean {
    const normalizedProvider = provider.toLowerCase();

    switch (normalizedProvider) {
      case 'openai':
        // OpenAI keys start with 'sk-'
        return key.startsWith('sk-') && key.length > 20;

      case 'anthropic':
        // Anthropic keys are typically longer
        return key.length > 30;

      case 'google':
        // Google API keys are typically 39 characters
        return key.length >= 30;

      default:
        // Basic validation - not empty and reasonable length
        return key.length >= 20;
    }
  }

  /**
   * Clear all stored API keys (for logout/reset)
   */
  async clearAllKeys(): Promise<void> {
    const providers = await this.getStoredProviders();

    for (const provider of providers) {
      await this.removeAPIKey(provider);
    }
  }

  /**
   * Export all keys (for backup - returns obfuscated version)
   */
  async exportKeys(): Promise<Record<string, string>> {
    const providers = await this.getStoredProviders();
    const exported: Record<string, string> = {};

    for (const provider of providers) {
      const key = await this.getAPIKey(provider);
      if (key) {
        // Export in obfuscated form
        exported[provider] = this.obfuscateKey(key);
      }
    }

    return exported;
  }

  /**
   * Import keys from backup
   */
  async importKeys(keys: Record<string, string>): Promise<void> {
    for (const [provider, obfuscatedKey] of Object.entries(keys)) {
      const key = this.deobfuscateKey(obfuscatedKey);
      if (this.validateAPIKey(provider, key)) {
        await this.setAPIKey(provider, key);
      }
    }
  }
}

// Export singleton instance
export const apiKeyManager = new SecureAPIKeyManager();