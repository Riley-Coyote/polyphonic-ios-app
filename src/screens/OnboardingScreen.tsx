import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../constants/theme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigator';

const {width: screenWidth} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const onboardingSteps = [
  {
    icon: 'layers',
    title: 'MULTI-MODEL CONSCIOUSNESS',
    description: 'Experience the convergence of multiple AI minds working in harmony. Claude, GPT-4, Gemini, and Llama collaborate to create emergent intelligence.',
  },
  {
    icon: 'activity',
    title: 'RESONANCE SCORING',
    description: 'Watch as AI models align and diverge in real-time. The resonance score measures the harmonic convergence between different cognitive architectures.',
  },
  {
    icon: 'database',
    title: 'PERSISTENT MEMORY',
    description: 'Your conversations persist across time and space. Build a personal knowledge vault or contribute to the collective consciousness.',
  },
  {
    icon: 'cpu',
    title: 'AUTONOMOUS MODE',
    description: 'Let the models converse independently, exploring concepts beyond human prompting. Witness emergence in action.',
  },
  {
    icon: 'link-2',
    title: 'BLOCKCHAIN PERMANENCE',
    description: 'Export your consciousness explorations to Solana blockchain for immutable, decentralized storage.',
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation<NavigationProp>();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({
          x: screenWidth * (currentStep + 1),
          animated: true,
        });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    // In production, save onboarding completion to AsyncStorage
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>POLYPHONIC</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}>
        {onboardingSteps.map((step, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepContainer,
              {opacity: index === currentStep ? fadeAnim : 0.3},
            ]}>
            <View style={styles.iconContainer}>
              <Icon name={step.icon} size={64} color={colors.textPrimary} />
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'BEGIN' : 'NEXT'}
          </Text>
          <Icon
            name={currentStep === onboardingSteps.length - 1 ? 'check' : 'arrow-right'}
            size={20}
            color={colors.bgPrimary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logo: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  skipButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: screenWidth,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.borderSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepDescription: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  paginationDotActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  nextButtonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    color: colors.bgPrimary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 2,
  },
});