import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing, typography, borderRadius} from '../../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message the constellation...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textQuaternary}
          multiline
          maxLength={4000}
          editable={!disabled}
          keyboardAppearance="dark"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}>
          <Icon
            name="send"
            size={20}
            color={message.trim() && !disabled ? colors.textPrimary : colors.textQuaternary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton}>
          <Icon name="paperclip" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Icon name="image" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Icon name="code" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.charCount}>
          {message.length}/4000
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    maxHeight: 120,
  },
  sendButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  toolButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  charCount: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    color: colors.textQuaternary,
  },
});