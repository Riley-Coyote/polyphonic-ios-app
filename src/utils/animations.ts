import {Animated, Easing} from 'react-native';

/**
 * Smooth spring animation preset
 */
export const springConfig = {
  useNativeDriver: true,
  tension: 100,
  friction: 8,
  velocity: 0,
};

/**
 * Subtle fade in animation
 */
export const fadeInAnimation = (animatedValue: Animated.Value, delay = 0) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: 300,
    delay,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  });
};

/**
 * Scale animation for press feedback
 */
export const pressAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      ...springConfig,
    }),
  ]);
};

/**
 * Slide up animation for modals/screens
 */
export const slideUpAnimation = (animatedValue: Animated.Value) => {
  return Animated.spring(animatedValue, {
    toValue: 0,
    ...springConfig,
    velocity: 2,
  });
};

/**
 * Subtle bounce animation
 */
export const bounceAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.05,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      ...springConfig,
    }),
  ]);
};

/**
 * Stagger animation for list items
 */
export const staggerAnimation = (
  animatedValues: Animated.Value[],
  delayBetween = 50
) => {
  return Animated.stagger(
    delayBetween,
    animatedValues.map((value) =>
      Animated.spring(value, {
        toValue: 1,
        ...springConfig,
      })
    )
  );
};

/**
 * Smooth rotation animation
 */
export const rotateAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  });
};

/**
 * Pulse animation for attention
 */
export const pulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Shimmer animation for loading states
 */
export const shimmerAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};