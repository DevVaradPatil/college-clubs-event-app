import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { theme } from '../../utils/theme';
import { useClubs } from '../../hooks/useClubs';
import { Card, Button } from '../../components/common';
import { useCustomAlert } from '../../contexts/AlertContext';
import type { Club } from '../../types/club';
import type { StudentStackParamList } from '../../types';

type ClubDetailsRouteProp = RouteProp<StudentStackParamList, 'ClubDetails'>;
type ClubDetailsNavigationProp = StackNavigationProp<StudentStackParamList, 'ClubDetails'>;

export default function ClubDetailsScreen() {
  const navigation = useNavigation<ClubDetailsNavigationProp>();
  const route = useRoute<ClubDetailsRouteProp>();
  const { clubId } = route.params;
  const { fetchClubById } = useClubs();
  const { alert } = useCustomAlert();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubDetails();
  }, [clubId]);

  const loadClubDetails = async () => {
    try {
      setLoading(true);
      const clubData = await fetchClubById(clubId);
      setClub(clubData);
    } catch (error) {
      console.error('Error loading club details:', error);
      alert({
        title: 'Error',
        message: 'Failed to load club details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert({
          title: 'Error',
          message: 'Cannot open this link',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error opening link:', error);
      alert({
        title: 'Error',
        message: 'Failed to open link',
        type: 'error'
      });
    }
  };

  const handleJoinClub = () => {
    alert({
      title: 'Join Club',
      message: 'Club membership feature coming soon!',
      type: 'default'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading club details...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Club Not Found</Text>
        <Text style={styles.errorMessage}>
          The club you're looking for could not be found.
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      {club.coverImage && (
        <Image source={{ uri: club.coverImage }} style={styles.coverImage} />
      )}

      {/* Club Header */}
      <View style={styles.header}>
        <View style={styles.clubInfo}>
          {club.logo && (
            <Image source={{ uri: club.logo }} style={styles.clubLogo} />
          )}
          <View style={styles.clubDetails}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubCategory}>{club.category}</Text>
            <View style={styles.memberCount}>
              <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.memberCountText}>
                {club.memberCount} member{club.memberCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Join Club"
          onPress={handleJoinClub}
          style={styles.joinButton}
        />
      </View>

      {/* Description */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {club.description || 'No description available.'}
        </Text>
      </Card>

      {/* Contact Information */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {club.contactEmail && (
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.contactEmail}</Text>
          </View>
        )}

        {club.contactPhone && (
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.contactPhone}</Text>
          </View>
        )}

        {club.location && (
          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <Text style={styles.contactText}>{club.location}</Text>
          </View>
        )}

        {club.website && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleSocialLink(club.website!)}
          >
            <Ionicons name="globe" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, styles.linkText]}>
              {club.website}
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Social Links */}
      {club.socialLinks && Object.keys(club.socialLinks).length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialLinksContainer}>
            {club.socialLinks.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(club.socialLinks!.instagram!)}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                <Text style={styles.socialButtonText}>Instagram</Text>
              </TouchableOpacity>
            )}

            {club.socialLinks.twitter && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(club.socialLinks!.twitter!)}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                <Text style={styles.socialButtonText}>Twitter</Text>
              </TouchableOpacity>
            )}

            {club.socialLinks.facebook && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(club.socialLinks!.facebook!)}
              >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            )}

            {club.socialLinks.linkedin && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(club.socialLinks!.linkedin!)}
              >
                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                <Text style={styles.socialButtonText}>LinkedIn</Text>
              </TouchableOpacity>
            )}

            {club.socialLinks.discord && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLink(club.socialLinks!.discord!)}
              >
                <Ionicons name="logo-discord" size={24} color="#7289DA" />
                <Text style={styles.socialButtonText}>Discord</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* Meeting Schedule */}
      {club.meetingSchedule && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Schedule</Text>
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingText}>
              {club.meetingSchedule.frequency} on {club.meetingSchedule.day}s
            </Text>
            <Text style={styles.meetingText}>
              Time: {club.meetingSchedule.time}
            </Text>
            <Text style={styles.meetingText}>
              Location: {club.meetingSchedule.location}
            </Text>
          </View>
        </Card>
      )}

      {/* Club Stats */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Club Information</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Founded</Text>
            <Text style={styles.statValue}>
              {new Date(club.foundedDate).getFullYear()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[
              styles.statValue,
              { color: club.isActive ? theme.colors.success : theme.colors.error }
            ]}>
              {club.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>
              {club.isPublic ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.border,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  clubCategory: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  memberCountText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  joinButton: {
    alignSelf: 'flex-start',
  },
  section: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  contactText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    flex: 1,
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  socialButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  meetingInfo: {
    gap: theme.spacing.sm,
  },
  meetingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
});
