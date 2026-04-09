import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type HeaderBackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function HeaderBackButton({
  onPress,
  style,
}: HeaderBackButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Ionicons name="chevron-back" size={22} color="#138306" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#063f04',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
});
