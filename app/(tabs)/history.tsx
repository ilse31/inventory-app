import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Stack } from "expo-router";

import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { InvoiceCard } from "@/components/InvoiceCard";
import { Invoice, Item } from "@/types/inventory";
import { X, Package, Printer, Share } from "lucide-react-native";
import { useInventoryStore } from "@/stores/inventory-store";
import { colors, theme } from "@/constants/Colors";
import { formatCurrency } from "@/utils/helper";
import dayjs from "dayjs";

export default function HistoryScreen() {
  const { invoices, items, getItemById } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const formatDate = (date: string | Date) => {
    return dayjs(date).format("MMMM D, YYYY"); // Example: "March 31, 2025"
  };
  const filteredInvoices =
    searchQuery.trim() === ""
      ? [...invoices].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : invoices
          .filter((invoice) =>
            invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

  const handleInvoicePress = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceCard invoice={item} onPress={() => handleInvoicePress(item)} />
  );

  const getInvoiceItems = () => {
    if (!selectedInvoice) return [];

    return selectedInvoice.items.map((invoiceItem) => {
      const item = getItemById(invoiceItem.itemId);
      return { ...invoiceItem, item };
    });
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      electronics: "Electronics",
      furniture: "Furniture",
      clothing: "Clothing",
      groceries: "Groceries",
      // Add more categories as needed
    };

    return categoryLabels[category] || "Unknown Category";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Transaction History" }} />

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='Search by invoice number...'
        />

        {invoices.length === 0 ? (
          <EmptyState type='history' />
        ) : (
          <FlatList
            data={filteredInvoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No invoices match your search
              </Text>
            }
          />
        )}
      </View>

      {/* Invoice Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <ScrollView style={styles.invoiceContainer}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceId}>{selectedInvoice.id}</Text>
                  <Text style={styles.invoiceDate}>
                    {formatDate(selectedInvoice.date)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Items</Text>
                {getInvoiceItems().map((invoiceItem, index) => {
                  const itemData = invoiceItem.item as Item | undefined;

                  return (
                    <View key={index} style={styles.invoiceItemContainer}>
                      <View style={styles.itemImageContainer}>
                        {itemData?.imageUri ? (
                          <Image
                            source={{ uri: itemData.imageUri }}
                            style={styles.itemImage}
                          />
                        ) : (
                          <View style={styles.itemImagePlaceholder}>
                            <Package size={24} color={colors.primary} />
                          </View>
                        )}
                      </View>

                      <View style={styles.itemDetails}>
                        <Text style={styles.itemDescription}>
                          {itemData?.description || "Unknown Item"}
                        </Text>

                        {itemData && (
                          <Text style={styles.itemCategory}>
                            {getCategoryLabel(itemData.category)}
                          </Text>
                        )}

                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Purchase:</Text>
                          <Text style={styles.priceValue}>
                            {formatCurrency(invoiceItem.purchasePrice)}
                          </Text>
                        </View>

                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Selling:</Text>
                          <Text style={styles.priceValue}>
                            {formatCurrency(invoiceItem.sellingPrice)}
                          </Text>
                        </View>

                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Profit:</Text>
                          <Text
                            style={[
                              styles.priceValue,
                              { color: colors.success },
                            ]}
                          >
                            {formatCurrency(
                              invoiceItem.sellingPrice -
                                invoiceItem.purchasePrice
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                <View style={styles.divider} />

                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Profit:</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            selectedInvoice.profit > 0
                              ? colors.success
                              : colors.danger,
                        },
                      ]}
                    >
                      {formatCurrency(selectedInvoice.profit)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Printer size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Print</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Share size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  listContent: {
    paddingBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    marginTop: theme.spacing.xl,
    color: colors.text.tertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  invoiceContainer: {
    padding: theme.spacing.md,
  },
  invoiceHeader: {
    marginBottom: theme.spacing.md,
  },
  invoiceId: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  invoiceItemContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  itemImageContainer: {
    marginRight: theme.spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  summaryContainer: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    marginLeft: theme.spacing.xs,
    color: colors.primary,
    fontWeight: "500",
  },
});
