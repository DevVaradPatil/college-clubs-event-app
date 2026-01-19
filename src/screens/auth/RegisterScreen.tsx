import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { Input, Button, ImageUpload } from "../../components/common";
import { theme } from "../../utils/theme";
import type { RegisterCredentials } from "../../types";
import { AuthService } from "../../services/auth";
import { useCustomAlert } from "../../contexts/AlertContext";

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { alert } = useCustomAlert();
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [wantsToCreateClub, setWantsToCreateClub] = useState(false);
  const [clubData, setClubData] = useState({
    clubName: "",
    clubDescription: "",
    clubCategory: "Other",
    clubWebsite: "",
    clubLogo: "",
    clubCoverImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");

  const updateField = (field: keyof RegisterCredentials, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const updateClubField = (field: string, value: string) => {
    setClubData((prev) => ({ ...prev, [field]: value }));
  };
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert({
        title: "Error",
        message: "Please enter your name",
        type: "error"
      });
      return false;
    }
    if (!formData.email.trim()) {
      alert({
        title: "Error",
        message: "Please enter your email",
        type: "error"
      });
      return false;
    }
    if (!formData.email.includes("@")) {
      alert({
        title: "Error",
        message: "Please enter a valid email address",
        type: "error"
      });
      return false;
    }
    if (formData.password.length < 6) {
      alert({
        title: "Error",
        message: "Password must be at least 6 characters long",
        type: "error"
      });
      return false;
    }    if (formData.password !== formData.confirmPassword) {
      alert({
        title: "Error",
        message: "Passwords do not match",
        type: "error"
      });
      return false;
    }
    if (wantsToCreateClub) {
      if (!clubData.clubName.trim()) {
        alert({
          title: "Error",
          message: "Please enter your club name",
          type: "error"
        });
        return false;
      }
      if (!clubData.clubDescription.trim()) {
        alert({
          title: "Error",
          message: "Please enter a club description",
          type: "error"
        });
        return false;
      }
    }
    return true;
  };  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const registrationData = { ...formData };
      
      // Add profile image if provided
      if (profileImage) {
        registrationData.profileImage = profileImage;
      }
      
      if (wantsToCreateClub) {
        const createClubData: any = {
          clubName: clubData.clubName,
          clubDescription: clubData.clubDescription,
          clubCategory: clubData.clubCategory,
        };
        
        // Only add optional fields if they have values
        if (clubData.clubWebsite && clubData.clubWebsite.trim()) {
          createClubData.clubWebsite = clubData.clubWebsite.trim();
        }
        
        if (clubData.clubLogo && clubData.clubLogo.trim()) {
          createClubData.clubLogo = clubData.clubLogo.trim();
        }
        
        if (clubData.clubCoverImage && clubData.clubCoverImage.trim()) {
          createClubData.clubCoverImage = clubData.clubCoverImage.trim();
        }
        
        registrationData.createClub = createClubData;
      }

      const { user, token } = await AuthService.register(registrationData);

      console.log("Registration successful:", user);

      const successMessage = wantsToCreateClub 
        ? "Registration successful! Your club has been created and you are now the club leader."
        : "Registration successful! You can now log in.";

      alert({
        title: "Success",
        message: successMessage,
        type: "success",
        buttons: [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]
      });
    } catch (error: any) {
      alert({
        title: "Registration Failed",
        message: error.message || "Registration failed. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };  
  const RegistrationTypeSelector = () => (
    <View style={styles.registrationTypeContainer}>
      <View style={styles.registrationTypeButtons}>
        <TouchableOpacity
          style={[
            styles.registrationTypeButton,
            !wantsToCreateClub ? styles.registrationTypeButtonActive : null,
          ]}
          onPress={() => setWantsToCreateClub(false)}
        >
          <Ionicons
            name="person"
            size={24}
            color={
              !wantsToCreateClub
                ? theme.colors.textInverse
                : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.registrationTypeButtonText,
              !wantsToCreateClub ? styles.registrationTypeButtonTextActive : null,
            ]}
          >
            Student
          </Text>
          <Text
            style={[
              styles.registrationTypeButtonSubtext,
              !wantsToCreateClub ? styles.registrationTypeButtonSubtextActive : null,
            ]}
          >
            Join clubs & events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.registrationTypeButton,
            wantsToCreateClub ? styles.registrationTypeButtonActive : null,
          ]}
          onPress={() => setWantsToCreateClub(true)}
        >
          <Ionicons
            name="people"
            size={24}
            color={
              wantsToCreateClub
                ? theme.colors.textInverse
                : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.registrationTypeButtonText,
              wantsToCreateClub ? styles.registrationTypeButtonTextActive : null,
            ]}
          >
            Club Leader
          </Text>
          <Text
            style={[
              styles.registrationTypeButtonSubtext,
              wantsToCreateClub ? styles.registrationTypeButtonSubtextActive : null,
            ]}
          >
            Create & manage a club
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.textInverse}
                />
              </TouchableOpacity>              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Choose your path in the club community</Text>
            </View>            <View style={styles.formContainer}>
              <RegistrationTypeSelector />
              
              {/* Profile Image Upload - Only show for students */}
              {!wantsToCreateClub && (
                <View style={styles.profileImageSection}>
                  <Text style={styles.sectionTitle}>Profile Picture</Text>
                  <Text style={styles.sectionSubtitle}>Add a photo to personalize your profile</Text>
                  <ImageUpload
                    currentImageUrl={profileImage}
                    onImageUpload={setProfileImage}
                    placeholder="Upload Photo"
                    size="medium"
                    shape="circle"
                    folder="profile_images"
                  />
                </View>
              )}
              
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text: string) => updateField("name", text)}
                leftIcon="person-outline"
                autoCapitalize="words"
              />
              <Input
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(text: string) => updateField("email", text)}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
                {wantsToCreateClub && (
                <View style={styles.clubSection}>
                  <View style={styles.clubSectionHeader}>
                    <Ionicons 
                      name="business" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.sectionTitle}>Club Information</Text>
                  </View>
                  <Text style={styles.clubSectionSubtitle}>
                    Tell us about the club you want to create
                  </Text>
                  
                  {/* Club Images Section */}
                  <View style={styles.clubImagesSection}>
                    <Text style={styles.clubImagesTitle}>Club Branding</Text>
                    <View style={styles.clubImagesContainer}>
                      <View style={styles.clubImageItem}>
                        <Text style={styles.clubImageLabel}>Club Logo</Text>
                        <Text style={styles.clubImageDescription}>Upload your club's logo</Text>
                        <ImageUpload
                          currentImageUrl={clubData.clubLogo}
                          onImageUpload={(url) => updateClubField("clubLogo", url)}
                          placeholder="Club Logo"
                          size="medium"
                          shape="circle"
                          folder="club_logos"
                        />
                      </View>
                      <View style={styles.clubImageItem}>
                        <Text style={styles.clubImageLabel}>Cover Photo</Text>
                        <Text style={styles.clubImageDescription}>Upload a cover image for your club</Text>
                        <ImageUpload
                          currentImageUrl={clubData.clubCoverImage}
                          onImageUpload={(url) => updateClubField("clubCoverImage", url)}
                          placeholder="Cover Image"
                          size="large"
                          shape="rectangle"
                          folder="club_covers"
                        />
                      </View>
                    </View>
                  </View>
                  
                  <Input
                    placeholder="Club Name"
                    value={clubData.clubName}
                    onChangeText={(text: string) => updateClubField("clubName", text)}
                    leftIcon="business-outline"
                    autoCapitalize="words"
                  />
                  <Input
                    placeholder="Club Description"
                    value={clubData.clubDescription}
                    onChangeText={(text: string) => updateClubField("clubDescription", text)}
                    leftIcon="document-text-outline"
                    multiline
                    numberOfLines={3}
                  />
                  <Input
                    placeholder="Club Website (Optional)"
                    value={clubData.clubWebsite}
                    onChangeText={(text: string) => updateClubField("clubWebsite", text)}
                    leftIcon="globe-outline"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              )}
              
              <Input
                placeholder="Password"
                value={formData.password}
                onChangeText={(text: string) => updateField("password", text)}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              <Input
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text: string) =>
                  updateField("confirmPassword", text)
                }
                leftIcon="lock-closed-outline"
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  showConfirmPassword ? "eye-off-outline" : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />              <Button
                title={wantsToCreateClub ? "Create Club & Account" : "Create Account"}
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
              />
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?
                  <Text style={styles.loginLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing["3xl"],
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },  backButton: {
    position: "absolute",
    left: theme.spacing.lg,
    top: theme.spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
  roleContainer: {
    marginBottom: theme.spacing.lg,
  },
  roleLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  roleButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  roleButtonTextActive: {
    color: theme.colors.textInverse,  },
  registrationTypeContainer: {
    marginBottom: theme.spacing.xl,
  },
  registrationTypeLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  registrationTypeButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  registrationTypeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    minHeight: 120,
    justifyContent: "center",
  },
  registrationTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registrationTypeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  registrationTypeButtonTextActive: {
    color: theme.colors.textInverse,
  },
  registrationTypeButtonSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  registrationTypeButtonSubtextActive: {
    color: theme.colors.textInverse,
    opacity: 0.9,
  },
  toggleContainer: {
    marginBottom: theme.spacing.lg,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  toggleText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },  clubSection: {
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}08`,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  clubSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  clubSectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  clubImagesSection: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  clubImagesTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  clubImagesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  clubImageItem: {
    alignItems: 'center',
    width: '100%',
  },
  clubImageLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  clubImageDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  registerButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  loginLink: {
    alignItems: "center",
    padding: theme.spacing.md,
  },
  loginLinkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  loginLinkBold: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});
