import dayjs from "dayjs";

// Generate a unique item code with prefix and random numbers
export const generateItemCode = (prefix = "ITM"): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

// Format currency values
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date strings
export const formatDate = (
  dateString: string,
  formatStr = "MMM DD, YYYY",
): string => {
  try {
    return dayjs(dateString).format(formatStr);
  } catch (error) {
    return dateString;
  }
};

// Calculate profit from purchase and selling price
export const calculateProfit = (
  purchasePrice: number,
  sellingPrice: number,
): number => {
  return sellingPrice - purchasePrice;
};

// Group transactions by month for reporting
export const groupTransactionsByMonth = (transactions: any[]) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const date = dayjs(transaction.date);
    const month = date.month();
    const year = date.year();
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        profit: 0,
        transactions: 0,
      };
    }

    acc[key].profit += transaction.profit || 0;
    acc[key].transactions += 1;

    return acc;
  }, {});

  return Object.values(grouped);
};
