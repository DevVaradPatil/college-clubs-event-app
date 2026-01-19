import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector, useDispatch } from "react-redux";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";

import AuthNavigator from "./AuthNavigator";
import ClubNavigator from "./ClubNavigator";
import StudentNavigator from "./StudentNavigator";

import { theme } from "../utils/theme";
import type { RootStackParamList, RootState } from "../types";
import { auth } from "../services/firebase";
import { AuthService } from "../services/auth";
import { loginSuccess, logout } from "../store/slices/authSlice";

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [initializing, setInitializing] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await AuthService.getUserData(firebaseUser.uid);
          if (userData) {
            const token = await firebaseUser.getIdToken();
            dispatch(
              loginSuccess({
                user: userData,
                token,
              })
            );
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          dispatch(logout());
        }
      } else {
        dispatch(logout());
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, [dispatch, initializing]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.managedClubs && user.managedClubs.length > 0 ? (
        <Stack.Screen name="Club" component={ClubNavigator} />
      ) : (
        <Stack.Screen name="Student" component={StudentNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default AppNavigator;
