import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useEvents } from '../../hooks/useEvents';
import { theme } from '../../utils/theme';
import { EventCard } from '../../components/event/EventCard';
import type { ClubStackParamList, Event } from '../../types';

type EventsManagementScreenNavigationProp = StackNavigationProp<ClubStackParamList, 'EventsManagement'>;

export default function EventsManagementScreen() {
  const navigation = useNavigation<EventsManagementScreenNavigationProp>();
  const { events, isLoading, error, fetchEvents } = useEvents();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Event['status'] | 'all'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleEditEvent = (eventId: string) => {
    navigation.navigate('EditEvent', { eventId });
  };

  // Filter events based on search query and status filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.eventItemContainer}>
      <EventCard 
        event={item} 
        onPress={() => navigateToEventDetails(item.id)} 
      />
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => handleEditEvent(item.id)}
      >
        <Ionicons name="pencil" size={20} color={theme.colors.primary} />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events Management</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={navigateToCreateEvent}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Search and filters */}
      <View style={styles.filterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'all' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'published' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('published')}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === 'published' && styles.activeFilterText
            ]}>
              Published
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'draft' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('draft')}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === 'draft' && styles.activeFilterText
            ]}>
              Drafts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'completed' && styles.activeFilterTab
            ]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === 'completed' && styles.activeFilterText
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
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
            <Text style={styles.emptyTitle}>
              {error ? 'Error Loading Events' : 'No Events Found'}
            </Text>
            <Text style={styles.emptyMessage}>
              {error 
                ? `${error}. Please try again.` 
                : searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first event to get started'}
            </Text>
            {!error && !searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={styles.emptyCreateButton}
                onPress={navigateToCreateEvent}
              >
                <Text style={styles.emptyCreateButtonText}>Create Event</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonText: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  filterContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  filterTab: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  activeFilterTab: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  filterTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeFilterText: {
    color: theme.colors.primary,
  },
  eventsList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  eventItemContainer: {
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  editButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },  emptyMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyCreateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },  emptyCreateButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
