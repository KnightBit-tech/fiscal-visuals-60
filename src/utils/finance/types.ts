
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
