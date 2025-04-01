import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Item,
  Transaction,
  Invoice,
  ItemStatus,
  ItemCategory,
} from "@/types/inventory";
import { calculateProfit, generateItemCode } from "@/utils/helper";

interface InventoryState {
  items: Item[];
  transactions: Transaction[];
  invoices: Invoice[];

  // Item actions
  addItem: (
    item: Omit<
      Item,
      "id" | "code" | "createdAt" | "updatedAt" | "status" | "quantity"
    > & { status?: ItemStatus; quantity?: number },
  ) => string;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
  getItemByCode: (code: string) => Item | undefined;

  // Transaction actions
  recordTransaction: (
    type: "in" | "out",
    itemData: {
      id?: string;
      category: ItemCategory;
      description: string;
      purchasePrice: number;
      sellingPrice?: number;
      imageUri?: string;
      quantity: number;
    },
    notes?: string,
  ) => { itemId: string; transactionId: string; invoiceId?: string };

  // Multiple transactions in one go (for cart checkout)
  recordMultipleTransactions: (
    items: {
      id: string;
      category: ItemCategory;
      description: string;
      purchasePrice: number;
      sellingPrice: number;
      imageUri?: string;
      quantity: number;
    }[],
    notes?: string,
  ) => { transactionIds: string[]; invoiceId: string };

  // Filtering and querying
  getItemsByStatus: (status: ItemStatus) => Item[];
  getItemsByCategory: (category: ItemCategory) => Item[];
  searchItems: (query: string) => Item[];

  // Reporting
  getMonthlyProfits: (year?: number) => { month: number; profit: number }[];
  getTotalProfit: () => number;

  // Stock management
  getTotalStock: () => number;
  updateStock: (itemId: string, quantity: number, isAddition: boolean) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      transactions: [],
      invoices: [],

      // Item actions
      addItem: (itemData) => {
        const now = new Date().toISOString();
        const newItem: Item = {
          id: Date.now().toString(),
          code: generateItemCode(),
          status: itemData.status || "in",
          quantity: itemData.quantity || 0,
          createdAt: now,
          updatedAt: now,
          ...itemData,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        return newItem.id;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item,
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      getItemByCode: (code) => {
        return get().items.find((item) => item.code === code);
      },

      // Transaction actions
      recordTransaction: (type, itemData, notes) => {
        const now = new Date().toISOString();
        let itemId = itemData.id;
        const quantity = itemData.quantity || 1;

        // If no item ID provided, create a new item
        if (!itemId) {
          itemId = get().addItem({
            ...itemData,
            status: type,
            quantity: type === "in" ? quantity : 0,
          });
        } else {
          // Update existing item
          const existingItem = get().getItemById(itemId);

          if (existingItem) {
            // Pastikan quantity tidak undefined dengan memberikan default nilai 0
            const currentQuantity = existingItem.quantity || 0;

            // Update quantity berdasarkan tipe transaksi
            const newQuantity =
              type === "in"
                ? currentQuantity + quantity
                : Math.max(0, currentQuantity - quantity);

            // Perbarui status item jika quantity menjadi 0
            const newStatus = newQuantity > 0 ? "in" : "out";

            get().updateItem(itemId, {
              status: newStatus,
              quantity: newQuantity,
              sellingPrice: itemData.sellingPrice,
              updatedAt: now,
            });
          }
        }

        // Create transaction record
        const transaction: Transaction = {
          id: Date.now().toString(),
          itemId,
          type,
          quantity,
          date: now,
          notes,
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));

        // For outgoing items, create an invoice
        let invoiceId;
        if (type === "out" && itemData.sellingPrice) {
          const item = get().getItemById(itemId);

          if (item) {
            const profit = calculateProfit(
              item.purchasePrice,
              itemData.sellingPrice,
            );
            const invoice: Invoice = {
              id: `INV-${Date.now()}`,
              transactionId: transaction.id,
              date: now,
              items: [
                {
                  itemId,
                  quantity,
                  purchasePrice: item.purchasePrice,
                  sellingPrice: itemData.sellingPrice,
                },
              ],
              totalAmount: itemData.sellingPrice * quantity,
              profit: profit * quantity,
            };

            set((state) => ({
              invoices: [...state.invoices, invoice],
            }));

            invoiceId = invoice.id;
          }
        }

        return { itemId, transactionId: transaction.id, invoiceId };
      },

      // Record multiple transactions at once (for cart checkout)
      recordMultipleTransactions: (items, notes) => {
        const now = new Date().toISOString();
        const transactionIds: string[] = [];
        const invoiceItems: {
          itemId: string;
          quantity: number;
          purchasePrice: number;
          sellingPrice: number;
        }[] = [];
        let totalAmount = 0;
        let totalProfit = 0;

        // Process each item
        items.forEach((itemData) => {
          const itemId = itemData.id;
          const existingItem = get().getItemById(itemId);

          if (existingItem) {
            // Pastikan quantity tidak undefined dengan memberikan default nilai 0
            const currentQuantity = existingItem.quantity || 0;
            const itemQuantity = itemData.quantity || 0;

            // Update item quantity
            const newQuantity = Math.max(0, currentQuantity - itemQuantity);
            const newStatus = newQuantity > 0 ? "in" : "out";

            get().updateItem(itemId, {
              status: newStatus,
              quantity: newQuantity,
              updatedAt: now,
            });

            // Create transaction record
            const transaction: Transaction = {
              id: `${Date.now()}-${itemId}`,
              itemId,
              type: "out",
              quantity: itemQuantity,
              date: now,
              notes,
            };

            set((state) => ({
              transactions: [...state.transactions, transaction],
            }));

            transactionIds.push(transaction.id);

            // Calculate profit and amount
            const profit = calculateProfit(
              existingItem.purchasePrice,
              itemData.sellingPrice,
            );
            const amount = (itemData.sellingPrice || 0) * itemQuantity;

            totalAmount += amount;
            totalProfit += profit * itemQuantity;

            // Add to invoice items
            invoiceItems.push({
              itemId,
              quantity: itemQuantity,
              purchasePrice: existingItem.purchasePrice,
              sellingPrice: itemData.sellingPrice,
            });
          }
        });

        // Create a single invoice for all items
        const invoiceId = `INV-${Date.now()}`;
        const invoice: Invoice = {
          id: invoiceId,
          transactionId: transactionIds.join(","), // Join all transaction IDs
          date: now,
          items: invoiceItems,
          totalAmount,
          profit: totalProfit,
        };

        set((state) => ({
          invoices: [...state.invoices, invoice],
        }));

        return { transactionIds, invoiceId };
      },

      // Filtering and querying
      getItemsByStatus: (status) => {
        return get().items.filter((item) => item.status === status);
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      searchItems: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().items.filter(
          (item) =>
            item.description.toLowerCase().includes(lowerQuery) ||
            item.code.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery),
        );
      },

      // Reporting
      getMonthlyProfits: (year) => {
        const invoices = get().invoices;
        const monthlyProfits = Array(12)
          .fill(0)
          .map((_, i) => ({ month: i, profit: 0 }));

        invoices.forEach((invoice) => {
          const date = new Date(invoice.date);
          const invoiceYear = date.getFullYear();

          if (year === undefined || invoiceYear === year) {
            const month = date.getMonth();
            monthlyProfits[month].profit += invoice.profit;
          }
        });

        return monthlyProfits;
      },

      getTotalProfit: () => {
        return get().invoices.reduce(
          (total, invoice) => total + invoice.profit,
          0,
        );
      },

      // Stock management
      getTotalStock: () => {
        return get().items.reduce(
          (total, item) => total + (item.quantity || 0),
          0,
        );
      },

      updateStock: (itemId, quantity, isAddition) => {
        const item = get().getItemById(itemId);
        if (item) {
          // Gunakan item.quantity || 0 untuk mencegah undefined
          const currentQuantity = item.quantity || 0;

          const newQuantity = isAddition
            ? currentQuantity + quantity
            : Math.max(0, currentQuantity - quantity);

          get().updateItem(itemId, {
            quantity: newQuantity,
            status: newQuantity > 0 ? "in" : "out",
          });
        }
      },
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
