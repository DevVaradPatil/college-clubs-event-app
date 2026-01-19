import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import { Button } from './Button';

const { width, height } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
  onDismiss?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  type?: 'default' | 'success' | 'warning' | 'error';
}

export const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  cancelable = true,
  onDismiss,
  icon,
  iconColor,
  type = 'default',
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'error':
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) button.onPress();
    if (!button.style || button.style === 'default') {
      onDismiss?.();
    }
  };

  const getButtonVariant = (button: AlertButton): 'primary' | 'secondary' | 'outline' => {
    if (button.variant) return button.variant;
    
    switch (button.style) {
      case 'destructive':
        return 'outline';
      case 'cancel':
        return 'outline';
      default:
        return 'primary';
    }
  };

  const getButtonStyle = (button: AlertButton, index: number) => {
    const style: any = {};
    
    // Add margin between buttons
    if (index > 0) {
      style.marginLeft = theme.spacing.md;
    }
    
    // Special styling for destructive buttons
    if (button.style === 'destructive') {
      style.borderColor = theme.colors.error;
    }

    return style;
  };

  const renderButtons = () => {
    if (buttons.length === 1) {
      const button = buttons[0];
      return (
        <Button
          title={button.text}
          onPress={() => handleButtonPress(button)}
          variant={getButtonVariant(button)}
          style={{
            ...styles.singleButton,
            ...(button.style === 'destructive' ? { borderColor: theme.colors.error } : {}),
          }}
        />
      );
    }

    return (
      <View style={styles.buttonRow}>
        {buttons.map((button, index) => (
          <View key={index} style={styles.buttonContainer}>
            <Button
              title={button.text}
              onPress={() => handleButtonPress(button)}
              variant={getButtonVariant(button)}
              style={getButtonStyle(button, index)}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={cancelable ? onDismiss : undefined}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              {/* Icon */}
              {(icon || type !== 'default') ? (
                <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor()}15` }]}>
                  <Ionicons
                    name={getTypeIcon()}
                    size={32}
                    color={iconColor || getTypeColor()}
                  />
                </View>
              ) : null}

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {/* Buttons */}
              <View style={styles.buttonsContainer}>{renderButtons()}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonContainer: {
    flex: 1,
  },
  singleButton: {
    width: '100%',
  },
});
