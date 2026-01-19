import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { theme } from '../../utils/theme';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { EventCard } from '../../components/event/EventCard';
import type { Event } from '../../types/event';
import type { StudentStackParamList } from '../../types';

type EventHistoryNavigationProp = StackNavigationProp<StudentStackParamList, 'EventHistory'>;

export default function EventHistoryScreen() {
  const navigation = useNavigation<EventHistoryNavigationProp>();
  const { user } = useAuth();
  const { userRegistrations, fetchEvents } = useEvents();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'attended' | 'registered'>('all');

  useEffect(() => {
    loadEventHistory();
  }, [userRegistrations]);

  const loadEventHistory = async () => {
    try {
      setLoading(true);
      // Get all events that user has registered for
      const registeredEventIds = userRegistrations.map(reg => reg.eventId);
      
      if (registeredEventIds.length === 0) {
        setEvents([]);
        return;
      }

      // Fetch events (this would need to be implemented in EventService)
      await fetchEvents();
      // For now, we'll simulate getting past events
      // In a real implementation, you'd filter by past dates and user registrations
      setEvents([]);
    } catch (error) {
      console.error('Error loading event history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEventHistory();
    setRefreshing(false);
  };

  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const getFilteredEvents = () => {
    // Filter logic would go here based on the filter state
    return events;
  };

  const renderFilterTab = (filterType: typeof filter, title: string) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        filter === filterType && styles.activeFilterTab
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterTabText,
        filter === filterType && styles.activeFilterText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => navigateToEventDetails(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading event history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          {renderFilterTab('all', 'All Events')}
          {renderFilterTab('attended', 'Attended')}
          {renderFilterTab('registered', 'Registered')}
        </View>
      </View>

      {/* Events List */}
      <FlatList
        data={getFilteredEvents()}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>No Event History</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'all' 
                ? "You haven't registered for any events yet"
                : filter === 'attended'
                ? "You haven't attended any events yet"
                : "You don't have any registered events"
              }
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  filterContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterTab: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeFilterText: {
    color: theme.colors.textInverse,
  },
  eventsList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  exploreButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
