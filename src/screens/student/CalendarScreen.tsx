import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../utils/theme';
import { Button } from '../../components/common';
import type { Event } from '../../types/event';
import type { StudentStackParamList } from '../../types';

type CalendarNavigationProp = StackNavigationProp<StudentStackParamList, 'Calendar'>;

interface EventsByDate {
  [date: string]: Event[];
}

interface CalendarEvent extends Event {
  timeDisplay: string;
}

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  dots?: Array<{ color: string }>;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
}

interface MarkedDates {
  [date: string]: MarkedDate;
}

export default function CalendarScreen() {
  const navigation = useNavigation<CalendarNavigationProp>();
  const { events, isLoading, fetchEvents } = useEvents();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showEventModal, setShowEventModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Group events by date
  const eventsByDate: EventsByDate = useMemo(() => {
    return events.reduce((acc, event) => {
      const eventDate = format(parseISO(event.startDate), 'yyyy-MM-dd');
      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }
      acc[eventDate].push(event);
      return acc;
    }, {} as EventsByDate);
  }, [events]);

  // Create marked dates for calendar
  const markedDates: MarkedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    // Mark dates with events
    Object.keys(eventsByDate).forEach(date => {
      const dayEvents = eventsByDate[date];
      marked[date] = {
        marked: true,
        dotColor: theme.colors.primary,
        dots: dayEvents.length > 1 ? [
          { color: theme.colors.accentLight },
          { color: theme.colors.secondary }
        ] : [{ color: theme.colors.secondary }],
      };
    });

    // Mark selected date
    if (marked[selectedDate]) {      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    }

    return marked;
  }, [eventsByDate, selectedDate]);

  // Get events for selected date with time formatting
  const selectedDateEvents: CalendarEvent[] = useMemo(() => {
    const dayEvents = eventsByDate[selectedDate] || [];
    return dayEvents.map(event => ({
      ...event,
      timeDisplay: format(parseISO(event.startDate), 'h:mm a'),
    })).sort((a, b) => 
      parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );
  }, [eventsByDate, selectedDate]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: theme.colors.info,
      social: theme.colors.success,
      sports: theme.colors.warning,
      cultural: theme.colors.secondary,
      workshop: theme.colors.primary,
      other: theme.colors.textSecondary,
    };
    return colors[category as keyof typeof colors] || theme.colors.textSecondary;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      academic: 'school-outline',
      social: 'people-outline',
      sports: 'fitness-outline',
      cultural: 'color-palette-outline',
      workshop: 'build-outline',
      other: 'ellipsis-horizontal-outline',
    };
    return icons[category as keyof typeof icons] || 'calendar-outline';
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.eventIndicator, { backgroundColor: getCategoryColor(item.category) }]} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.eventTime}>{item.timeDisplay}</Text>
        </View>
        <View style={styles.eventDetails}>          <View style={styles.eventDetailRow}>
            <Ionicons
              name={getCategoryIcon(item.category) as any}
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.eventCategory}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.eventLocation} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
        <Text style={styles.eventClub}>{item.clubName}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Event Calendar</Text>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.background,
              calendarBackground: theme.colors.background,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,              selectedDayTextColor: '#FFFFFF',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textSecondary + '50',
              dotColor: theme.colors.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            enableSwipeMonths={true}
            hideExtraDays={true}
            markingType="multi-dot"
          />
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.eventsTitle}>
              Events on {format(parseISO(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
            </Text>
            {selectedDateEvents.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowEventModal(true)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="expand-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.noEventsText}>No events scheduled</Text>
              <Text style={styles.noEventsSubtext}>
                Select another date to view events
              </Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {selectedDateEvents.slice(0, 3).map((event) => (
                <View key={event.id}>
                  {renderEventItem({ item: event })}
                </View>
              ))}
              {selectedDateEvents.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowEventModal(true)}
                >
                  <Text style={styles.showMoreText}>
                    +{selectedDateEvents.length - 3} more events
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Events on {format(parseISO(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEventModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={selectedDateEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalEventsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  todayButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  eventsSection: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  eventsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noEventsText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  noEventsSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  eventsList: {
    gap: theme.spacing.md,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  eventIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
  },
  eventContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  eventCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  eventLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  eventClub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  showMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalEventsList: {
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});