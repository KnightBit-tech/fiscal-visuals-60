
import { IncomeData, ExpenseData } from './types';

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
 * Group data by date for heatmap calendar
 */
export const groupByDate = (data: (IncomeData | ExpenseData)[]): Record<string, number> => {
  return data.reduce((grouped, item) => {
    const date = item.Date;
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    grouped[dateStr] = (grouped[dateStr] || 0) + item.Amount;
    return grouped;
  }, {} as Record<string, number>);
};
