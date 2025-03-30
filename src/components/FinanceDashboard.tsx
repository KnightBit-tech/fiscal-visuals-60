
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  IncomeData, 
  ExpenseData, 
  filterExpensesByCategory, 
  formatCurrency 
} from '@/utils/finance';
import IncomeVsExpenseChart from './charts/IncomeVsExpenseChart';
import ExpensePieChart from './charts/ExpensePieChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import TopSpendingChart from './charts/TopSpendingChart';
import CashFlowChart from './charts/CashFlowChart';
import YearlySummaryChart from './charts/YearlySummaryChart';
import DailySpendingCalendar from './charts/DailySpendingCalendar';
import CumulativeSavingsChart from './charts/CumulativeSavingsChart';
import TransactionTable from './TransactionTable';
import { 
  CalendarDays, 
  Download, 
  Filter, 
  Search, 
  FileDown, 
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import generateReport from '@/utils/reportGenerator';

interface FinanceDashboardProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ incomeData, expenseData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseData[]>(expenseData);
  const [filteredIncomes, setFilteredIncomes] = useState<IncomeData[]>(incomeData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const { toast } = useToast();

  // Get unique years from data
  const years = Array.from(
    new Set([
      ...incomeData.map((item) => item.year?.toString() || ''),
      ...expenseData.map((item) => item.year?.toString() || ''),
    ])
  ).filter(Boolean).sort();

  // Get months for dropdown
  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  // Initialize filters on first load
  useEffect(() => {
    applyFilters('all', 'all');
  }, [incomeData, expenseData]);

  // Handle category click from pie chart
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    const filtered = filterExpensesByCategory(expenseData, category);
    setFilteredExpenses(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      applyFilters(selectedYear, selectedMonth);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    
    // Filter expenses
    const filteredExp = filteredExpenses.filter((expense) => {
      return (
        expense.Name.toLowerCase().includes(lowercaseQuery) ||
        expense.Categories.toLowerCase().includes(lowercaseQuery) ||
        expense.Notes.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    // Filter incomes
    const filteredInc = filteredIncomes.filter((income) => {
      return (
        income.Name.toLowerCase().includes(lowercaseQuery) ||
        income.Sources.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    setFilteredExpenses(filteredExp);
    setFilteredIncomes(filteredInc);
  };

  // Handle year filter
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    applyFilters(value, selectedMonth);
  };

  // Handle month filter
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    applyFilters(selectedYear, value);
  };

  // Apply combined filters
  const applyFilters = (year: string, month: string) => {
    // Filter expenses
    let filteredExp = [...expenseData];
    let filteredInc = [...incomeData];
    
    // Apply year filter if not "all"
    if (year !== 'all') {
      filteredExp = filteredExp.filter((expense) => expense.year?.toString() === year);
      filteredInc = filteredInc.filter((income) => income.year?.toString() === year);
    }
    
    // Apply month filter if not "all"
    if (month !== 'all') {
      filteredExp = filteredExp.filter((expense) => expense.month?.toString() === month);
      filteredInc = filteredInc.filter((income) => income.month?.toString() === month);
    }
    
    // Apply category filter if selected
    if (selectedCategory) {
      filteredExp = filteredExp.filter((expense) => expense.Categories === selectedCategory);
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      
      filteredExp = filteredExp.filter((expense) => {
        return (
          expense.Name.toLowerCase().includes(lowercaseQuery) ||
          expense.Categories.toLowerCase().includes(lowercaseQuery) ||
          expense.Notes.toLowerCase().includes(lowercaseQuery)
        );
      });
      
      filteredInc = filteredInc.filter((income) => {
        return (
          income.Name.toLowerCase().includes(lowercaseQuery) ||
          income.Sources.toLowerCase().includes(lowercaseQuery)
        );
      });
    }
    
    setFilteredExpenses(filteredExp);
    setFilteredIncomes(filteredInc);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedYear('all');
    setSelectedMonth('all');
    applyFilters('all', 'all');
  };

  // Handle report generation
  const handleGenerateReport = () => {
    try {
      generateReport(incomeData, expenseData, reportYear);
      toast({
        title: "Report Generated",
        description: `Your financial report for ${reportYear} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "There was a problem generating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle calendar view
  const toggleCalendarView = () => {
    setShowCalendarView(!showCalendarView);
  };

  return (
    <div className="space-y-6">
      {/* Filters and controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Transactions</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Filter by Year</Label>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="month">Filter by Month</Label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button onClick={toggleCalendarView} variant="outline" className="w-full">
                <CalendarDays className="mr-2 h-4 w-4" />
                {showCalendarView ? 'Hide Calendar' : 'Show Calendar'}
              </Button>
            </div>
            
            <div className="flex items-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Financial Report</DialogTitle>
                    <DialogDescription>
                      Select a year to generate a detailed financial report.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="report-year" className="mb-2 block">Year</Label>
                    <Select 
                      value={reportYear.toString()} 
                      onValueChange={(value) => setReportYear(parseInt(value))}
                    >
                      <SelectTrigger id="report-year">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={`report-${year}`} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleGenerateReport}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="mt-4 p-2 bg-muted rounded-md flex justify-between items-center">
              <p className="text-sm">
                Filtered by category: <span className="font-medium">{selectedCategory}</span>
              </p>
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedCategory(null);
                applyFilters(selectedYear, selectedMonth);
              }}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-lg font-medium mb-1">Total Income</p>
            <p className="text-3xl font-bold">
              {formatCurrency(filteredIncomes.reduce((sum, item) => sum + item.Amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-lg font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">
              {formatCurrency(filteredExpenses.reduce((sum, item) => sum + item.Amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-lg font-medium mb-1">Net Savings</p>
            <p className="text-3xl font-bold">
              {formatCurrency(
                filteredIncomes.reduce((sum, item) => sum + item.Amount, 0) -
                filteredExpenses.reduce((sum, item) => sum + item.Amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View (conditionally rendered) */}
      {showCalendarView && (
        <DailySpendingCalendar expenseData={filteredExpenses} />
      )}

      {/* Dashboard content */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="yearly">Yearly & Cash Flow</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative Savings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ExpensePieChart 
              expenseData={selectedCategory ? filteredExpenses : filteredExpenses} 
              onCategoryClick={handleCategoryClick}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeVsExpenseChart 
              incomeData={filteredIncomes} 
              expenseData={filteredExpenses} 
            />
          </div>
          
          {/* Monthly Trend Chart in its own row at full width */}
          <div className="grid grid-cols-1 gap-6">
            <MonthlyTrendChart 
              incomeData={filteredIncomes} 
              expenseData={filteredExpenses} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSpendingChart expenseData={filteredExpenses} />
            
            {/* Placeholder for additional charts to be added in the future */}
            <Card className="animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-80">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-muted-foreground text-center">
                  Additional visualizations will be added in the next update.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="yearly" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <YearlySummaryChart 
              incomeData={incomeData} 
              expenseData={expenseData} 
            />
            <CashFlowChart 
              incomeData={incomeData} 
              expenseData={expenseData} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="cumulative" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Year</h3>
              <Select 
                value={selectedYear === 'all' ? (new Date().getFullYear().toString()) : selectedYear} 
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={`cumulative-${year}`} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <CumulativeSavingsChart 
              incomeData={incomeData} 
              expenseData={expenseData}
              year={parseInt(selectedYear === 'all' ? new Date().getFullYear().toString() : selectedYear)} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-6">
          <TransactionTable 
            incomeData={filteredIncomes} 
            expenseData={filteredExpenses} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
