import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";

import { Input, Button } from "../../components/common";
import { loginSuccess } from "../../store/slices/authSlice";
import { theme } from "../../utils/theme";
import type { LoginCredentials } from "../../types";
import { AuthService } from "../../services/auth";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const updateField = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };
  const handleLogin = async () => {
    if (!credentials.email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (!credentials.password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const { user, token } = await AuthService.login(credentials);

      console.log("Login successful:", user);

      dispatch(
        loginSuccess({
          user,
          token,
        })
      );
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>          <View style={styles.header}>
            <Image 
              source={require('../../../assets/welcome-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              placeholder="Email Address"
              value={credentials.email}
              onChangeText={(text: string) => updateField("email", text)}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              placeholder="Password"
              value={credentials.password}
              onChangeText={(text: string) => updateField("password", text)}
              leftIcon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerLinkText}>
                Don't have an account?
                <Text style={styles.registerLinkBold}> Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },  header: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textInverse,
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius["2xl"],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  loginButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  registerLink: {
    alignItems: "center",
    padding: theme.spacing.md,
  },
  registerLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  registerLinkBold: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});

export default LoginScreen;
