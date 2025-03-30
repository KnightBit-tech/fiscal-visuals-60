
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { processIncomeData, processExpenseData } from '@/utils/dataProcessing';

interface FileUploadProps {
  onIncomeDataLoaded: (data: any[]) => void;
  onExpenseDataLoaded: (data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onIncomeDataLoaded, onExpenseDataLoaded }) => {
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
  const [expenseFile, setExpenseFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleIncomeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIncomeFile(e.target.files[0]);
    }
  };

  const handleExpenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExpenseFile(e.target.files[0]);
    }
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleUpload = async () => {
    if (!incomeFile && !expenseFile) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Process income data if available
      if (incomeFile) {
        const rawIncomeData = await parseCSV(incomeFile);
        const processedIncomeData = processIncomeData(rawIncomeData);
        onIncomeDataLoaded(processedIncomeData);
        toast.success('Income data loaded successfully');
      }

      // Process expense data if available
      if (expenseFile) {
        const rawExpenseData = await parseCSV(expenseFile);
        const processedExpenseData = processExpenseData(rawExpenseData);
        onExpenseDataLoaded(processedExpenseData);
        toast.success('Expense data loaded successfully');
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Error parsing CSV file. Please check the file format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Income Data</span>
            {incomeFile && <CheckCircle2 className="text-finance-income h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
            <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload your income CSV file
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              (Columns: Name, Sources, Amount, Date)
            </p>
            <input
              type="file"
              id="income-file"
              accept=".csv"
              onChange={handleIncomeFileChange}
              className="hidden"
            />
            <label htmlFor="income-file">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            {incomeFile && (
              <p className="mt-2 text-sm">{incomeFile.name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Expense Data</span>
            {expenseFile && <CheckCircle2 className="text-finance-expense h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
            <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload your expense CSV file
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              (Columns: Name, Categories, Amount, Date, Expenses, Notes)
            </p>
            <input
              type="file"
              id="expense-file"
              accept=".csv"
              onChange={handleExpenseFileChange}
              className="hidden"
            />
            <label htmlFor="expense-file">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            {expenseFile && (
              <p className="mt-2 text-sm">{expenseFile.name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-center">
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || (!incomeFile && !expenseFile)}
          className="w-full md:w-1/3"
        >
          {isUploading ? 'Processing...' : 'Upload & Process Files'}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
