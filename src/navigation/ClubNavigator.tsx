import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import DashboardScreen from "../screens/club/DashboardScreen";
import CreateEventScreen from "../screens/club/CreateEventScreen";
import ProfileScreen from "../screens/club/ProfileScreen";
import EditProfileScreen from "../screens/club/EditProfileScreen";
import { ManageClubScreen } from "../screens/club";
import EventsManagementScreen from "../screens/club/EventsManagementScreen";
import EditEventScreen from "../screens/club/EditEventScreen";
import EventDetailsScreen from "../screens/shared/EventDetailsScreen";

import { theme } from "../utils/theme";
import type { ClubStackParamList } from "../types";

// Define the navigation types for the Tab Navigator
type ClubTabParamList = {
  Dashboard: undefined;
  CreateEvent: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ClubTabParamList>();
const Stack = createStackNavigator<ClubStackParamList>();

// Tab Navigator for main club screens
function ClubTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "CreateEvent") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "analytics-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: theme.colors.border,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{
          title: "Create Event",
          tabBarLabel: "Create",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator for club section (includes modals and details)
function ClubNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ClubTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: theme.colors.border,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen
        name="ClubTabs"
        component={ClubTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          title: "Event Details",
          headerBackTitle: "Back",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="ManageClub"
        component={ManageClubScreen}
        options={{
          title: "Manage Club",
        }}
      />
      <Stack.Screen
        name="EventsManagement"
        component={EventsManagementScreen}
        options={{
          title: "Events Management",
        }}
      />
      <Stack.Screen
        name="EditEvent"
        component={EditEventScreen}
        options={{
          title: "Edit Event",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default ClubNavigator;
