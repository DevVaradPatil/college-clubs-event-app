import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { Card } from "../common/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = theme.colors.primary,
  onPress,
  subtitle,
  trend,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  console.log("StatCard rendered with title:", title, "and value:", value);
  return (
    <CardComponent onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.content}>
          <View
            style={[styles.iconContainer, { backgroundColor: `${color}15` }]}
          >
            <Ionicons name={icon} size={24} color={color} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {trend ? (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={trend.isPositive ? "trending-up" : "trending-down"}
                  size={12}
                  color={
                    trend.isPositive ? theme.colors.success : theme.colors.error
                  }
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color: trend.isPositive
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                >
                  {Math.abs(trend.value)}%
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 85,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
