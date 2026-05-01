// src/components/customers/CustomerImport.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { importCustomersSchema, CUSTOMER_CSV_TEMPLATE } from '@/schemas/customerSchemas';
import type { ImportCustomersFormData } from '@/schemas/customerSchemas';

interface CustomerImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<{ count: number; skipped: number; error: Error | null }>;
}

export function CustomerImport({ open, onOpenChange, onImport }: CustomerImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    count: number;
    skipped: number;
    error: Error | null;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ImportCustomersFormData>({
    resolver: zodResolver(importCustomersSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CUSTOMER_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customer-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: ImportCustomersFormData) => {
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await onImport(file);
      setImportResult(result);
      
      if (result.error) {
        // Error already handled
      } else {
        // Reset form after successful import
        setTimeout(() => {
          reset();
          setFile(null);
          setImportResult(null);
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        count: 0,
        skipped: 0,
        error: error as Error,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      reset();
      setFile(null);
      setImportResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple customers at once. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Need a template?
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,text/csv"
              {...register('file', {
                onChange: handleFileChange,
              })}
              disabled={isImporting}
            />
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file.message}</p>
            )}
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-xs">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing customers...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Import Result */}
          {importResult && !isImporting && (
            <Alert
              variant={importResult.error ? 'destructive' : 'default'}
            >
              {importResult.error ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResult.error.message ?? 'Failed to import customers'}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {importResult.count} customer(s)
                    {importResult.skipped > 0 && (
                      <span className="block mt-1">
                        {importResult.skipped} row(s) were skipped due to invalid data
                      </span>
                    )}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            {importResult && !importResult.error ? 'Close' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Customers
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

