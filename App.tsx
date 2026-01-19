import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { AlertProvider } from './src/contexts/AlertContext';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AlertProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AlertProvider>
      </NavigationContainer>
    </Provider>
  );
}
