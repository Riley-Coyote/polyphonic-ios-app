import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../constants/theme';

interface MenuIconProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export function MenuIcon({onPress, color = colors.textPrimary, size = 24}: MenuIconProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Icon name="menu" size={size} color={color} />
    </TouchableOpacity>
  );
}

interface PlusIconProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export function PlusIcon({onPress, color = colors.textPrimary, size = 24}: PlusIconProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Icon name="plus" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});