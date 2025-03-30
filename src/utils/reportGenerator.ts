
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
} from './finance';

export const generateReport = (incomeData: IncomeData[], expenseData: ExpenseData[]): void => {
  // Initialize PDF document
  const doc = new jsPDF();
  const totalIncome = calculateTotalIncome(incomeData);
  const totalExpenses = calculateTotalExpenses(expenseData);
  const netSavings = calculateNetSavings(totalIncome, totalExpenses);
  const topCategories = getTopSpendingCategories(expenseData);
  const notableTransactions = getNotableTransactions(incomeData, expenseData);
  const yearlySummary = getYearlySummary(incomeData, expenseData);

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
  doc.text('Financial Report', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Add summary section
  addSectionTitle('Summary', 40);
  doc.setFontSize(12);
  doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 20, 50);
  doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 20, 58);
  doc.text(`Net Savings: ${formatCurrency(netSavings)}`, 20, 66);
  doc.text(`Savings Rate: ${totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) + '%' : 'N/A'}`, 20, 74);

  // Add top spending categories section
  addSectionTitle('Top Spending Categories', 90);
  const topCategoriesData = topCategories.map((cat, index) => [
    `${index + 1}. ${cat.category}`,
    formatCurrency(cat.amount),
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
    formatCurrency(item.Amount),
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
    formatCurrency(item.Amount),
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
    formatCurrency(item.income),
    formatCurrency(item.expenses),
    formatCurrency(item.income - item.expenses),
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

  // Monthly breakdown of current/latest year
  const yearlyTableEndY = (doc as any).lastAutoTable.finalY + 15;
  
  // Find the latest year with data
  const latestYear = Math.max(...yearlySummary.map(item => item.year));
  
  addSectionTitle(`Monthly Breakdown (${latestYear})`, yearlyTableEndY);
  
  // Filter data for the latest year
  const currentYearIncome = incomeData.filter(item => item.year === latestYear);
  const currentYearExpenses = expenseData.filter(item => item.year === latestYear);
  
  // Group by month
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthIncome = currentYearIncome
      .filter(item => item.month === i)
      .reduce((sum, item) => sum + item.Amount, 0);
      
    const monthExpenses = currentYearExpenses
      .filter(item => item.month === i)
      .reduce((sum, item) => sum + item.Amount, 0);
      
    const savings = monthIncome - monthExpenses;
    const savingsRate = monthIncome > 0 ? (savings / monthIncome * 100).toFixed(1) + '%' : 'N/A';
    
    return [
      new Date(latestYear, i).toLocaleString('default', { month: 'long' }),
      formatCurrency(monthIncome),
      formatCurrency(monthExpenses),
      formatCurrency(savings),
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
  doc.save('financial-report.pdf');
};

export default generateReport;
