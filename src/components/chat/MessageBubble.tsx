import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';
import {Message} from '../../types';

interface MessageBubbleProps {
  message: Message;
  onLongPress?: () => void;
}

export function MessageBubble({message, onLongPress}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const getModelIcon = (model?: string) => {
    switch (model) {
      case 'claude-3':
        return 'hexagon';
      case 'gpt-4':
        return 'circle';
      case 'gemini':
        return 'triangle';
      case 'llama':
        return 'square';
      default:
        return 'message-circle';
    }
  };

  const getModelColor = (model?: string) => {
    // Still monochromatic but with subtle variations
    switch (model) {
      case 'claude-3':
        return colors.textPrimary;
      case 'gpt-4':
        return colors.textSecondary;
      case 'gemini':
        return colors.textTertiary;
      case 'llama':
        return colors.textQuaternary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        {opacity: fadeAnim},
      ]}>
      <TouchableOpacity
        onLongPress={onLongPress}
        activeOpacity={0.8}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
        {!isUser && message.model && (
          <View style={styles.modelIndicator}>
            <Icon
              name={getModelIcon(message.model)}
              size={14}
              color={getModelColor(message.model)}
            />
            <Text style={[styles.modelName, {color: getModelColor(message.model)}]}>
              {message.model.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[styles.content, isUser ? styles.userContent : styles.assistantContent]}>
          {message.content}
        </Text>

        {message.resonance && (
          <View style={styles.resonanceContainer}>
            <View style={styles.resonanceBar}>
              <View
                style={[
                  styles.resonanceFill,
                  {width: `${message.resonance * 100}%`},
                ]}
              />
            </View>
            <Text style={styles.resonanceText}>
              {Math.round(message.resonance * 100)}% resonance
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {message.edited && (
            <Text style={styles.edited}>edited</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  assistantBubble: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  modelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderPrimary,
  },
  modelName: {
    marginLeft: spacing.xs,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
  },
  content: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  userContent: {
    color: colors.textPrimary,
  },
  assistantContent: {
    color: colors.textSecondary,
  },
  resonanceContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
  },
  resonanceBar: {
    height: 2,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  resonanceFill: {
    height: '100%',
    backgroundColor: colors.resonanceHigh,
    borderRadius: borderRadius.full,
  },
  resonanceText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timestamp: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
  },
  edited: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
    fontStyle: 'italic',
  },
});