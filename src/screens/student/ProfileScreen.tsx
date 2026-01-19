import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/auth';
import { Card, Button } from '../../components/common';
import { useCustomAlert } from '../../contexts/AlertContext';
import CloudinaryService from '../../services/cloudinary';
import type { RootState } from '../../store';
import type { StudentStackParamList } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<StudentStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const { confirm, alert } = useCustomAlert();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userData, setUserData] = React.useState<{name: string; email: string; phone?: string; bio?: string; profileImage?: string}>({
    name: '',
    email: ''
  });
  const handleLogout = () => {
    confirm(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        try {
          await logout();
        } catch (error) {
          alert({
            title: 'Error',
            message: 'Failed to logout. Please try again.',
            type: 'error'
          });
        }
      },
      undefined,
      'Logout',
      'Cancel',
      'warning'
    );
  };
  
  // Fetch user data including phone and bio
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.id);
          if (data) {
            setUserData({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              bio: data.bio || '',
              profileImage: data.profileImage || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [user]);  const profileOptions = [
    {
      title: 'Edit Profile',
      icon: 'person-outline' as const,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline' as const,
      onPress: () => console.log('Notification Settings'),
    },
    {
      title: 'Privacy Settings',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => console.log('Privacy Settings'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => console.log('Help & Support'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Card style={styles.profileHeader}>
        <View>
          <View style={styles.avatar}>
            {(userData.profileImage || user?.profileImage) ? (
              <Image
                source={{ 
                  uri: CloudinaryService.getOptimizedImageUrl(
                    userData.profileImage || user?.profileImage || '', 
                    160, 
                    160
                  ) 
                }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            )}
          </View>
        </View>        <Text style={styles.name}>{userData.name || user?.name || 'Student'}</Text>
        <Text style={styles.email}>{userData.email || user?.email}</Text>
        <View style={styles.roleContainer}>
          <Ionicons name="school-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.role}>Student</Text>
        </View>
        
        {/* Display phone and bio if available */}
        {userData.phone ? (
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.contactText}>{userData.phone}</Text>
          </View>
        ) : null}
        
        {userData.bio ? (
          <View style={styles.bioWrapper}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{userData.bio}</Text>
          </View>
        ) : null}
      </Card>

      {/* Profile Options */}
      <Card style={styles.optionsContainer}>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionItem,
              index !== profileOptions.length - 1 ? styles.optionItemBorder : {}
            ]}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={20} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>      {/* Logout Button */}
      <Card style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </Card>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing['4xl'],
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  role: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  optionsContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.textSecondary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    flex: 1,
  },
  logoutContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  versionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  bioWrapper: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  bioTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  bioText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});