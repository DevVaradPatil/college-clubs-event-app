import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

import { theme } from '../../utils/theme';
import { Input, Button, Card } from '../../components/common';
import { EVENT_CATEGORIES, DATE_FORMATS } from '../../utils/constants';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { useCustomAlert } from '../../contexts/AlertContext';
import { AuthService } from '../../services/auth';
import { ClubService } from '../../services/club';
import type { Event } from '../../types/event';
import type { Club } from '../../types/club';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  category: string;
  maxParticipants: string;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationDeadline: Date | null;
  status: 'draft' | 'published';
}

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const { createEvent } = useEvents();
  const { user } = useAuth();
  const { alert } = useCustomAlert();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [clubData, setClubData] = useState<Club | null>(null);
  const [loadingClubData, setLoadingClubData] = useState(true);
    const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: null,
    endDate: null,
    category: EVENT_CATEGORIES[0].value,
    maxParticipants: '',
    isPublic: true,
    registrationRequired: false,
    registrationDeadline: null,
    status: 'draft'
  });  // Fetch club data when component mounts
  useEffect(() => {
    const fetchClubData = async () => {
      if (!user?.id) {
        setLoadingClubData(false);
        return;
      }

      try {
        // Fetch user data from Firestore to get managedClubs
        const userData = await AuthService.getUserData(user.id);
        if (userData?.managedClubs && userData.managedClubs.length > 0) {
          const clubId = userData.managedClubs[0];
          const club = await ClubService.getClubById(clubId);
          setClubData(club);
        } else {
          alert({
            title: 'Error',
            message: 'You are not currently managing any clubs. Only club leaders can create events.',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching club data:', error);
        alert({
          title: 'Error',
          message: 'Failed to load club information',
          type: 'error'
        });
      }
      setLoadingClubData(false);
    };

    fetchClubData();
  }, [user?.id, alert]);

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleDateConfirm = (field: 'startDate' | 'endDate' | 'registrationDeadline', date: Date) => {
    updateField(field, date);
    
    if (field === 'startDate') {
      setShowStartDatePicker(false);
      
      // If end date is not set or end time is before or equal to start time,
      // set end date to start date + 1 hour (same day, just later time)
      if (!formData.endDate || date.getTime() >= (formData.endDate?.getTime() || 0)) {
        const newEndDate = new Date(date);
        newEndDate.setHours(date.getHours() + 1);
        updateField('endDate', newEndDate);
      }
    } else if (field === 'endDate') {
      setShowEndDatePicker(false);
        // Additional check: If end time is somehow before start time, fix it
      if (formData.startDate && date.getTime() <= formData.startDate.getTime()) {
        alert({
          title: 'Invalid End Time',
          message: 'The end time must be after the start time. The end time has been automatically adjusted.',
          type: 'warning',
          buttons: [{ text: 'OK' }]
        });
        const fixedEndDate = new Date(formData.startDate);
        fixedEndDate.setHours(formData.startDate.getHours() + 1);
        updateField('endDate', fixedEndDate);
      }
    } else if (field === 'registrationDeadline') {
      setShowDeadlinePicker(false);
    }
  };

  const validateForm = (): boolean => {    if (!formData.title.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter an event title',
        type: 'error'
      });
      return false;
    }    if (!formData.description.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter an event description',
        type: 'error'
      });
      return false;
    }
    if (!formData.location.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter an event location',
        type: 'error'
      });
      return false;
    }
    if (!formData.startDate) {
      alert({
        title: 'Error',
        message: 'Please select a start date and time',
        type: 'error'
      });
      return false;
    }
    if (!formData.endDate) {
      alert({
        title: 'Error',
        message: 'Please select an end date and time',
        type: 'error'
      });
      return false;
    }
    if (formData.startDate && formData.endDate && formData.startDate.getTime() > formData.endDate.getTime()) {
      alert({
        title: 'Error',
        message: 'End time must be after start time',
        type: 'error'
      });
      return false;
    }
    if (formData.registrationRequired && !formData.registrationDeadline) {
      alert({
        title: 'Error',
        message: 'Please select a registration deadline',
        type: 'error'
      });
      return false;
    }
    return true;
  };
  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    if (!clubData) {
      alert({
        title: 'Error',
        message: 'Club information not available. Please try again.',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {      // Convert form data to event data structure using club information
      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        clubId: clubData.id,
        clubName: clubData.name,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        location: formData.location.trim(),
        category: formData.category as any,
        isPublic: formData.isPublic,
        registrationRequired: formData.registrationRequired,
        status: formData.status,
        createdBy: user?.id || '',
      };
      
      // Add optional fields only if they have values
      if (formData.maxParticipants && parseInt(formData.maxParticipants) > 0) {
        eventData.maxParticipants = parseInt(formData.maxParticipants);
      }
      
      if (formData.registrationRequired && formData.registrationDeadline) {
        eventData.registrationDeadline = formData.registrationDeadline.toISOString();
      }
        const result = await createEvent(eventData);
        if (result) {
        // Reset form fields after successful creation
        setFormData({
          title: '',
          description: '',
          location: '',
          startDate: null,
          endDate: null,
          category: EVENT_CATEGORIES[0].value,
          maxParticipants: '',
          isPublic: true,
          registrationRequired: false,
          registrationDeadline: null,
          status: 'draft'
        });

        alert({
          title: 'Success',
          message: `Event "${formData.title}" has been ${formData.status === 'published' ? 'published' : 'saved as draft'}!`,
          type: 'success',
          buttons: [
            { text: 'Create Another', onPress: () => {} },
            { text: 'Go Back', onPress: () => navigation.goBack() }
          ]
        });
      } else {
        alert({
          title: 'Error',
          message: 'Failed to create event. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert({
        title: 'Error',
        message: 'Failed to create event. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryButtons}>
          {EVENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryButton,
                formData.category === category.value ? styles.categoryButtonActive : {}
              ]}
              onPress={() => updateField('category', category.value)}
            >
              <Text style={[
                styles.categoryButtonText,
                formData.category === category.value ? styles.categoryButtonTextActive : {}
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  const DateTimePicker = ({ 
    field, 
    label, 
    placeholder, 
    value, 
    onPress,
    icon = 'calendar-outline' as const
  }: { 
    field: 'startDate' | 'endDate' | 'registrationDeadline', 
    label: string,
    placeholder: string,
    value: Date | null,
    onPress: () => void,
    icon?: any
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.dateTimePickerButton}
    >
      <View style={styles.dateTimeInput}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} style={styles.inputIcon} />
        <View>
          <Text style={styles.dateTimeLabel}>{label}</Text>
          <Text style={styles.dateTimeValue}>
            {value ? format(value, 'MMM d, yyyy h:mm a') : placeholder}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  // Show loading indicator while fetching club data
  if (loadingClubData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading club information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Event</Text>
            <Text style={styles.subtitle}>Fill in the details to create your event</Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Event Title"
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(text: string) => updateField('title', text)}
              leftIcon="bookmark-outline"
            />

            <Input
              label="Description"
              placeholder="Describe your event"
              value={formData.description}
              onChangeText={(text: string) => updateField('description', text)}
              leftIcon="document-text-outline"
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <Input
              label="Location"
              placeholder="Where will it be held?"
              value={formData.location}
              onChangeText={(text: string) => updateField('location', text)}
              leftIcon="location-outline"
            />

            <CategorySelector />
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            
            <DateTimePicker 
              field="startDate"
              label="Start Date & Time"
              placeholder="Select start date and time"
              value={formData.startDate}
              onPress={() => setShowStartDatePicker(true)}
            />
            
            <DateTimePicker 
              field="endDate"
              label="End Date & Time"
              placeholder="Select end date and time"
              value={formData.endDate}
              onPress={() => setShowEndDatePicker(true)}
            />

            <DateTimePickerModal
              isVisible={showStartDatePicker}
              mode="datetime"
              onConfirm={(date) => handleDateConfirm('startDate', date)}
              onCancel={() => setShowStartDatePicker(false)}
              minimumDate={new Date()}
            />
            
            <DateTimePickerModal
              isVisible={showEndDatePicker}
              mode="datetime"
              onConfirm={(date) => handleDateConfirm('endDate', date)}
              onCancel={() => setShowEndDatePicker(false)}
              minimumDate={formData.startDate || new Date()}
            />
          </View>

          {/* Registration Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registration Settings</Text>
            
            <Input
              label="Maximum Participants (Optional)"
              placeholder="Leave empty for unlimited"
              value={formData.maxParticipants}
              onChangeText={(text: string) => updateField('maxParticipants', text)}
              leftIcon="people-outline"
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Public Event</Text>
                  <Text style={styles.switchDescription}>
                    Anyone can see this event
                  </Text>
                </View>
                <Switch
                  value={formData.isPublic}
                  onValueChange={(value) => updateField('isPublic', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
              
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Require Registration</Text>
                  <Text style={styles.switchDescription}>
                    Attendees must register to participate
                  </Text>
                </View>
                <Switch
                  value={formData.registrationRequired}
                  onValueChange={(value) => updateField('registrationRequired', value)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
              
              {formData.registrationRequired && (
                <>
                  <DateTimePicker 
                    field="registrationDeadline"
                    label="Registration Deadline"
                    placeholder="Select deadline"
                    value={formData.registrationDeadline}
                    onPress={() => setShowDeadlinePicker(true)}
                    icon="time-outline"
                  />
                  
                  <DateTimePickerModal
                    isVisible={showDeadlinePicker}
                    mode="datetime"
                    onConfirm={(date) => handleDateConfirm('registrationDeadline', date)}
                    onCancel={() => setShowDeadlinePicker(false)}
                    maximumDate={formData.startDate || undefined}
                  />
                </>
              )}
            </View>
          </View>

          {/* Publication Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Publication</Text>
            
            <View style={styles.publicationOptions}>
              <TouchableOpacity
                style={[
                  styles.publicationOption,
                  formData.status === 'draft' && styles.publicationOptionSelected
                ]}
                onPress={() => updateField('status', 'draft')}
              >
                <Ionicons
                  name="save-outline"
                  size={24}
                  color={formData.status === 'draft' ? theme.colors.primary : theme.colors.text}
                />
                <Text style={[
                  styles.publicationOptionText,
                  formData.status === 'draft' && styles.publicationOptionTextSelected
                ]}>
                  Save as Draft
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.publicationOption,
                  formData.status === 'published' && styles.publicationOptionSelected
                ]}
                onPress={() => updateField('status', 'published')}
              >
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color={formData.status === 'published' ? theme.colors.primary : theme.colors.text}
                />
                <Text style={[
                  styles.publicationOptionText,
                  formData.status === 'published' && styles.publicationOptionTextSelected
                ]}>
                  Publish Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>          <Button
            title={formData.status === 'published' ? 'Publish Event' : 'Save Draft'}
            onPress={handleCreateEvent}
            loading={isLoading}
            style={styles.createButton}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  formCard: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButtons: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  switchContainer: {
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  switchDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  createButton: {
    marginTop: 16,
  },
  dateTimePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateTimeInput: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dateTimeValue: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 2,
  },
  publicationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  publicationOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  publicationOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  publicationOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  publicationOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});