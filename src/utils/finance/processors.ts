
import { IncomeData, ExpenseData } from './types';
import { cleanMarkdownLinks, parseCurrency, parseDate } from './helpers';

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
