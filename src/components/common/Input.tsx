import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: object;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}      <View style={styles.inputContainer}>
        {leftIcon ? (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color={theme.colors.textSecondary} />
          </View>
        ) : null}<TextInput
          style={[
            styles.input,
            error ? styles.inputError : {},
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon ? styles.inputWithRightIcon : {},
            props.multiline ? styles.inputMultiline : {},
            style
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}        />
        {rightIcon ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: theme.sizes.input.height.md,
    textAlignVertical: 'center',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing['2xl'] + theme.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing['2xl'] + theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  leftIconContainer: {
    position: 'absolute',
    left: theme.spacing.md,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    zIndex: 1,
    padding: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});