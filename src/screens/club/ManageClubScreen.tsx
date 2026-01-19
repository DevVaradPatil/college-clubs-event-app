import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../hooks/useAuth';
import { Input, Button, ImageUpload } from '../../components/common';
import { theme } from '../../utils/theme';
import { AuthService } from '../../services/auth';
import { ClubService } from '../../services/club';
import { CloudinaryService } from '../../services/cloudinary';
import { useCustomAlert } from '../../contexts/AlertContext';
import type { ClubStackParamList, Club, ClubMember } from '../../types';

type ManageClubNavigationProp = StackNavigationProp<ClubStackParamList, 'ManageClub'>;

interface ClubFormData {
  name: string;
  description: string;
  category: string;
  contactEmail: string;
  website: string;
  instagram: string;
  twitter: string;
  facebook: string;
}

const CLUB_CATEGORIES = [
  'Technology',
  'Sports',
  'Arts & Culture',
  'Academic',
  'Community Service',
  'Business',
  'Health & Wellness',
  'Other',
];

const { width: screenWidth } = Dimensions.get('window');

export default function ManageClubScreen() {
  const navigation = useNavigation<ManageClubNavigationProp>();
  const { currentUser } = useAuth();
  const { alert, confirm } = useCustomAlert();
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [clubData, setClubData] = useState<ClubFormData>({
    name: '',
    description: '',
    category: '',
    contactEmail: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
  });
  // Image states
  const [clubLogo, setClubLogo] = useState<string>('');
  const [clubCoverImage, setClubCoverImage] = useState<string>('');
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadClubData();
    loadClubMembers();
  }, []);  const loadClubData = async () => {
    try {
      if (!currentUser?.uid) return;
      
      // Fetch user data from Firestore to get managedClubs
      const userData = await AuthService.getUserData(currentUser.uid);
      if (!userData) {
        alert({
          title: 'Error',
          message: 'Failed to load user data. Please try again.',
          type: 'error'
        });
        return;
      }
      
      // Check if user has any managed clubs
      if (!userData.managedClubs || userData.managedClubs.length === 0) {
        alert({
          title: 'Error',
          message: 'You are not currently managing any clubs.',
          type: 'error'
        });
        return;
      }
      
      const clubId = userData.managedClubs[0]; // Use the first managed club
      const clubDetails = await ClubService.getClubById(clubId);
      
      if (clubDetails) {
        setClubData({
          name: clubDetails.name || '',
          description: clubDetails.description || '',
          category: clubDetails.category || '',
          contactEmail: clubDetails.contactEmail || '',
          website: clubDetails.website || '',
          instagram: clubDetails.socialLinks?.instagram || '',
          twitter: clubDetails.socialLinks?.twitter || '',
          facebook: clubDetails.socialLinks?.facebook || '',
        });
        // Set image URLs
        setClubLogo(clubDetails.logo || '');
        setClubCoverImage(clubDetails.coverImage || '');
      }
    } catch (error) {
      console.error('Error loading club data:', error);
      alert({
        title: 'Error',
        message: 'Failed to load club data. Please try again.',
        type: 'error'
      });
    }
  };  const loadClubMembers = async () => {
    try {
      if (!currentUser?.uid) return;
      
      // Fetch user data from Firestore to get managedClubs
      const userData = await AuthService.getUserData(currentUser.uid);
      if (!userData?.managedClubs || userData.managedClubs.length === 0) {
        return;
      }
      
      const clubId = userData.managedClubs[0];
      const clubMembers = await ClubService.getClubMembers(clubId);
      
      if (clubMembers.length > 0) {
        setMembers(clubMembers);
      } else {
        // If no members found, initialize with at least the president (current user)
        setMembers([
          {
            id: `${clubId}_${currentUser.uid}`,
            userId: currentUser.uid,
            clubId: clubId,
            name: currentUser.displayName || 'Club President',
            email: currentUser.email || '',
            role: 'president' as const,
            joinedAt: new Date().toISOString(),
            status: 'active' as const,
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading club members:', error);
    }
  };

  const updateField = (field: keyof ClubFormData, value: string) => {
    setClubData(prev => ({ ...prev, [field]: value }));
  };  const handleSaveClubDetails = async () => {
    if (!clubData.name.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter club name',
        type: 'error'
      });
      return;
    }
    
    if (!currentUser?.uid) {
      alert({
        title: 'Error',
        message: 'Authentication error. Please try logging in again.',
        type: 'error'
      });
      return;
    }    setIsLoading(true);
    try {
      // Fetch user data from Firestore to get managedClubs
      const userData = await AuthService.getUserData(currentUser.uid);
      if (!userData?.managedClubs || userData.managedClubs.length === 0) {
        alert({
          title: 'Error',
          message: 'You are not currently managing any clubs.',
          type: 'error'
        });
        return;
      }
      
      const clubId = userData.managedClubs[0]; // Use the first managed club
      
      // Prepare social links object only if we have values
      const socialLinksData: Record<string, string> = {};
      if (clubData.instagram && clubData.instagram.trim()) {
        socialLinksData.instagram = clubData.instagram.trim();
      }
      if (clubData.twitter && clubData.twitter.trim()) {
        socialLinksData.twitter = clubData.twitter.trim();
      }
      if (clubData.facebook && clubData.facebook.trim()) {
        socialLinksData.facebook = clubData.facebook.trim();
      }
      
      // Prepare club data for update - only include fields with actual values
      const updatedClubData: Record<string, any> = {
        name: clubData.name.trim(),
      };
      
      if (clubData.description && clubData.description.trim()) {
        updatedClubData.description = clubData.description.trim();
      }
      
      if (clubData.category && clubData.category.trim()) {
        updatedClubData.category = clubData.category.trim();
      }
      
      if (clubData.contactEmail && clubData.contactEmail.trim()) {
        updatedClubData.contactEmail = clubData.contactEmail.trim();
      }
      
      if (clubData.website && clubData.website.trim()) {
        updatedClubData.website = clubData.website.trim();
      }
      
      // Only add socialLinks if we have at least one social link
      if (Object.keys(socialLinksData).length > 0) {
        updatedClubData.socialLinks = socialLinksData;
      }

      // Add images if they exist
      if (clubLogo && clubLogo.trim()) {
        updatedClubData.logo = clubLogo.trim();
      }
      
      if (clubCoverImage && clubCoverImage.trim()) {
        updatedClubData.coverImage = clubCoverImage.trim();
      }
      
      await ClubService.updateClubDetails(clubId, updatedClubData);
      alert({
        title: 'Success',
        message: 'Club details updated successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Club update error:', error);
      alert({
        title: 'Error',
        message: error.message || 'Failed to update club details.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };  const handleChangeMemberRole = (memberId: string, newRole: 'member' | 'moderator' | 'officer') => {
    confirm(
      'Change Role',
      `Are you sure you want to change this member's role to ${newRole}?`,
      () => {
        // TODO: Update member role in Firestore
        setMembers(prev => prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        ));
      },
      undefined,
      'Confirm',
      'Cancel',
      'warning'
    );
  };
  const handleRemoveMember = (memberId: string, memberName: string) => {
    confirm(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the club?`,
      () => {
        // TODO: Remove member from Firestore
        setMembers(prev => prev.filter(member => member.id !== memberId));
      },
      undefined,
      'Remove',
      'Cancel',
      'error'
    );
  };

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive ? styles.tabButtonActive : {}]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive ? styles.tabButtonTextActive : {}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const MemberItem = ({ member }: { member: ClubMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
          <View style={styles.memberMeta}>
            <View style={[styles.roleTag, { backgroundColor: getRoleColor(member.role) }]}>
              <Text style={styles.roleText}>{member.role}</Text>
            </View>
            <Text style={styles.joinDate}>Joined {new Date(member.joinedAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>      {member.role !== 'president' ? (
        <View style={styles.memberActions}><TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Show role change options - using multiple confirms for different roles
              confirm(
                'Change Role',
                'Select new role for this member:',
                () => handleChangeMemberRole(member.id, 'member'),
                () => {
                  confirm(
                    'Change Role',
                    'Set as Moderator?',
                    () => handleChangeMemberRole(member.id, 'moderator'),
                    undefined,
                    'Set Moderator',
                    'Cancel',
                    'warning'
                  );
                },
                'Set Member',
                'More Options',
                'warning'
              );
            }}
          >
            <Ionicons name="settings-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveMember(member.id, member.name)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'president': return theme.colors.error + '20';
      case 'vice-president': return theme.colors.warning + '20'; 
      case 'secretary': return theme.colors.success + '20';
      case 'treasurer': return theme.colors.info + '20';
      case 'officer': return theme.colors.warning + '20';
      case 'moderator': return theme.colors.primary + '20';
      default: return theme.colors.surface;
    }
  };

  const renderClubDetails = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Club Images Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Club Images</Text>
        
        {/* Cover Image Upload */}
        <View style={styles.imageUploadSection}>
          <Text style={styles.imageLabel}>Cover Image</Text>
          <View style={styles.coverImageContainer}>
            <ImageBackground
              source={{
                uri: clubCoverImage 
                  ? clubCoverImage
                  : "https://via.placeholder.com/800x200/E5E7EB/6B7280?text=Club+Cover"
              }}
              style={styles.coverImagePreview}
              imageStyle={styles.coverImageStyle}
            >
              <TouchableOpacity 
                style={styles.imageUploadOverlay}
                onPress={async () => {
                  try {
                    const imageUri = await CloudinaryService.pickImageFromGallery([16, 9]);
                    if (imageUri) {
                      setIsLoading(true);
                      const result = await CloudinaryService.uploadImage(imageUri, 'club_covers');
                      setClubCoverImage(result.secure_url);
                    }
                  } catch (error) {
                    console.error('Cover image upload error:', error);
                    alert({
                      title: 'Error',
                      message: 'Failed to upload cover image. Please try again.',
                      type: 'error'
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <View style={styles.imageUploadButton}>
                  <Ionicons name="camera" size={24} color={theme.colors.textInverse} />
                  <Text style={styles.imageUploadText}>
                    {clubCoverImage ? 'Change Cover' : 'Add Cover'}
                  </Text>
                </View>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>

        {/* Logo Upload */}
        <View style={styles.imageUploadSection}>
          <Text style={styles.imageLabel}>Club Logo</Text>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: clubLogo 
                  ? CloudinaryService.getOptimizedImageUrl(clubLogo, 120, 120)
                  : "https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Logo"
              }}
              style={styles.logoPreview}
            />
            <TouchableOpacity 
              style={styles.logoUploadButton}
              onPress={async () => {
                try {
                  const imageUri = await CloudinaryService.pickImageFromGallery([1, 1]);
                  if (imageUri) {
                    setIsLoading(true);
                    const result = await CloudinaryService.uploadImage(imageUri, 'club_logos');
                    setClubLogo(result.secure_url);
                  }
                } catch (error) {
                  console.error('Logo upload error:', error);
                  alert({
                    title: 'Error',
                    message: 'Failed to upload logo. Please try again.',
                    type: 'error'
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Ionicons name="camera" size={16} color={theme.colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Input
          label="Club Name"
          placeholder="Enter club name"
          value={clubData.name}
          onChangeText={(text) => updateField('name', text)}
          leftIcon="business-outline"
        />

        <Input
          label="Description"
          placeholder="Describe your club"
          value={clubData.description}
          onChangeText={(text) => updateField('description', text)}
          leftIcon="document-text-outline"
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <View style={styles.categorySelectorContent}>
            <Ionicons name="grid-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.categorySelectorText}>
              {clubData.category || 'Select Category'}
            </Text>
          </View>
          <Ionicons 
            name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>

        {showCategoryPicker ? (
          <View style={styles.categoryPicker}>
            {CLUB_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryOption}
                onPress={() => {
                  updateField('category', category);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.categoryOptionText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Input
          label="Contact Email"
          placeholder="club@example.com"
          value={clubData.contactEmail}
          onChangeText={(text) => updateField('contactEmail', text)}
          leftIcon="mail-outline"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Presence</Text>
        
        <Input
          label="Website"
          placeholder="https://yourclub.com"
          value={clubData.website}
          onChangeText={(text) => updateField('website', text)}
          leftIcon="globe-outline"
          keyboardType="url"
        />

        <Input
          label="Instagram"
          placeholder="@yourclub"
          value={clubData.instagram}
          onChangeText={(text) => updateField('instagram', text)}
          leftIcon="logo-instagram"
        />

        <Input
          label="Twitter"
          placeholder="@yourclub"
          value={clubData.twitter}
          onChangeText={(text) => updateField('twitter', text)}
          leftIcon="logo-twitter"
        />

        <Input
          label="Facebook"
          placeholder="yourclub"
          value={clubData.facebook}
          onChangeText={(text) => updateField('facebook', text)}
          leftIcon="logo-facebook"
        />
      </View>

      <Button
        title="Save Club Details"
        onPress={handleSaveClubDetails}
        loading={isLoading}
        style={styles.saveButton}
      />
    </ScrollView>
  );

  const renderMembers = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>Club Members ({members.length})</Text>
        <TouchableOpacity style={styles.addMemberButton}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
          <Text style={styles.addMemberText}>Add Member</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.membersList}>
        {members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Manage Club</Text>
        <Text style={styles.subtitle}>Update your club information and manage members</Text>
      </View>

      <View style={styles.tabContainer}>
        <TabButton
          title="Club Details"
          isActive={activeTab === 'details'}
          onPress={() => setActiveTab('details')}
        />
        <TabButton
          title="Members"
          isActive={activeTab === 'members'}
          onPress={() => setActiveTab('members')}
        />
      </View>

      <View style={styles.content}>
        {activeTab === 'details' ? renderClubDetails() : renderMembers()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.textInverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  categorySelectorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  categoryPicker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryOptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  membersTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  addMemberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  membersList: {
    gap: theme.spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  memberAvatarText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textInverse,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  memberEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  roleTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  joinDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  memberActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Image upload styles
  imageUploadSection: {
    marginBottom: theme.spacing.lg,
  },
  imageLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageStyle: {
    borderRadius: theme.borderRadius.lg,
  },
  imageUploadOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageUploadButton: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  imageUploadText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  logoUploadButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});
