
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseData, getTopSpendingCategories } from '@/utils/dataProcessing';

interface TopSpendingChartProps {
  expenseData: ExpenseData[];
  limit?: number;
}

const TopSpendingChart: React.FC<TopSpendingChartProps> = ({ expenseData, limit = 5 }) => {
  const topCategories = getTopSpendingCategories(expenseData, limit);
  
  // Format data for horizontal bar chart
  const chartData = topCategories.map(item => ({
    category: item.category,
    amount: item.amount,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 50,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="category" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="amount" 
                name="Amount" 
                fill="#E53E3E" 
                radius={[0, 4, 4, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSpendingChart;
