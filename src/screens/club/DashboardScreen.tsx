import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { theme } from '../../utils/theme';
import { Card, StatCard, Button } from '../../components/common';
import { EventCard } from '../../components/event';
import { useAuth } from '../../hooks/useAuth';
import { useEvents } from '../../hooks/useEvents';
import { useSelector } from 'react-redux';
import { ClubService } from '../../services/club';
import { RootState } from '../../store';
import { formatNumber, getTimeBasedGreeting } from '../../utils/helpers';
// import { usePerformanceMonitor } from '../../utils/performance'; // Uncomment for performance debugging

export default function DashboardScreen() {
  // Performance monitoring (uncomment for debugging)
  // usePerformanceMonitor({ componentName: 'DashboardScreen' });
  
  const navigation = useNavigation();
  const { user } = useAuth();
  const { events, isLoading, error, fetchEvents } = useEvents();
  const currentClub = useSelector((state: RootState) => state.clubs.currentClub);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [hasNotifications, setHasNotifications] = useState(true); // Mock notification state
  const [clubStats, setClubStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalMembers: 0,
    activeRegistrations: 0,
  });

  // Animation values - use useRef to avoid re-renders
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  // Get only the 3 most recent events (memoized)
  const recentEvents = useMemo(() => events.slice(0, 3), [events]);  // Load club data with better error handling
  const loadClubData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      const clubId = user.clubId || user.id;
      
      // Load club details first (for club name) and events in parallel
      const [clubDetails] = await Promise.all([
        ClubService.getClubById(clubId),
        fetchEvents()
      ]);
      
      // Get club stats
      const stats = await ClubService.getClubStats(clubId);
      setClubStats(stats);
      
      // Animate content in after loading
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading club data:', error);
      setStatsError('Failed to load dashboard data');
    } finally {
      setIsLoadingStats(false);
    }
  }, [user?.id, fetchEvents]);

  // Load club data
  useEffect(() => {
    loadClubData();
  }, [loadClubData]);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadClubData();
    setIsRefreshing(false);
  };
    const handleEventPress = useCallback((eventId: string) => {
    (navigation as any).navigate('EventDetails', { eventId });
  }, [navigation]);const getGreeting = useCallback(() => {
    return getTimeBasedGreeting();
  }, []);

  const getWelcomeMessage = useCallback(() => {
    if (clubStats.upcomingEvents === 0) {
      return "Ready to create your next event?";
    } else if (clubStats.upcomingEvents === 1) {
      return "You have 1 upcoming event!";
    } else {
      return `You have ${clubStats.upcomingEvents} upcoming events!`;
    }
  }, [clubStats.upcomingEvents]);const quickActions = useMemo(() => [
    {
      title: 'Create Event',
      icon: 'add-circle-outline' as const,
      color: theme.colors.primary,
      onPress: () => (navigation as any).navigate('CreateEvent'),
    },
    {
      title: 'Manage Events',
      icon: 'calendar-outline' as const,
      color: theme.colors.secondary,
      onPress: () => (navigation as any).navigate('EventsManagement'),
    },
    {
      title: 'View Members',
      icon: 'people-outline' as const,
      color: theme.colors.accent,
      onPress: () => console.log('View Members'),
    },
    {
      title: 'Analytics',
      icon: 'analytics-outline' as const,
      color: theme.colors.info,
      onPress: () => console.log('Club Analytics'),
    },
    {
      title: 'Settings',
      icon: 'settings-outline' as const,
      color: theme.colors.textSecondary,
      onPress: () => console.log('Club Settings'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline' as const,
      color: theme.colors.warning,
      onPress: () => console.log('Help & Support'),
    },
  ], [navigation]);return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >{/* Header */}
      <View style={styles.header}>        <View>
          <Text style={styles.welcomeText}>{getGreeting()}</Text>
          <Text style={styles.clubName}>{currentClub?.name || 'Club Dashboard'}</Text>
          {!isLoadingStats && (
            <Text style={styles.welcomeSubtext}>{getWelcomeMessage()}</Text>
          )}
        </View><TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => {
            console.log('Notifications pressed');
            setHasNotifications(false); // Hide badge when pressed
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          {hasNotifications && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {isLoadingStats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        ) : statsError ? (
          <Card style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
              <Text style={styles.errorTitle}>Unable to load stats</Text>
              <Text style={styles.errorDescription}>{statsError}</Text>
              <Button
                title="Retry"
                onPress={loadClubData}
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            </View>
          </Card>
        ) : (          <View style={styles.statsGrid}>
            <View style={styles.statCardContainer}>
              <StatCard
                title="Total Events"
                value={formatNumber(clubStats.totalEvents)}
                icon="calendar-outline"
                color={theme.colors.primary}
                onPress={() => (navigation as any).navigate('EventsManagement')}
              />
            </View>
            <View style={styles.statCardContainer}>
              <StatCard
                title="Upcoming"
                value={formatNumber(clubStats.upcomingEvents)}
                icon="time-outline"
                color={theme.colors.secondary}
                onPress={() => (navigation as any).navigate('EventsManagement')}
              />
            </View>
            <View style={styles.statCardContainer}>
              <StatCard
                title="Members"
                value={formatNumber(clubStats.totalMembers)}
                icon="people-outline"
                color={theme.colors.accent}
                onPress={() => console.log('View Members')}
              />
            </View>
            <View style={styles.statCardContainer}>
              <StatCard
                title="Registrations"
                value={formatNumber(clubStats.activeRegistrations)}
                icon="checkmark-circle-outline"
                color={theme.colors.success}
                onPress={() => console.log('View Registrations')}
              />
            </View>
          </View>
        )}
      </View>      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.section}>        <Card style={styles.quickStatsCard}>
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{formatNumber(clubStats.upcomingEvents)}</Text>
              <Text style={styles.quickStatLabel}>Events This Week</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{formatNumber(clubStats.activeRegistrations)}</Text>
              <Text style={styles.quickStatLabel}>New Registrations</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{formatNumber(clubStats.totalMembers)}</Text>
              <Text style={styles.quickStatLabel}>Active Members</Text>
            </View>
          </View>
        </Card>
      </View>      {/* Recent Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('EventsManagement')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
          {error ? (
          <Card style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
              <Text style={styles.errorTitle}>Unable to load events</Text>
              <Text style={styles.errorDescription}>{error}</Text>
              <Button
                title="Retry"
                onPress={loadClubData}
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            </View>
          </Card>
        ) : isLoading ? (
          events.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : null
        ) : recentEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {recentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
              />
            ))}
          </View>        ) : (
          <Card style={styles.emptyState}>
            <View style={styles.emptyStateContent}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No events yet</Text>
              <Text style={styles.emptyStateDescription}>
                Create your first event to start engaging with your members
              </Text>
              <Button
                title="Create Event"
                onPress={() => (navigation as any).navigate('CreateEvent')}
                style={styles.emptyStateButton}
              />
            </View>          </Card>
        )}
      </View>
      </Animated.View>
    </ScrollView>
    
    {/* Floating Action Button */}
    <TouchableOpacity
      style={styles.fab}
      onPress={() => (navigation as any).navigate('CreateEvent')}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color={theme.colors.textInverse} />
    </TouchableOpacity>    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },  clubName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  welcomeSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  statCardContainer: {
    width: '47%',
    marginBottom: theme.spacing.md,
  },  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
  eventsContainer: {
    gap: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },  emptyStateButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  // Loading states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  // Error states
  errorCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },  retryButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  // Quick Stats Bar
  quickStatsCard: {
    padding: theme.spacing.lg,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  quickStatLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
});