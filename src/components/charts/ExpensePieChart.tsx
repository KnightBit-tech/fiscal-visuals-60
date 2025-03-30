
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ExpenseData, groupExpensesByCategory } from '@/utils/dataProcessing';

interface ExpensePieChartProps {
  expenseData: ExpenseData[];
  onCategoryClick?: (category: string) => void;
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseData, onCategoryClick }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(index);
    if (onCategoryClick && data && data.name) {
      onCategoryClick(data.name);
    }
  };

  // Group expenses by category
  const expensesByCategory = groupExpensesByCategory(expenseData);
  
  // Convert to array for chart
  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  // Color palette for pie chart
  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144',
    '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B',
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
      <CardHeader>
        <CardTitle>Expense Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Click on a category to filter expenses
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpensePieChart;
