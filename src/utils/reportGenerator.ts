
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  IncomeData, 
  ExpenseData, 
  formatCurrency, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateNetSavings,
  getTopSpendingCategories,
  getNotableTransactions,
  getYearlySummary,
  filterIncomeByDateRange,
  filterExpensesByDateRange,
} from './finance';

export const generateReport = (
  incomeData: IncomeData[], 
  expenseData: ExpenseData[],
  year: number = new Date().getFullYear()
): void => {
  // Filter data for the selected year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  const yearIncomeData = filterIncomeByDateRange(incomeData, startDate, endDate);
  const yearExpenseData = filterExpensesByDateRange(expenseData, startDate, endDate);
  
  // Initialize PDF document
  const doc = new jsPDF();
  const totalIncome = calculateTotalIncome(yearIncomeData);
  const totalExpenses = calculateTotalExpenses(yearExpenseData);
  const netSavings = calculateNetSavings(totalIncome, totalExpenses);
  const topCategories = getTopSpendingCategories(yearExpenseData);
  const notableTransactions = getNotableTransactions(yearIncomeData, yearExpenseData);
  const yearlySummary = getYearlySummary(incomeData, expenseData);

  // Format currency without symbol for reports
  const formatAmount = (amount: number): string => formatCurrency(amount, false);

  // Helper function to add a section title
  const addSectionTitle = (text: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(text, 14, y);
    doc.setLineWidth(0.5);
    doc.line(14, y + 1, 196, y + 1);
    doc.setFontSize(10);
  };

  // Add header
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text(`Financial Report - ${year}`, 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Add summary section
  addSectionTitle('Summary', 40);
  doc.setFontSize(12);
  doc.text(`Total Income: ${formatAmount(totalIncome)}`, 20, 50);
  doc.text(`Total Expenses: ${formatAmount(totalExpenses)}`, 20, 58);
  doc.text(`Net Savings: ${formatAmount(netSavings)}`, 20, 66);
  doc.text(`Savings Rate: ${totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) + '%' : 'N/A'}`, 20, 74);

  // Add top spending categories section
  addSectionTitle('Top Spending Categories', 90);
  const topCategoriesData = topCategories.map((cat, index) => [
    `${index + 1}. ${cat.category}`,
    formatAmount(cat.amount),
    `${((cat.amount / totalExpenses) * 100).toFixed(1)}%`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Category', 'Amount', 'Percentage']],
    body: topCategoriesData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  // Add notable transactions section
  const tableEndY = (doc as any).lastAutoTable.finalY + 15;
  addSectionTitle('Notable Transactions', tableEndY);
  
  // Top income transactions
  doc.text('Highest Income Transactions:', 20, tableEndY + 15);
  const topIncomeData = notableTransactions.topIncome.map((item, index) => [
    `${index + 1}. ${item.Name}`,
    item.Sources,
    formatAmount(item.Amount),
    item.formattedDate || new Date(item.Date).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    startY: tableEndY + 20,
    head: [['Name', 'Source', 'Amount', 'Date']],
    body: topIncomeData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 129, 81] }
  });
  
  // Top expense transactions
  const incomeTableEndY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Highest Expense Transactions:', 20, incomeTableEndY);
  const topExpenseData = notableTransactions.topExpenses.map((item, index) => [
    `${index + 1}. ${item.Name}`,
    item.Categories,
    formatAmount(item.Amount),
    item.formattedDate || new Date(item.Date).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    startY: incomeTableEndY + 5,
    head: [['Name', 'Category', 'Amount', 'Date']],
    body: topExpenseData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [200, 70, 70] }
  });

  // Add a new page for yearly and monthly breakdown
  doc.addPage();
  
  // Yearly summary
  addSectionTitle('Yearly Summary', 20);
  const yearlyData = yearlySummary.map(item => [
    item.year.toString(),
    formatAmount(item.income),
    formatAmount(item.expenses),
    formatAmount(item.income - item.expenses),
    item.income > 0 ? ((item.income - item.expenses) / item.income * 100).toFixed(1) + '%' : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Year', 'Income', 'Expenses', 'Savings', 'Savings Rate']],
    body: yearlyData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  // Monthly breakdown of selected year
  const yearlyTableEndY = (doc as any).lastAutoTable.finalY + 15;
  
  addSectionTitle(`Monthly Breakdown (${year})`, yearlyTableEndY);
  
  // Group by month for the selected year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIncome = yearIncomeData
      .filter(item => item.month === i)
      .reduce((sum, item) => sum + item.Amount, 0);
      
    const monthExpenses = yearExpenseData
      .filter(item => item.month === i)
      .reduce((sum, item) => sum + item.Amount, 0);
      
    const savings = monthIncome - monthExpenses;
    const savingsRate = monthIncome > 0 ? (savings / monthIncome * 100).toFixed(1) + '%' : 'N/A';
    
    return [
      new Date(year, i).toLocaleString('default', { month: 'long' }),
      formatAmount(monthIncome),
      formatAmount(monthExpenses),
      formatAmount(savings),
      savingsRate
    ];
  });
  
  autoTable(doc, {
    startY: yearlyTableEndY + 10,
    head: [['Month', 'Income', 'Expenses', 'Savings', 'Savings Rate']],
    body: monthlyData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  // Add all transactions for the selected year
  doc.addPage();
  
  // Income transactions
  addSectionTitle(`All Income Transactions (${year})`, 20);
  const allIncomeData = yearIncomeData.map((item, index) => [
    `${index + 1}`,
    item.Name,
    item.Sources,
    formatAmount(item.Amount),
    item.formattedDate || new Date(item.Date).toLocaleDateString()
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['#', 'Name', 'Source', 'Amount', 'Date']],
    body: allIncomeData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [71, 129, 81] }
  });
  
  // Expense transactions (on a new page if needed)
  const incomeAllTableEndY = (doc as any).lastAutoTable.finalY + 15;
  
  let startY: number;
  if (incomeAllTableEndY > doc.internal.pageSize.height - 40) {
    doc.addPage();
    addSectionTitle(`All Expense Transactions (${year})`, 20);
    startY = 30;
  } else {
    addSectionTitle(`All Expense Transactions (${year})`, incomeAllTableEndY);
    startY = incomeAllTableEndY + 10;
  }
  
  const allExpenseData = yearExpenseData.map((item, index) => [
    `${index + 1}`,
    item.Name,
    item.Categories,
    formatAmount(item.Amount),
    item.formattedDate || new Date(item.Date).toLocaleDateString(),
    item.Notes
  ]);
  
  autoTable(doc, {
    startY,
    head: [['#', 'Name', 'Category', 'Amount', 'Date', 'Notes']],
    body: allExpenseData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [200, 70, 70] }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Fiscal Visuals Financial Report',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  doc.save(`financial-report-${year}.pdf`);
};

export default generateReport;
