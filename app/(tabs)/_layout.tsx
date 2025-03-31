import React from "react";
import { Tabs } from "expo-router";
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileBarChart,
  History,
} from "lucide-react-native";
import { colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text.primary,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="incoming"
        options={{
          title: "Incoming",
          tabBarIcon: ({ color, size }) => (
            <ArrowDownLeft size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="outgoing"
        options={{
          title: "Outgoing",
          tabBarIcon: ({ color, size }) => (
            <ArrowUpRight size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <FileBarChart size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
