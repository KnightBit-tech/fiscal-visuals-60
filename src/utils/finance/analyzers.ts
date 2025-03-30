
import { IncomeData, ExpenseData } from './types';
import { groupExpensesByCategory, groupByMonth, groupByDate } from './calculators';
import { filterByDateRange } from './filters';

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

/**
 * Get daily spending data for calendar heatmap
 */
export const getDailySpendingData = (
  expenseData: ExpenseData[],
  startDate: Date = new Date(new Date().getFullYear(), 0, 1),
  endDate: Date = new Date()
): { date: Date; amount: number }[] => {
  const filteredData = filterByDateRange(expenseData, startDate, endDate);
  const dateMap = groupByDate(filteredData);
  
  return Object.entries(dateMap).map(([dateStr, amount]) => ({
    date: new Date(dateStr),
    amount
  }));
};

/**
 * Get cash flow data (income - expenses) over time
 */
export const getCashFlowData = (
  incomeData: IncomeData[],
  expenseData: ExpenseData[]
): { date: string; cashFlow: number }[] => {
  const incomeByMonth = groupByMonth(incomeData);
  const expensesByMonth = groupByMonth(expenseData);
  
  // Get all unique months
  const allMonths = [...new Set([
    ...Object.keys(incomeByMonth),
    ...Object.keys(expensesByMonth)
  ])].sort();
  
  return allMonths.map(month => {
    const income = incomeByMonth[month] || 0;
    const expenses = expensesByMonth[month] || 0;
    return {
      date: month,
      cashFlow: income - expenses
    };
  });
};

/**
 * Get yearly summary data for comparison
 */
export const getYearlySummary = (
  incomeData: IncomeData[],
  expenseData: ExpenseData[]
): { year: number; income: number; expenses: number }[] => {
  // Group income by year
  const incomeByYear = incomeData.reduce((grouped, item) => {
    const year = item.year || new Date().getFullYear();
    grouped[year] = (grouped[year] || 0) + item.Amount;
    return grouped;
  }, {} as Record<number, number>);
  
  // Group expenses by year
  const expensesByYear = expenseData.reduce((grouped, item) => {
    const year = item.year || new Date().getFullYear();
    grouped[year] = (grouped[year] || 0) + item.Amount;
    return grouped;
  }, {} as Record<number, number>);
  
  // Get all unique years
  const allYears = [...new Set([
    ...Object.keys(incomeByYear).map(Number),
    ...Object.keys(expensesByYear).map(Number)
  ])].sort();
  
  return allYears.map(year => ({
    year,
    income: incomeByYear[year] || 0,
    expenses: expensesByYear[year] || 0
  }));
};

/**
 * Get notable transactions (highest income & expenses)
 */
export const getNotableTransactions = (
  incomeData: IncomeData[],
  expenseData: ExpenseData[],
  limit: number = 5
): { topIncome: IncomeData[]; topExpenses: ExpenseData[] } => {
  const topIncome = [...incomeData]
    .sort((a, b) => b.Amount - a.Amount)
    .slice(0, limit);
    
  const topExpenses = [...expenseData]
    .sort((a, b) => b.Amount - a.Amount)
    .slice(0, limit);
    
  return { topIncome, topExpenses };
};
