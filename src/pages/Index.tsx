
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FinanceDashboard from '@/components/FinanceDashboard';
import Header from '@/components/Header';
import { IncomeData, ExpenseData } from '@/utils/dataProcessing';
import { ThemeProvider } from '@/providers/theme-provider';

const Index = () => {
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleIncomeDataLoaded = (data: IncomeData[]) => {
    setIncomeData(data);
    checkDataLoaded(data, expenseData);
  };

  const handleExpenseDataLoaded = (data: ExpenseData[]) => {
    setExpenseData(data);
    checkDataLoaded(incomeData, data);
  };

  const checkDataLoaded = (income: IncomeData[], expenses: ExpenseData[]) => {
    if (income.length > 0 || expenses.length > 0) {
      setDataLoaded(true);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              {dataLoaded ? 'Financial Dashboard' : 'Upload Your Financial Data'}
            </h2>
            
            {!dataLoaded && (
              <div className="mb-8">
                <p className="text-muted-foreground mb-8">
                  Upload your income and expense CSV files to visualize your financial data. 
                  The dashboard will automatically process and display insights from your files.
                </p>
                
                <FileUpload
                  onIncomeDataLoaded={handleIncomeDataLoaded}
                  onExpenseDataLoaded={handleExpenseDataLoaded}
                />
              </div>
            )}
            
            {dataLoaded && (
              <FinanceDashboard
                incomeData={incomeData}
                expenseData={expenseData}
              />
            )}
          </div>
        </main>
        <footer className="border-t py-6">
          <div className="container px-4">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Fiscal Visuals. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
