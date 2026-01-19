import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { theme } from "../../utils/theme";
import { useEvents } from "../../hooks/useEvents";
import { EVENT_CATEGORIES } from "../../utils/constants";
import { EventCard } from "../../components/event/EventCard";
import type { Event } from "../../types/event";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { events, isLoading, error, fetchEvents } = useEvents();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const navigateToEventDetails = (eventId: string) => {
    // @ts-ignore
    navigation.navigate("EventDetails", { eventId });
  };

  const filteredEvents = activeCategory
    ? events.filter((event) => event.category === activeCategory)
    : events;

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          activeCategory === null && styles.activeCategoryButton,
        ]}
        onPress={() => setActiveCategory(null)}
      >
        <Text
          style={[
            styles.categoryText,
            activeCategory === null && styles.activeCategoryText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {EVENT_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            activeCategory === category.value && styles.activeCategoryButton,
          ]}
          onPress={() => setActiveCategory(category.value)}
        >
          <Text
            style={[
              styles.categoryText,
              activeCategory === category.value && styles.activeCategoryText,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      {/* Header with Action Buttons */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Discover Events</Text>
            <Text style={styles.subtitle}>
              Find and join club events on campus
            </Text>
          </View>          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // @ts-ignore
                navigation.navigate("EventHistory");
              }}
            >
              <Ionicons name="time" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderCategoryFilter()}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No Events Found</Text>
          <Text style={styles.emptyMessage}>
            {activeCategory
              ? `There are no ${
                  EVENT_CATEGORIES.find((c) => c.value === activeCategory)
                    ?.label
                } events at the moment.`
              : "There are no upcoming events at the moment."}
          </Text>
          {activeCategory && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setActiveCategory(null)}
            >
              <Text style={styles.resetButtonText}>Show All Events</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigateToEventDetails(item.id)}
            />
          )}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },  header: {
    backgroundColor: theme.colors.surface,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },  categoryFilter: {
    marginBottom: 8,
    marginTop: 4,
    maxHeight: 40,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignItems: "center",
    minHeight: 40,
  },  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: "500",
    fontSize: 13,
  },
  activeCategoryText: {
    color: theme.colors.textInverse,
  },
  eventsList: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
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
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  resetButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
