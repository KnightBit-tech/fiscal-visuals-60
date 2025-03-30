
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ExpenseData, formatCurrency, getDailySpendingData } from '@/utils/dataProcessing';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DailySpendingCalendarProps {
  expenseData: ExpenseData[];
}

const DailySpendingCalendar: React.FC<DailySpendingCalendarProps> = ({ expenseData }) => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [month, setMonth] = React.useState<number>(new Date().getMonth());
  
  // Get daily spending data
  const spendingData = getDailySpendingData(expenseData);
  
  // Create a map for quick lookup
  const spendingMap = spendingData.reduce((acc, item) => {
    const dateStr = format(item.date, 'yyyy-MM-dd');
    acc[dateStr] = item.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Function to determine color intensity based on spending amount
  const getColorIntensity = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!spendingMap[dateStr]) return 'bg-transparent';
    
    const amount = spendingMap[dateStr];
    // Find the max spending amount
    const maxAmount = Math.max(...Object.values(spendingMap));
    
    const intensity = amount / maxAmount;
    
    if (intensity < 0.2) return 'bg-red-100 hover:bg-red-200';
    if (intensity < 0.4) return 'bg-red-200 hover:bg-red-300';
    if (intensity < 0.6) return 'bg-red-300 hover:bg-red-400';
    if (intensity < 0.8) return 'bg-red-400 hover:bg-red-500 text-white';
    return 'bg-red-500 hover:bg-red-600 text-white';
  };
  
  const handleMonthChange = (date: Date) => {
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  };

  // Custom day content renderer
  const customDayContent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasSpending = spendingMap[dateStr] !== undefined;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md ${
                hasSpending ? getColorIntensity(day) : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          </TooltipTrigger>
          {hasSpending && (
            <TooltipContent>
              <p className="font-medium">{format(day, 'PPP')}</p>
              <p>{formatCurrency(spendingMap[dateStr])}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Daily Spending Heatmap</span>
          <span className="text-sm font-normal text-muted-foreground">
            {format(new Date(year, month), 'MMMM yyyy')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            onMonthChange={handleMonthChange}
            month={new Date(year, month)}
            className="rounded-md border"
            components={{
              Day: ({ date, ...props }) => (
                <div {...props}>
                  {customDayContent(date)}
                </div>
              ),
            }}
          />
        </div>
        <div className="mt-4 flex justify-center items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySpendingCalendar;
