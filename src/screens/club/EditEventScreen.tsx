import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useEvents } from '../../hooks/useEvents';
import { theme } from '../../utils/theme';
import { Button, Input } from '../../components/common';
import { useCustomAlert } from '../../contexts/AlertContext';
import type { ClubStackParamList, Event } from '../../types';

type EditEventScreenRouteProp = RouteProp<ClubStackParamList, 'EditEvent'>;
type EditEventScreenNavigationProp = StackNavigationProp<ClubStackParamList, 'EditEvent'>;

interface EditEventScreenProps {
  route: EditEventScreenRouteProp;
  navigation: EditEventScreenNavigationProp;
}

export default function EditEventScreen({ route, navigation }: EditEventScreenProps) {
  const { eventId } = route.params;
  const { fetchEventById, updateEvent, isLoading } = useEvents();
  const { alert } = useCustomAlert();
  const [event, setEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);
  const loadEvent = async () => {
    const eventDetails = await fetchEventById(eventId);
    if (eventDetails) {
      setEvent(eventDetails);
    } else {
      alert({
        title: "Error",
        message: "Could not load event details. Please try again.",
        type: "error",
        buttons: [
          { text: "Go Back", onPress: () => navigation.goBack() }
        ]
      });
    }
  };

  // This is a placeholder for the actual edit form which would be similar to CreateEventScreen
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Event</Text>
      </View>

      {!event ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.noteText}>
            Edit event functionality will be implemented in the next phase.
            Currently, you can only view event details.
          </Text>
          
          <View style={styles.eventDetails}>
            <Text style={styles.detailLabel}>Event Title</Text>
            <Text style={styles.detailValue}>{event.title}</Text>
            
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{event.description}</Text>
            
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(event.startDate).toLocaleDateString()} at {
                new Date(event.startDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            </Text>
            
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
            
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{
              event.category.charAt(0).toUpperCase() + event.category.slice(1)
            }</Text>
            
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: 
                  event.status === 'published' ? theme.colors.success :
                  event.status === 'draft' ? theme.colors.warning :
                  event.status === 'cancelled' ? theme.colors.error :
                  theme.colors.textSecondary
              }
            ]}>
              <Text style={styles.statusText}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              title="Back to Management"
              onPress={() => navigation.navigate('EventsManagement')}
              variant="outline"
              style={styles.button}
            />
            <Button 
              title="View Event Details"
              onPress={() => navigation.navigate('EventDetails', { eventId })}
              style={styles.button}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  noteText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  eventDetails: {
    marginTop: theme.spacing.lg,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },  detailValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textInverse,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
