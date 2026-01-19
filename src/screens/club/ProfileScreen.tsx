import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common";
import { theme } from "../../utils/theme";
import { AuthService } from "../../services/auth";
import { ClubService } from "../../services/club";
import { CloudinaryService } from "../../services/cloudinary";
import { useCustomAlert } from "../../contexts/AlertContext";
import type { ClubStackParamList } from "../../types";
import type { Club } from "../../types/club";

const { width: screenWidth } = Dimensions.get('window');

type ProfileScreenNavigationProp = StackNavigationProp<
  ClubStackParamList,
  "Profile"
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { currentUser, logout } = useAuth();
  const { confirm, alert } = useCustomAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    phone?: string;
    bio?: string;
  }>({
    name: "",
    email: "",
  });
  const [clubData, setClubData] = useState<Club | null>(null);
  const [loadingClubData, setLoadingClubData] = useState(true);
  const handleLogout = () => {
    confirm(
      "Logout",
      "Are you sure you want to logout?",
      async () => {
        setIsLoading(true);
        try {
          await logout();
        } catch (error) {
          alert({
            title: "Error",
            message: "Failed to logout. Please try again.",
            type: "error"
          });
        } finally {
          setIsLoading(false);
        }
      },
      undefined,
      "Logout",
      "Cancel",
      "warning"
    );
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };
  const handleManageClub = () => {
    navigation.navigate("ManageClub");
  };
  // Fetch user data including phone and bio, and club data
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch user data
          const userData = await AuthService.getUserData(currentUser.uid);
          if (userData) {
            setUserData({
              name: userData.name || currentUser.displayName || "",
              email: userData.email || currentUser.email || "",
              phone: userData.phone || "",
              bio: userData.bio || "",
            });
          }
            // Fetch club data
          const userWithManagedClubs = userData as any; // Temporary type workaround
          if (userWithManagedClubs?.managedClubs && userWithManagedClubs.managedClubs.length > 0) {
            const clubId = userWithManagedClubs.managedClubs[0]; // Get the first managed club
            const club = await ClubService.getClubById(clubId);
            setClubData(club);
          }
        } catch (error) {
          console.error("Error fetching user/club data:", error);
        }
      }
      setLoadingClubData(false);
    };

    fetchData();
  }, [currentUser]);

  const ProfileOption = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.textInverse} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {showArrow ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* LinkedIn-style Header with Cover and Profile Images */}
      <View style={styles.linkedInHeader}>
        {/* Cover Image */}
        <ImageBackground
          source={{
            uri: clubData?.coverImage 
              ? clubData.coverImage // Use original URL directly
              : "https://via.placeholder.com/800x200/3B82F6/FFFFFF?text=Club+Cover"
          }}
          style={styles.coverImage}
          imageStyle={styles.coverImageStyle}
        >
          {/* Subtle gradient overlay only in the corner for the button */}
          <View style={styles.coverButtonArea}>
            <TouchableOpacity 
              style={styles.coverEditButton}
              onPress={() => navigation.navigate("ManageClub")}
            >
              <Ionicons name="camera" size={16} color={theme.colors.textInverse} />
            </TouchableOpacity>
          </View>
        </ImageBackground>


        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Club Logo */}
          <View style={styles.clubLogoContainer}>
            <Image
              source={{
                uri: clubData?.logo 
                  ? clubData.logo // Use original URL directly
                  : "https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Logo"
              }}
              style={styles.clubLogo}
            />
            <TouchableOpacity 
              style={styles.logoEditButton}
              onPress={() => navigation.navigate("ManageClub")}
            >
              <Ionicons name="camera" size={14} color={theme.colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Club and Manager Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.clubNameMain}>{clubData?.name || "Club Name"}</Text>
            <Text style={styles.clubCategory}>{clubData?.category || "Category"}</Text>
            
            {/* Manager Badge */}
            <View style={styles.managerBadge}>
              <View style={styles.managerInfo}>
                <Text style={styles.managerName}>{userData.name || "Manager"}</Text>
                <View style={styles.roleContainer}>
                  <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
                  <Text style={styles.roleText}>Club Administrator</Text>
                </View>
              </View>
            </View>

            {/* Club Stats */}
            <View style={styles.clubStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{clubData?.memberCount || 0}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>-</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>

            {/* Club Description */}
            {clubData?.description && (
              <Text style={styles.clubDescriptionMain}>{clubData.description}</Text>
            )}

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {clubData?.website && (
                <View style={styles.contactItem}>
                  <Ionicons name="globe-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.contactText}>{clubData.website}</Text>
                </View>
              )}
              {userData.phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.contactText}>{userData.phone}</Text>
                </View>
              )}
              {userData.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.contactText}>{userData.email}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Profile Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Management</Text>
        <View style={styles.optionsContainer}>
          <ProfileOption
            icon="person-outline"
            title="Edit Personal Details"
            subtitle="Update your name, email, and personal information"
            onPress={handleEditProfile}
          />
          <ProfileOption
            icon="business-outline"
            title="Manage Club"
            subtitle="Update club details, members, and settings"
            onPress={handleManageClub}
          />
        </View>
      </View>

      {/* Account Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.optionsContainer}>
          <ProfileOption
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => {}}
          />
          <ProfileOption
            icon="shield-outline"
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => {}}
          />
          <ProfileOption
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with using the app"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoading}
          style={styles.logoutButton}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  userName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  optionsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  logoutContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  infoContainer: {
    marginTop: theme.spacing.md,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoIcon: {
    marginRight: theme.spacing.sm,
  },  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    flex: 1,
    flexWrap: 'wrap',
  },
  clubInfoContainer: {
    marginTop: theme.spacing.lg,
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  clubIcon: {
    marginRight: theme.spacing.sm,
  },
  clubName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  clubDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  clubMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  clubMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  clubMetaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  // LinkedIn-style header styles
  linkedInHeader: {
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.lg,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverImageStyle: {
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  coverButtonArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
  },
  coverEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background for visibility
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  profileSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -60, // Overlap with cover image
  },
  clubLogoContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  clubLogo: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.full,
    borderWidth: 4,
    borderColor: theme.colors.background,
    backgroundColor: theme.colors.surface,
  },
  logoEditButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  clubNameMain: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubCategory: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'capitalize',
  },
  managerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  managerAvatar: {
    marginRight: theme.spacing.md,
  },
  managerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubStats: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  clubDescriptionMain: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  contactInfo: {
    gap: theme.spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
