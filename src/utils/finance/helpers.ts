
import { IncomeData, ExpenseData } from './types';

/**
 * Clean text by removing markdown links and parenthetical URLs
 * @param text Input text that may contain markdown links or URLs in parentheses
 * @returns Plain text without markdown links or parenthetical content
 */
export const cleanMarkdownLinks = (text: string): string => {
  if (!text) return '';
  
  // First handle standard markdown links [text](url)
  let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  
  // Then handle text followed by parentheses with URL-like content: Text (URL)
  cleaned = cleaned.replace(/(.+?)\s*\([^)]*%[^)]*\)/g, '$1').trim();
  
  return cleaned;
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
 * Format currency in Rupees
 * @param amount Numeric amount
 * @returns Formatted string in Rupees
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
