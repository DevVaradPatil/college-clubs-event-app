import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';

import { theme } from '../../utils/theme';
import { Button, Card } from '../../components/common';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { useCustomAlert } from '../../contexts/AlertContext';
import type { Event } from '../../types/event';

interface EventDetailsScreenProps {
  route: {
    params: {
      eventId: string;
    };
  };
}

export default function EventDetailsScreen({ route }: EventDetailsScreenProps) {
  const { eventId } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  const { fetchEventById, registerForEvent, cancelRegistration, isRegistered } = useEvents();
  const { alert, confirm } = useCustomAlert();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userHasRegistered, setUserHasRegistered] = useState(false);
  
  const isClubAdmin = user?.role === 'club';
  const isEventAdmin = user?.id === event?.createdBy || user?.clubId === event?.clubId;
  
  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        const eventData = await fetchEventById(eventId);
        setEvent(eventData);
        if (eventData && user) {
          setUserHasRegistered(isRegistered(eventId));
        }
      } catch (error) {
        console.error('Error loading event details:', error);
        alert({
          title: 'Error',
          message: 'Failed to load event details',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadEventDetails();
  }, [eventId, fetchEventById]);
  
  const handleRegister = async () => {
    if (!user) {
      alert({
        title: 'Sign In Required',
        message: 'Please sign in to register for events',
        type: 'warning'
      });
      return;
    }
    
    setRegistering(true);
    try {
      const result = await registerForEvent(eventId);
      if (result) {
        setUserHasRegistered(true);
        alert({
          title: 'Success',
          message: 'You have successfully registered for this event!',
          type: 'success'
        });
      } else {
        alert({
          title: 'Error',
          message: 'Failed to register for event. Please try again.',
          type: 'error'
        });
      }
    } catch (error: any) {
      alert({
        title: 'Error',
        message: error.message || 'Failed to register for event',
        type: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };
  
  const handleCancelRegistration = async () => {
    confirm(
      'Cancel Registration',
      'Are you sure you want to cancel your registration?',
      async () => {
        setRegistering(true);
        try {
          const result = await cancelRegistration(eventId);
          if (result) {
            setUserHasRegistered(false);
            alert({
              title: 'Success',
              message: 'Your registration has been cancelled',
              type: 'success'
            });
          } else {
            alert({
              title: 'Error',
              message: 'Failed to cancel registration. Please try again.',
              type: 'error'
            });
          }
        } catch (error: any) {
          alert({
            title: 'Error',
            message: error.message || 'Failed to cancel registration',
            type: 'error'
          });
        } finally {
          setRegistering(false);
        }
      },
      undefined,
      'Cancel Registration',
      'Keep Registration',
      'error'
    );
  };
  
  const handleEditEvent = () => {
    // TODO: Implement edit event navigation
    alert({
      title: 'Coming Soon',
      message: 'Event editing will be available soon!',
      type: 'default'
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Event Not Found</Text>
        <Text style={styles.errorMessage}>The event you're looking for could not be found or has been removed.</Text>
        <Button 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        />
      </View>
    );
  }
  
  const eventDate = parseISO(event.startDate);
  const eventEndDate = parseISO(event.endDate);
  const isUpcoming = new Date() < eventDate;
    return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Event Header */}
      <View style={styles.header}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name={getCategoryIcon(event.category)} size={64} color={theme.colors.primary} />
          </View>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.category}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.clubName}>By {event.clubName}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Text style={styles.statusText}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Event Details */}
      <Card style={styles.detailsCard}>
        <View style={styles.detailsSection}>          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailText}>
                {format(eventDate, 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text style={styles.detailText}>
                {`${format(eventDate, 'h:mm a')} - ${format(eventEndDate, 'h:mm a')}`}
              </Text>
            </View>
          </View>
            <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          </View>
          
          {event.registrationRequired && (
            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Registration</Text>
                <Text style={styles.detailText}>
                  {event.maxParticipants ? 
                    `${event.currentParticipants} / ${event.maxParticipants} registered` : 
                    `${event.currentParticipants} registered`}
                </Text>
                {event.registrationDeadline && (
                  <Text style={styles.detailSubtext}>
                    Registration closes on {format(parseISO(event.registrationDeadline), 'MMM d, h:mm a')}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </Card>
      
      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isEventAdmin ? (
          <Button
            title="Edit Event"
            onPress={handleEditEvent}
            style={styles.editButton}
          />
        ) : isUpcoming && event.registrationRequired ? (
          userHasRegistered ? (
            <Button
              title="Cancel Registration"
              onPress={handleCancelRegistration}
              loading={registering}
              variant="outline"
              style={styles.cancelButton}
            />
          ) : (
            <Button
              title="Register Now"
              onPress={handleRegister}
              loading={registering}
              disabled={!!event.maxParticipants && event.currentParticipants >= event.maxParticipants}
              style={styles.registerButton}
            />
          )
        ) : null}
      </View>
    </ScrollView>
  );
}

// Helper functions
function getCategoryIcon(category: string): any {
  const icons: {[key: string]: any} = {
    academic: 'book-outline',
    social: 'people-outline',
    sports: 'basketball-outline',
    cultural: 'color-palette-outline',
    workshop: 'construct-outline',
    other: 'ellipsis-horizontal-outline'
  };
  
  return icons[category] || icons.other;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return theme.colors.warning;
    case 'published':
      return theme.colors.success;
    case 'cancelled':
      return theme.colors.error;
    case 'completed':
      return theme.colors.textSecondary;
    default:
      return theme.colors.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
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
  backButton: {
    minWidth: 120,
  },  header: {
    backgroundColor: theme.colors.background,
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: 240,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    padding: 20,
    paddingBottom: 24,
  },
  category: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 34,
  },
  clubName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.success,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },  detailItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    lineHeight: 22,
  },
  detailSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  descriptionSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.text,
  },
  actionContainer: {
    padding: 20,
    marginBottom: 32,
  },  registerButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  editButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
});