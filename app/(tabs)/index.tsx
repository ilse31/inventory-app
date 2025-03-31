import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { router, Stack, useRouter } from "expo-router";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Item } from "@/types/inventory";
import { Plus, Filter } from "lucide-react-native";
import { useInventoryStore } from "@/stores/inventory-store";
import { colors, theme } from "@/constants/Colors";
import { useRoute } from "@react-navigation/native";

export default function InventoryScreen() {
  const navigate = useRouter();
  const { items, searchItems } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      setFilteredItems(searchItems(searchQuery));
    }
  }, [searchQuery, items, searchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you might fetch fresh data from a server here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <ItemCard item={item} onPress={() => {}} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Inventory",
          headerRight: () => (
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='Search items...'
        />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {items.filter((item) => item.status === "in").length}
            </Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {items.filter((item) => item.status === "out").length}
            </Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
        </View>

        {items.length === 0 ? (
          <EmptyState
            type='items'
            actionLabel='Add Item'
            onActionPress={() => {
              navigate.push("/(tabs)/incoming");
            }}
          />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items match your search</Text>
            }
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <Button
          title='Add Item'
          onPress={() => {
            navigate.push("/(tabs)/incoming");
          }}
          icon={<Plus size={20} color={colors.text.light} />}
          style={styles.fab}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  emptyText: {
    textAlign: "center",
    marginTop: theme.spacing.xl,
    color: colors.text.tertiary,
  },
  fabContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  fab: {
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
  },
  filterButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
});
