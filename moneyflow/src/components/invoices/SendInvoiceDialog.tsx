// src/components/invoices/SendInvoiceDialog.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Mail, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency, formatDate } from '@/lib/invoiceFormatters';
import { handleError } from '@/lib/errorHandler';
import type { InvoiceWithDetails } from '@/types/invoice.types';

interface SendInvoiceDialogProps {
  invoice: InvoiceWithDetails;
  open: boolean;
  onClose: () => void;
}

interface SendInvoiceForm {
  email: string;
  cc_emails?: string;
  subject: string;
  message: string;
  attach_pdf: boolean;
  send_copy_to_self: boolean;
}

export function SendInvoiceDialog({ invoice, open, onClose }: SendInvoiceDialogProps) {
  const { sendInvoice } = useInvoices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const defaultMessage = `Dear ${invoice.customer.name},

Please find attached invoice ${invoice.invoice_number} for your review.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${formatDate(invoice.invoice_date)}
- Due Date: ${formatDate(invoice.due_date)}
- Amount Due: ${formatCurrency(invoice.amount_due)}

${invoice.notes ? `\nNotes:\n${invoice.notes}` : ''}

${invoice.terms ? `\nPayment Terms:\n${invoice.terms}` : ''}

If you have any questions regarding this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
Your Company`;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SendInvoiceForm>({
    defaultValues: {
      email: invoice.customer.email ?? '',
      cc_emails: '',
      subject: `Invoice ${invoice.invoice_number} from Your Company`,
      message: defaultMessage,
      attach_pdf: true,
      send_copy_to_self: false,
    },
  });

  const watchEmail = watch('email');
  const watchAttachPdf = watch('attach_pdf');
  const watchSendCopy = watch('send_copy_to_self');

  const onSubmit = async (data: SendInvoiceForm) => {
    setIsSubmitting(true);
    try {
      await sendInvoice({
        id: invoice.id,
        email: data.email,
        message: data.message,
      });
      setSendSuccess(true);
      setTimeout(() => {
        reset();
        setSendSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      handleError(error, 'SendInvoiceDialog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSendSuccess(false);
    onClose();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-indigo-600" />
            Send Invoice
          </DialogTitle>
          <DialogDescription>
            Send invoice {invoice.invoice_number} to your customer via email
          </DialogDescription>
        </DialogHeader>

        {sendSuccess ? (
          <div className="py-8">
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-900">Invoice Sent Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                The invoice has been sent to {watchEmail}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Invoice Summary */}
            <div className="bg-muted space-y-2 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{invoice.invoice_number}</div>
                  <div className="text-muted-foreground text-sm">
                    Customer: {invoice.customer.name}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.due_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recipient Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || 'Invalid email address',
                })}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              {!invoice.customer.email && (
                <Alert className="border-orange-300 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-700">
                    This customer doesn't have an email address on file. Please enter one above.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* CC Emails */}
            <div className="space-y-2">
              <Label htmlFor="cc_emails">
                CC (Optional)
                <span className="text-muted-foreground ml-2 text-xs">
                  Separate multiple emails with commas
                </span>
              </Label>
              <Input
                id="cc_emails"
                type="text"
                placeholder="cc1@example.com, cc2@example.com"
                {...register('cc_emails')}
              />
              <p className="text-muted-foreground text-xs">
                Additional recipients who should receive a copy of this invoice
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                type="text"
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && (
                <p className="text-destructive text-sm">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message *
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="ml-2 h-auto p-0 text-xs"
                  onClick={() => setValue('message', defaultMessage)}
                >
                  Reset to default
                </Button>
              </Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                rows={10}
                className="font-mono text-sm"
                {...register('message', { required: 'Message is required' })}
              />
              {errors.message && (
                <p className="text-destructive text-sm">{errors.message.message}</p>
              )}
              <p className="text-muted-foreground text-xs">
                Tip: Personalize your message to make it more engaging
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="text-sm font-medium">Sending Options</div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="attach_pdf"
                  checked={watchAttachPdf}
                  onCheckedChange={(checked) => setValue('attach_pdf', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="attach_pdf"
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Attach PDF invoice
                  </label>
                  <p className="text-muted-foreground text-xs">
                    Include the invoice as a PDF attachment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="send_copy"
                  checked={watchSendCopy}
                  onCheckedChange={(checked) => setValue('send_copy_to_self', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="send_copy"
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send me a copy
                  </label>
                  <p className="text-muted-foreground text-xs">
                    Receive a copy of this email in your inbox
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <Alert className="border-indigo-300 bg-indigo-50">
              <FileText className="h-4 w-4 text-indigo-600" />
              <AlertTitle className="text-indigo-900">Email will include:</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-indigo-700">
                  {watchAttachPdf && <li>Invoice PDF attachment</li>}
                  <li>Payment link (if online payments are enabled)</li>
                  <li>Your business details and contact information</li>
                  <li>Invoice summary and payment instructions</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !validateEmail(watchEmail)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invoice
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
