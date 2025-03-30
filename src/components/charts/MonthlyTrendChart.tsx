import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomeData, ExpenseData, groupByMonth, formatCurrency } from '@/utils/finance';

interface MonthlyTrendChartProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ incomeData, expenseData }) => {
  // Group data by month
  const incomeByMonth = groupByMonth(incomeData);
  const expensesByMonth = groupByMonth(expenseData);

  // Combine data for chart
  const allMonths = new Set([
    ...Object.keys(incomeByMonth),
    ...Object.keys(expensesByMonth),
  ]);

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    // Format: YYYY-MM
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    
    // Compare years first
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    // Then compare months
    return monthA - monthB;
  });

  const chartData = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: incomeByMonth[month] || 0,
      expenses: expensesByMonth[month] || 0,
      savings: (incomeByMonth[month] || 0) - (expensesByMonth[month] || 0),
      // Keep the original string for sorting
      originalMonth: month
    };
  });

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle>Monthly Income & Expense Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]"> {/* Increased height for better visibility */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                height={50}
                tickMargin={10}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#38A169"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#E53E3E"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#3182CE"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;
