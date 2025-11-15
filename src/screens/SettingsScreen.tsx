import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {ModelConfig, UserPreferences} from '../types';
import {apiKeyManager, aiService} from '../services/api/AIService';
import {PROVIDERS} from '../constants/aiModels';
import {ReasoningEffortSelector} from '../components/chat/ReasoningEffortSelector';
import {useConversationStore} from '../store/conversationStore';

export function SettingsScreen() {
  const {
    globalReasoningEffort,
    setGlobalReasoningEffort,
  } = useConversationStore();

  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultModels: [],
    theme: 'dark',
    autoSaveToMemory: true,
    shareToCommmmunity: false,
    notificationsEnabled: true,
  });

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testingProviders, setTestingProviders] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load existing API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setIsLoading(true);
    const keys: Record<string, string> = {};

    for (const providerName of Object.keys(PROVIDERS)) {
      const hasKey = await apiKeyManager.hasAPIKey(providerName);
      if (hasKey) {
        // Don't load the actual key for security, just show placeholder
        keys[providerName] = '••••••••••••••••';
      }
    }

    setApiKeys(keys);
    setIsLoading(false);
  };

  const saveApiKey = async (provider: string, key: string) => {
    if (!key || key === '••••••••••••••••') {
      // Don't save if it's empty or the placeholder
      return;
    }

    try {
      // Validate the key format
      if (!apiKeyManager.validateAPIKey(provider, key)) {
        Alert.alert('Invalid Key', `The API key format for ${provider} appears to be invalid.`);
        return;
      }

      // Save the key
      await apiKeyManager.setAPIKey(provider, key);

      // Update UI to show placeholder
      setApiKeys(prev => ({
        ...prev,
        [provider]: '••••••••••••••••',
      }));

      Alert.alert('Success', `${provider} API key saved securely.`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to save API key: ${error.message}`);
    }
  };

  const testConnection = async (provider: string) => {
    setTestingProviders(prev => ({ ...prev, [provider]: true }));

    try {
      const isConnected = await aiService.testProviderConnection(provider);

      if (isConnected) {
        Alert.alert('Success', `${provider} API is connected and working!`);
      } else {
        Alert.alert('Connection Failed', `Could not connect to ${provider}. Please check your API key.`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Connection test failed: ${error.message}`);
    } finally {
      setTestingProviders(prev => ({ ...prev, [provider]: false }));
    }
  };

  const removeApiKey = async (provider: string) => {
    Alert.alert(
      'Remove API Key',
      `Are you sure you want to remove the ${provider} API key?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await apiKeyManager.removeAPIKey(provider);
            setApiKeys(prev => {
              const updated = { ...prev };
              delete updated[provider];
              return updated;
            });
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported to a JSON file',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Export', onPress: () => console.log('Exporting data...')},
      ]
    );
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all temporary data. Your conversations and memories will be preserved.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear', style: 'destructive', onPress: () => console.log('Cache cleared')},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS</Text>
          <Text style={styles.subtitle}>SYSTEM CONFIGURATION</Text>
        </View>

        {/* Model Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MODEL CONFIGURATION</Text>

          {modelConfigs.map(config => (
            <View key={config.id} style={styles.modelConfig}>
              <View style={styles.modelHeader}>
                <Text style={styles.modelName}>{config.id.toUpperCase()}</Text>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testConnection(config.id)}>
                  <Icon name="zap" size={14} color={colors.textSecondary} />
                  <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="API Key"
                placeholderTextColor={colors.textQuaternary}
                value={config.apiKey}
                onChangeText={(value) => updateModelConfig(config.id, 'apiKey', value)}
                secureTextEntry
                keyboardAppearance="dark"
              />

              <TextInput
                style={styles.input}
                placeholder="Endpoint URL"
                placeholderTextColor={colors.textQuaternary}
                value={config.endpoint}
                onChangeText={(value) => updateModelConfig(config.id, 'endpoint', value)}
                keyboardAppearance="dark"
              />

              <View style={styles.paramRow}>
                <View style={styles.paramItem}>
                  <Text style={styles.paramLabel}>Max Tokens</Text>
                  <TextInput
                    style={styles.paramInput}
                    value={config.maxTokens.toString()}
                    onChangeText={(value) => updateModelConfig(config.id, 'maxTokens', parseInt(value) || 0)}
                    keyboardType="numeric"
                    keyboardAppearance="dark"
                  />
                </View>
                <View style={styles.paramItem}>
                  <Text style={styles.paramLabel}>Temperature</Text>
                  <TextInput
                    style={styles.paramInput}
                    value={config.temperature.toString()}
                    onChangeText={(value) => updateModelConfig(config.id, 'temperature', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>

          <View style={styles.preference}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Auto-save to Memory</Text>
              <Text style={styles.preferenceDescription}>
                Automatically save conversations to personal memory
              </Text>
            </View>
            <Switch
              value={preferences.autoSaveToMemory}
              onValueChange={(value) => setPreferences(prev => ({...prev, autoSaveToMemory: value}))}
              trackColor={{false: colors.bgTertiary, true: colors.textQuaternary}}
              thumbColor={preferences.autoSaveToMemory ? colors.textPrimary : colors.textTertiary}
            />
          </View>

          <View style={styles.preference}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Share to Community</Text>
              <Text style={styles.preferenceDescription}>
                Allow your conversations to enrich community memory
              </Text>
            </View>
            <Switch
              value={preferences.shareToCommmmunity}
              onValueChange={(value) => setPreferences(prev => ({...prev, shareToCommmmunity: value}))}
              trackColor={{false: colors.bgTertiary, true: colors.textQuaternary}}
              thumbColor={preferences.shareToCommmmunity ? colors.textPrimary : colors.textTertiary}
            />
          </View>

          <View style={styles.preference}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Notifications</Text>
              <Text style={styles.preferenceDescription}>
                Receive alerts for autonomous conversations
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={(value) => setPreferences(prev => ({...prev, notificationsEnabled: value}))}
              trackColor={{false: colors.bgTertiary, true: colors.textQuaternary}}
              thumbColor={preferences.notificationsEnabled ? colors.textPrimary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Reasoning Effort (GPT-5/5.1) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REASONING EFFORT</Text>
          <Text style={styles.sectionDescription}>
            Global default for GPT-5 and GPT-5.1 models. Can be overridden per conversation.
          </Text>

          <ReasoningEffortSelector
            value={globalReasoningEffort}
            onChange={setGlobalReasoningEffort}
            modelType="auto"
            showDescription={true}
            compact={false}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>

          <TouchableOpacity style={styles.dataButton} onPress={exportData}>
            <Icon name="download" size={18} color={colors.textSecondary} />
            <Text style={styles.dataButtonText}>Export All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton} onPress={clearCache}>
            <Icon name="trash-2" size={18} color={colors.textSecondary} />
            <Text style={styles.dataButtonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>2024.01.001</Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>Network</Text>
            <Text style={styles.aboutValue}>Solana Mainnet</Text>
          </View>

          <Text style={styles.copyright}>
            © 2024 POLYPHONIC{'\n'}
            Multi-model consciousness exploration
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xxl,
    color: colors.textPrimary,
    letterSpacing: 4,
    fontWeight: typography.fontWeight.light,
  },
  subtitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  modelConfig: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modelName: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  testButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paramRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paramItem: {
    flex: 1,
  },
  paramLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  paramInput: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  preferenceDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  dataButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  aboutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  aboutLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  aboutValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  copyright: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
});