// src/components/invoices/InvoicePreview.tsx
import { useState } from 'react';
import { Download, Printer, Mail, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InvoiceTemplate } from './InvoiceTemplate';
import { SendInvoiceDialog } from './SendInvoiceDialog';
import { formatCurrency, formatDate } from '@/lib/invoiceFormatters';
import type { InvoiceWithDetails } from '@/types/invoice.types';
import { useInvoices } from '@/hooks/useInvoices';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  invoice: InvoiceWithDetails;
  onClose?: () => void;
  showActions?: boolean;
}

/**
 * InvoicePreview - Component for previewing invoice before sending/downloading
 * 
 * @example
 * <InvoicePreview invoice={invoice} showActions onClose={() => setShowPreview(false)} />
 */
export function InvoicePreview({ 
  invoice, 
  onClose,
  showActions = true 
}: InvoicePreviewProps) {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { downloadInvoicePDF } = useInvoices();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Call API to generate and download PDF
      await downloadInvoicePDF(invoice.id);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      handleError(error, 'InvoicePreview.downloadPDF');
      toast.error('Failed to download PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-0">
      {/* Action Bar */}
      {showActions && (
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold">Invoice Preview</h2>
            <p className="text-muted-foreground text-sm">
              Review your invoice before sending or downloading
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="print:hidden"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowSendDialog(true)}
              className="print:hidden"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="print:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Invoice Template */}
      <div className="print:block">
        <InvoiceTemplate invoice={invoice} />
      </div>

      {/* Send Invoice Dialog */}
      {showSendDialog && (
        <SendInvoiceDialog
          invoice={invoice}
          open={showSendDialog}
          onClose={() => setShowSendDialog(false)}
        />
      )}
    </div>
  );
}

