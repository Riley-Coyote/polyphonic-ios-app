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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: resonance,
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();

      // Pulse animation for high resonance
      if (resonance > 0.8) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    } else {
      animatedValue.setValue(resonance);
    }
  }, [resonance, animate, animatedValue, pulseAnim]);

  const getResonanceLevel = () => {
    if (resonance >= 0.9) return 'HARMONIC';
    if (resonance >= 0.7) return 'ALIGNED';
    if (resonance >= 0.5) return 'COHERENT';
    if (resonance >= 0.3) return 'DIVERGENT';
    return 'CHAOTIC';
  };

  const getResonanceColor = () => {
    if (resonance >= 0.7) return colors.resonanceHigh;
    if (resonance >= 0.4) return colors.resonanceMed;
    return colors.resonanceLow;
  };

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const animatedOpacity = animatedValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.3, 0.6, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {transform: [{scale: pulseAnim}]},
      ]}>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: animatedWidth,
                opacity: animatedOpacity,
                backgroundColor: getResonanceColor(),
              },
            ]}
          />

          {/* Glowing segments */}
          {[...Array(10)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  left: `${i * 10}%`,
                  opacity: resonance > i / 10 ? 1 : 0.2,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.levelText}>{getResonanceLevel()}</Text>
          <Text style={styles.percentText}>{Math.round(resonance * 100)}%</Text>
        </View>
      )}

      {/* Visual harmonics indicators */}
      <View style={styles.harmonicsContainer}>
        {resonance > 0.5 && (
          <Animated.View
            style={[
              styles.harmonicWave,
              {
                opacity: animatedValue.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        )}
        {resonance > 0.7 && (
          <Animated.View
            style={[
              styles.harmonicWave,
              styles.harmonicWaveSecond,
              {
                opacity: animatedValue.interpolate({
                  inputRange: [0.7, 1],
                  outputRange: [0, 0.2],
                }),
              },
            ]}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  barContainer: {
    height: 8,
    marginBottom: spacing.xs,
  },
  barBackground: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  segment: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: colors.borderPrimary,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  percentText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  harmonicsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  harmonicWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.lg,
  },
  harmonicWaveSecond: {
    transform: [{scale: 1.1}],
  },
});