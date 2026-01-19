import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../utils/theme';
import { Card } from '../common';
import type { Club } from '../../types/club';
import CloudinaryService from '../../services/cloudinary';

interface ClubCardProps {
  club: Club;
  onPress?: () => void;
}

export function ClubCard({ club, onPress }: ClubCardProps) {
  return (
    <Card style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        {/* Cover Image */}
        {club.coverImage && (
          <View style={styles.coverImageContainer}>
            <Image
              source={{ 
                uri: CloudinaryService.getOptimizedImageUrl(club.coverImage, 300, 150) 
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.clubInfo}>
              {/* Club Logo */}
              <View style={styles.logoContainer}>
                {club.logo ? (
                  <Image
                    source={{ 
                      uri: CloudinaryService.getOptimizedImageUrl(club.logo, 50, 50) 
                    }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="business" size={20} color={theme.colors.textSecondary} />
                  </View>
                )}
              </View>
              
              <View style={styles.clubTextInfo}>
                <Text style={styles.clubName} numberOfLines={1}>
                  {club.name}
                </Text>
                <Text style={styles.memberCount}>
                  {club.memberCount} members
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: club.isActive ? theme.colors.success : theme.colors.error }
              ]}>
                <Text style={styles.statusText}>
                  {club.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>

          {club.description && (
            <Text style={styles.description} numberOfLines={2}>
              {club.description}
            </Text>
          )}

          <View style={styles.footer}>
            {club.category && (
              <View style={styles.categoryContainer}>
                <Ionicons 
                  name="pricetag-outline" 
                  size={14} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={styles.categoryText}>
                  {club.category.charAt(0).toUpperCase() + club.category.slice(1)}
                </Text>
              </View>
            )}
            {club.contactEmail && (
              <View style={styles.contactContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={14} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={styles.contactText} numberOfLines={1}>
                  {club.contactEmail}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.chevron}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
  },
  coverImageContainer: {
    height: 120,
    backgroundColor: theme.colors.surface,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  clubInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: theme.spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clubTextInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  memberCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textInverse,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  footer: {
    gap: theme.spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  chevron: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});