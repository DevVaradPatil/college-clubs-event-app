import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventCard } from './EventCard';
import { theme } from '../../utils/theme';
import type { Event } from '../../types/event';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  onEventPress: (eventId: string) => void;
  onRetry?: () => void;
  emptyMessage?: string;
  refreshControl?: React.ReactElement;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  isLoading,
  error,
  onEventPress,
  onRetry,
  emptyMessage = 'No events found',
  refreshControl
}) => {
  if (isLoading ? events.length === 0 : false) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error ? events.length === 0 : false) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        {onRetry ? (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <EventCard 
          event={item} 
          onPress={() => onEventPress(item.id)} 
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      refreshControl={refreshControl as any}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.textInverse,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});