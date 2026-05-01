// src/components/products/ProductImport.tsx
import { useState, useRef } from 'react';
import { Upload, FileText, Download, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PRODUCT_CSV_TEMPLATE, PRODUCT_CSV_HEADERS } from '@/schemas/productSchemas';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface ProductImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImport({ open, onOpenChange }: ProductImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importProducts } = useProducts();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
      const isValidType =
        validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv');

      if (!isValidType) {
        toast.error('Please select a valid CSV file');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await importProducts(file);
      clearInterval(progressInterval);
      setImportProgress(100);

      setImportResult({
        success: true,
        count: result.count ?? 0,
        skipped: result.skipped ?? 0,
        errors: [],
      });

      toast.success(`Successfully imported ${result.count} products`);
      
      // Reset after a delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setImportResult({
        success: false,
        count: 0,
        skipped: 0,
        errors: [error.message ?? 'Import failed'],
      });
      toast.error(`Failed to import products: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([PRODUCT_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Products from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once. Download the template to see the
            required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Download CSV Template</p>
                  <p className="text-muted-foreground text-sm">
                    Use this template to ensure your CSV file has the correct format
                  </p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select CSV File</label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,application/csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
                disabled={isImporting}
              />
              <label
                htmlFor="csv-file-input"
                className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input p-6 hover:bg-muted"
              >
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-muted-foreground text-xs">CSV file (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* CSV Headers Info */}
          {!file && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Required CSV columns:</p>
                <p className="text-xs">
                  {PRODUCT_CSV_HEADERS.join(', ')}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing products...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.success ? 'default' : 'destructive'}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {importResult.success ? (
                  <div>
                    <p className="font-medium">Import completed successfully!</p>
                    <p className="text-sm mt-1">
                      {importResult.count} product{importResult.count !== 1 ? 's' : ''} imported
                      {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Import failed</p>
                    {importResult.errors.length > 0 && (
                      <ul className="mt-1 list-disc list-inside text-sm">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {importResult?.success ? 'Close' : 'Cancel'}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting || importResult?.success}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

