
export interface IncomeData {
  Name: string;
  Sources: string;
  Amount: number;
  Date: Date;
  formattedDate?: string;
  month?: number;
  year?: number;
}

export interface ExpenseData {
  Name: string;
  Categories: string;
  Amount: number;
  Date: Date;
  Expenses: string;
  Notes: string;
  formattedDate?: string;
  month?: number;
  year?: number;
}

/**
 * Clean text by removing markdown links
 * @param text Input text that may contain markdown links
 * @returns Plain text without markdown links
 */
export const cleanMarkdownLinks = (text: string): string => {
  // Replace markdown links [text](url) with just 'text'
  return text ? text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() : '';
};

/**
 * Convert currency string to number
 * @param amountStr Amount as string, possibly with currency symbols
 * @returns Numeric value
 */
export const parseCurrency = (amountStr: string): number => {
  if (!amountStr) return 0;
  
  // Remove currency symbols and commas, then parse as float
  const cleanedStr = amountStr.replace(/[₹$€£¥,]/g, '').trim();
  return parseFloat(cleanedStr) || 0;
};

/**
 * Parse date string to Date object
 * @param dateStr Date as string
 * @returns Date object
 */
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Try parsing the date
  const parsedDate = new Date(dateStr);
  
  // Check if the date is valid
  if (isNaN(parsedDate.getTime())) {
    console.error(`Invalid date: ${dateStr}`);
    return new Date(); // Return current date as fallback
  }
  
  return parsedDate;
};

/**
 * Process income CSV data
 * @param csvData Raw CSV data as array of objects
 * @returns Processed income data
 */
export const processIncomeData = (csvData: any[]): IncomeData[] => {
  return csvData.map(row => {
    const date = parseDate(row.Date);
    
    return {
      Name: row.Name || 'Unknown',
      Sources: cleanMarkdownLinks(row.Sources),
      Amount: parseCurrency(row.Amount),
      Date: date,
      formattedDate: date.toLocaleDateString(),
      month: date.getMonth(),
      year: date.getFullYear()
    };
  });
};

/**
 * Process expense CSV data
 * @param csvData Raw CSV data as array of objects
 * @returns Processed expense data
 */
export const processExpenseData = (csvData: any[]): ExpenseData[] => {
  return csvData.map(row => {
    const date = parseDate(row.Date);
    
    return {
      Name: row.Name || 'Unknown',
      Categories: cleanMarkdownLinks(row.Categories),
      Amount: parseCurrency(row.Amount),
      Date: date,
      Expenses: row.Expenses || '',
      Notes: row.Notes || '',
      formattedDate: date.toLocaleDateString(),
      month: date.getMonth(),
      year: date.getFullYear()
    };
  });
};

/**
 * Calculate total income from income data
 */
export const calculateTotalIncome = (incomeData: IncomeData[]): number => {
  return incomeData.reduce((total, item) => total + item.Amount, 0);
};

/**
 * Calculate total expenses from expense data
 */
export const calculateTotalExpenses = (expenseData: ExpenseData[]): number => {
  return expenseData.reduce((total, item) => total + item.Amount, 0);
};

/**
 * Calculate net savings (income - expenses)
 */
export const calculateNetSavings = (incomeTotal: number, expenseTotal: number): number => {
  return incomeTotal - expenseTotal;
};

/**
 * Group expenses by category
 */
export const groupExpensesByCategory = (expenseData: ExpenseData[]): Record<string, number> => {
  return expenseData.reduce((grouped, item) => {
    const category = item.Categories || 'Uncategorized';
    grouped[category] = (grouped[category] || 0) + item.Amount;
    return grouped;
  }, {} as Record<string, number>);
};

/**
 * Group income by source
 */
export const groupIncomeBySource = (incomeData: IncomeData[]): Record<string, number> => {
  return incomeData.reduce((grouped, item) => {
    const source = item.Sources || 'Uncategorized';
    grouped[source] = (grouped[source] || 0) + item.Amount;
    return grouped;
  }, {} as Record<string, number>);
};

/**
 * Group data by month for time series
 */
export const groupByMonth = (data: (IncomeData | ExpenseData)[]): Record<string, number> => {
  return data.reduce((grouped, item) => {
    const date = item.Date;
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    grouped[monthYear] = (grouped[monthYear] || 0) + item.Amount;
    return grouped;
  }, {} as Record<string, number>);
};

/**
 * Filter data by date range
 */
export const filterByDateRange = (
  data: (IncomeData | ExpenseData)[],
  startDate: Date,
  endDate: Date
): (IncomeData | ExpenseData)[] => {
  return data.filter(item => {
    const itemDate = item.Date;
    return itemDate >= startDate && itemDate <= endDate;
  });
};

/**
 * Filter expenses by category
 */
export const filterExpensesByCategory = (
  expenseData: ExpenseData[],
  category: string
): ExpenseData[] => {
  return expenseData.filter(item => item.Categories === category);
};

/**
 * Filter income by source
 */
export const filterIncomeBySource = (
  incomeData: IncomeData[],
  source: string
): IncomeData[] => {
  return incomeData.filter(item => item.Sources === source);
};

/**
 * Search through data by text query
 */
export const searchData = (
  data: (IncomeData | ExpenseData)[],
  query: string
): (IncomeData | ExpenseData)[] => {
  const lowerQuery = query.toLowerCase();
  
  return data.filter(item => {
    // Search through all string fields
    for (const key in item) {
      const value = (item as any)[key];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
        return true;
      }
    }
    return false;
  });
};

/**
 * Get top spending categories
 */
export const getTopSpendingCategories = (
  expenseData: ExpenseData[],
  limit: number = 5
): { category: string; amount: number }[] => {
  const categoriesMap = groupExpensesByCategory(expenseData);
  
  return Object.entries(categoriesMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};
