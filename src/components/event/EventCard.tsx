import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { Card } from "../common/Card";
import { formatDate } from "../../utils/helpers";
import type { Event } from "../../types/event";

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  variant?: "default" | "compact";
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  variant = "default",
}) => {
  const isUpcoming = new Date(event.startDate) > new Date();
  const statusColor = {
    draft: theme.colors.warning,
    published: theme.colors.success,
    cancelled: theme.colors.error,
    completed: theme.colors.textSecondary,
  }[event.status];

  const categoryIcons = {
    academic: "book-outline",
    social: "people-outline",
    sports: "basketball-outline",
    cultural: "color-palette-outline",
    workshop: "construct-outline",
    other: "ellipsis-horizontal-outline",
  } as const;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.categoryIconWrapper}>
            <Ionicons
              name={categoryIcons[event.category]}
              size={22}
              color={theme.colors.textInverse}
            />
          </View>
          <View style={styles.headerTextWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {event.title}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText} numberOfLines={1}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {variant === "default" ? (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {formatDate(event.startDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={15}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>
        <View style={styles.detailsRow}>
          {event.maxParticipants ? (
            <View style={styles.detailItem}>
              <Ionicons
                name="people-outline"
                size={15}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.currentParticipants}/{event.maxParticipants} participants
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {event.clubName ? (
            <View style={styles.detailItem}>
              <Ionicons
                name="school-outline"
                size={15}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {event.clubName}
              </Text>
            </View>
          ) : null}
        </View>

        {(isUpcoming ? (event.registrationRequired ? (
          <View style={styles.footer}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={theme.colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.registrationText}>Registration required</Text>
          </View>
        ) : null) : null)}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: 18,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  categoryIconWrapper: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    padding: 8,
    marginRight: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textInverse,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    marginTop: -2,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    flexWrap: "nowrap",
    minWidth: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 4,
  },
  registrationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
