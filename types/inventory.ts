export type ItemStatus = "in" | "out";
export type ItemCategory =
  | "electronics"
  | "furniture"
  | "clothing"
  | "food"
  | "office"
  | "other";

export interface Item {
  id: string;
  code: string;
  category: ItemCategory;
  description: string;
  purchasePrice: number;
  sellingPrice?: number;
  imageUri?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  transactionId: string;
  date: string;
  items: {
    itemId: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
  }[];
  totalAmount: number;
  profit: number;
}

export interface MonthlyProfit {
  month: number;
  year: number;
  profit: number;
  transactions: number;
}
