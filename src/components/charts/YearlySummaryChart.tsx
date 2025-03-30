
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncomeData, ExpenseData, getYearlySummary, formatCurrency } from '@/utils/dataProcessing';

interface YearlySummaryChartProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

const YearlySummaryChart: React.FC<YearlySummaryChartProps> = ({ incomeData, expenseData }) => {
  const summaryData = getYearlySummary(incomeData, expenseData);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    return [formatCurrency(value), name === 'income' ? 'Income' : 'Expenses'];
  };

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader>
        <CardTitle>Yearly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="year" 
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
              <Legend />
              <Bar dataKey="income" name="Income" fill="#36A2EB" />
              <Bar dataKey="expenses" name="Expenses" fill="#FF6384" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default YearlySummaryChart;
