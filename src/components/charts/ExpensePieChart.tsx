
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ExpenseData, groupExpensesByCategory, formatCurrency } from '@/utils/dataProcessing';

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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
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
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="animate-slide-in col-span-1 lg:col-span-2" style={{ animationDelay: '0.2s' }}>
      <CardHeader>
        <CardTitle>Expense Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
                paddingAngle={2}
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
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
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
