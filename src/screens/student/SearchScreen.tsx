import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import { StackNavigationProp } from "@react-navigation/stack";

import { theme } from "../../utils/theme";
import { useEvents } from "../../hooks/useEvents";
import { useClubs } from "../../hooks/useClubs";
import { EventCard } from "../../components/event/EventCard";
import { ClubCard } from "../../components/club/ClubCard";
import { EVENT_CATEGORIES } from "../../utils/constants";
import type { Event } from "../../types/event";
import type { Club } from "../../types/club";
import type { StudentStackParamList } from "../../types";

type SearchNavigationProp = StackNavigationProp<
  StudentStackParamList,
  "Search"
>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchNavigationProp>();
  const { events, isLoading: eventsLoading, fetchEvents } = useEvents();
  const { clubs, isLoading: clubsLoading, fetchClubs } = useClubs();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"events" | "clubs">("events");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const isLoading = eventsLoading || clubsLoading;

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.clubName.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Only show published events
    filtered = filtered.filter((event) => event.status === "published");

    return filtered;
  }, [events, searchQuery, selectedCategory]);

  const filteredClubs = useMemo(() => {
    let filtered = clubs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          (club.description &&
            club.description.toLowerCase().includes(query)) ||
          (club.category && club.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [clubs, searchQuery]);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchEvents(), fetchClubs()]);
    } finally {
      setRefreshing(false);
    }
  };
  const navigateToEventDetails = (eventId: string) => {
    navigation.navigate("EventDetails", { eventId });
  };

  const navigateToClubDetails = (clubId: string) => {
    navigation.navigate("ClubDetails", { clubId });
  };

  const renderTabButton = (
    tab: "events" | "clubs",
    title: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard event={item} onPress={() => navigateToEventDetails(item.id)} />
  );
  const renderClubItem = ({ item }: { item: Club }) => (
    <ClubCard club={item} onPress={() => navigateToClubDetails(item.id)} />
  );

  const renderEmptyState = () => {
    const isSearching = searchQuery.trim().length > 0;
    const itemType = activeTab === "events" ? "events" : "clubs";

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isSearching ? "search-outline" : "calendar-outline"}
          size={64}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>
          {isSearching ? `No ${itemType} found` : `No ${itemType} available`}
        </Text>
        <Text style={styles.emptyMessage}>
          {isSearching
            ? `Try adjusting your search terms or filters`
            : `There are no ${itemType} to display at the moment`}
        </Text>
        {isSearching && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
          >
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Search</Text>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, clubs, or locations..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton("events", "Events", filteredEvents.length)}
        {renderTabButton("clubs", "Clubs", filteredClubs.length)}
      </View>
      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : activeTab === "events" ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.resultsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={(item) => item.id}
          renderItem={renderClubItem}
          contentContainerStyle={styles.resultsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  searchContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
  },
  resultsList: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["3xl"],
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
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  clearButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  clearButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
