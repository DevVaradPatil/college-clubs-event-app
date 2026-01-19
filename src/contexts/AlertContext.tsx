import React, { createContext, useContext, useState } from 'react';
import { Alert as RNAlert } from 'react-native';
import { Alert, AlertProps, AlertButton } from '../components/common/Alert';

interface AlertContextProps {
  alert: (options: Omit<AlertProps, 'visible' | 'onDismiss'>) => void;
  confirm: (
    title: string, 
    message?: string, 
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    type?: 'default' | 'success' | 'warning' | 'error'
  ) => void;
}

const AlertContext = createContext<AlertContextProps>({
  alert: () => {
    // Fallback to React Native Alert if context is used outside provider
    RNAlert.alert('Alert Context used outside of AlertProvider');
  },
  confirm: () => {
    // Fallback to React Native Alert if context is used outside provider
    RNAlert.alert('Alert Context used outside of AlertProvider');
  },
});

export const useCustomAlert = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertProps>({
    visible: false,
    title: '',
  });

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const alert = (options: Omit<AlertProps, 'visible' | 'onDismiss'>) => {
    setAlertConfig({
      ...options,
      visible: true,
      onDismiss: hideAlert,
    });
  };

  const confirm = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    type: 'default' | 'success' | 'warning' | 'error' = 'default'
  ) => {
    const buttons: AlertButton[] = [
      {
        text: cancelText,
        style: 'cancel',
        onPress: () => {
          if (onCancel) onCancel();
          hideAlert();
        },
      },
      {
        text: confirmText,
        style: type === 'error' ? 'destructive' : 'default',
        onPress: () => {
          if (onConfirm) onConfirm();
          hideAlert();
        },
      },
    ];

    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      onDismiss: hideAlert,
      type,
    });
  };

  return (
    <AlertContext.Provider value={{ alert, confirm }}>
      {children}
      <Alert {...alertConfig} />
    </AlertContext.Provider>
  );
};
