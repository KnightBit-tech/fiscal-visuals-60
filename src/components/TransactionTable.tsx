import React, { useState, useMemo, useEffect } from 'react';
import { IncomeData, ExpenseData, formatCurrency } from '@/utils/finance';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface TransactionTableProps {
  incomeData: IncomeData[];
  expenseData: ExpenseData[];
}

// Combined transaction type for display
type Transaction = {
  id: string;
  type: 'income' | 'expense';
  name: string;
  category: string;
  amount: number;
  date: Date;
  formattedDate: string;
  notes?: string;
};

const TransactionTable: React.FC<TransactionTableProps> = ({ incomeData, expenseData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Combine income and expense data into a single array - wrapped in useMemo to avoid recalculations
  const allTransactions = useMemo<Transaction[]>(() => [
    ...incomeData.map((income): Transaction => ({
      id: `income-${income.Name}-${income.Date.getTime()}`,
      type: 'income',
      name: income.Name,
      category: income.Sources,
      amount: income.Amount,
      date: income.Date,
      formattedDate: income.formattedDate || income.Date.toLocaleDateString(),
      notes: '',
    })),
    ...expenseData.map((expense): Transaction => ({
      id: `expense-${expense.Name}-${expense.Date.getTime()}`,
      type: 'expense',
      name: expense.Name,
      category: expense.Categories,
      amount: expense.Amount,
      date: expense.Date,
      formattedDate: expense.formattedDate || expense.Date.toLocaleDateString(),
      notes: expense.Notes,
    })),
  ], [incomeData, expenseData]);

  // Apply filters with useMemo to avoid recalculations
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      // Apply type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          transaction.name.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [allTransactions, typeFilter, searchQuery]);

  // Apply sorting with useMemo to avoid recalculations
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else if (sortField === 'amount') {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else {
        const aValue = String(a[sortField]).toLowerCase();
        const bValue = String(b[sortField]).toLowerCase();
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }, [filteredTransactions, sortField, sortDirection]);

  // Initial sort when component mounts or data changes
  useEffect(() => {
    // Default sort by date descending
    setSortField('date');
    setSortDirection('desc');
  }, [incomeData, expenseData]);

  // Calculate pagination values
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, sortField, sortDirection]);

  // Column headers with sort indicators
  const SortHeader = ({ field, label }: { field: keyof Transaction; label: string }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Transactions</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, category, notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-[180px] space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as 'all' | 'income' | 'expense')}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="type" label="Type" />
              <SortHeader field="name" label="Name" />
              <SortHeader field="category" label="Category" />
              <SortHeader field="amount" label="Amount" />
              <SortHeader field="date" label="Date" />
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.name}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.formattedDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={transaction.notes}>
                    {transaction.notes}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {totalPages <= 5 ? (
              pageButtons
            ) : (
              <>
                {currentPage > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>
                    1
                  </Button>
                )}
                {currentPage > 2 && <div className="px-2 py-1">...</div>}
                
                {currentPage > 1 && currentPage < totalPages && (
                  <Button variant="default" size="sm">
                    {currentPage}
                  </Button>
                )}
                
                {currentPage < totalPages - 1 && <div className="px-2 py-1">...</div>}
                {currentPage < totalPages && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
