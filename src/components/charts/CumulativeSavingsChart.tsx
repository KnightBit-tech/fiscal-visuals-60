
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IncomeData, ExpenseData, formatCurrency } from '@/utils/finance';

interface CumulativeSavingsChartProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
  year?: number;
}

const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({ 
  incomeData, 
  expenseData,
  year = new Date().getFullYear()
}) => {
  // Filter data for the selected year
  const yearIncomeData = incomeData.filter(item => item.year === year);
  const yearExpenseData = expenseData.filter(item => item.year === year);
  
  // Group income and expenses by month
  const monthlyIncome: Record<number, number> = {};
  const monthlyExpenses: Record<number, number> = {};
  
  yearIncomeData.forEach(item => {
    const month = item.month || 0;
    monthlyIncome[month] = (monthlyIncome[month] || 0) + item.Amount;
  });
  
  yearExpenseData.forEach(item => {
    const month = item.month || 0;
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + item.Amount;
  });
  
  // Calculate cumulative savings
  let cumulativeSavings = 0;
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const income = monthlyIncome[i] || 0;
    const expenses = monthlyExpenses[i] || 0;
    const monthlySavings = income - expenses;
    cumulativeSavings += monthlySavings;
    
    return {
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      cumulativeSavings,
      monthlySavings
    };
  });

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle>Cumulative Savings ({year})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMonthlySavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativeSavings" 
                name="Cumulative Savings"
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorSavings)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="monthlySavings" 
                name="Monthly Savings"
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorMonthlySavings)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          This chart shows how your savings accumulate throughout the year
        </p>
      </CardContent>
    </Card>
  );
};

export default CumulativeSavingsChart;
