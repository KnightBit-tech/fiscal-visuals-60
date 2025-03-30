
import { IncomeData, ExpenseData } from './types';

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
