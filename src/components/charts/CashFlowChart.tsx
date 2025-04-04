
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IncomeData, ExpenseData } from '@/utils/finance/types';
import { formatCurrency, groupByMonth } from '@/utils/finance';
import { format } from 'date-fns';

interface CashFlowChartProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ incomeData, expenseData }) => {
  // Group data by month
  const incomeByMonth = groupByMonth(incomeData);
  const expensesByMonth = groupByMonth(expenseData);
  
  // Get all unique months
  const allMonths = new Set([
    ...Object.keys(incomeByMonth),
    ...Object.keys(expensesByMonth),
  ]);
  
  // Calculate cash flow for each month
  const cashFlowData = Array.from(allMonths).map(month => {
    const income = incomeByMonth[month] || 0;
    const expenses = expensesByMonth[month] || 0;
    const cashFlow = income - expenses;
    
    return {
      date: month, // YYYY-MM format
      cashFlow
    };
  });
  
  // Sort data chronologically by date
  const sortedData = cashFlowData.sort((a, b) => {
    // Format: YYYY-MM
    const [yearA, monthA] = a.date.split('-').map(Number);
    const [yearB, monthB] = b.date.split('-').map(Number);
    
    // Compare years first
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    // Then compare months
    return monthA - monthB;
  });
  
  // Format data for the chart
  const chartData = sortedData.map(item => {
    const [year, month] = item.date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    
    return {
      date: format(dateObj, 'MMM yyyy'),
      cashFlow: item.cashFlow,
      // Keep raw date for sorting
      rawDate: item.date
    };
  });

  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => {
    return [formatCurrency(value), 'Cash Flow'];
  };

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle>Cash Flow Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip 
                formatter={tooltipFormatter}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="cashFlow" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorCashFlow)" 
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Positive values represent net savings, negative values represent net spending
        </p>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
