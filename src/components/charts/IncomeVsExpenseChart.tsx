
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomeData, ExpenseData, calculateTotalIncome, calculateTotalExpenses } from '@/utils/dataProcessing';

interface IncomeVsExpenseChartProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ incomeData, expenseData }) => {
  const totalIncome = calculateTotalIncome(incomeData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const netSavings = totalIncome - totalExpenses;

  const data = [
    {
      name: 'Income',
      amount: totalIncome,
      fill: '#38A169', // Green
    },
    {
      name: 'Expenses',
      amount: totalExpenses,
      fill: '#E53E3E', // Red
    },
    {
      name: 'Savings',
      amount: netSavings > 0 ? netSavings : 0,
      fill: '#3182CE', // Blue
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <CardTitle>Income vs Expenses Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="amount" name="Amount" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="amount" fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-lg font-semibold text-finance-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-semibold text-finance-expense">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-xs text-muted-foreground">Net Savings</p>
            <p className={`text-lg font-semibold ${netSavings >= 0 ? 'text-finance-savings' : 'text-finance-expense'}`}>
              {formatCurrency(netSavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeVsExpenseChart;
