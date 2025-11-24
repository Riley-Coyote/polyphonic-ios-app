import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';

interface ResonanceIndicatorProps {
  resonance: number; // 0 to 1
  showLabel?: boolean;
  animate?: boolean;
}

export function ResonanceIndicator({
  resonance,
  showLabel = true,
  animate = true,
}: ResonanceIndicatorProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: resonance,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(resonance);
    }
  }, [resonance, animate, animatedValue]);

  const getResonanceColor = () => {
    if (resonance >= 0.7) return colors.resonanceHigh;
    if (resonance >= 0.4) return colors.resonanceMed;
    return colors.resonanceLow;
  };

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getAccessibilityDescription = () => {
    const percent = Math.round(resonance * 100);
    let description = '';

    if (resonance >= 0.9) description = 'Models are in perfect alignment';
    else if (resonance >= 0.7) description = 'Models show strong agreement';
    else if (resonance >= 0.5) description = 'Models are moderately aligned';
    else if (resonance >= 0.3) description = 'Models show some disagreement';
    else description = 'Models have significant differences';

    return `Resonance: ${percent} percent. ${description}`;
  };

  return (
    <View
      style={styles.container}
      // Accessibility props
      accessible={true}
      accessibilityLabel={getAccessibilityDescription()}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(resonance * 100),
        text: `${Math.round(resonance * 100)} percent`
      }}
      accessibilityHint="Shows how aligned the AI model responses are"
    >
      {showLabel && (
        <Text style={styles.label}>RESONANCE</Text>
      )}

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: animatedWidth,
                backgroundColor: getResonanceColor(),
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.percentText}>{Math.round(resonance * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSecondary,
  },
  label: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
    letterSpacing: 1.5,
    marginRight: spacing.sm,
  },
  barContainer: {
    flex: 1,
    height: 3,
    marginRight: spacing.sm,
  },
  barBackground: {
    flex: 1,
    backgroundColor: `${colors.textQuaternary}20`,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  percentText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    minWidth: 35,
    textAlign: 'right',
  },
});